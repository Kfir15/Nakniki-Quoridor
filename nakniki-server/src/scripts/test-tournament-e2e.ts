/**
 * FULL end-to-end tournament test: REST routes + controllers + sockets,
 * exercised through a RUNNING server (nothing is called directly).
 *
 * It simulates 4 real players:
 *   - signs them in over REST
 *   - connects 4 Socket.IO clients with their tokens
 *   - creates + fills a tournament over REST
 *   - verifies all 4 receive TOURNAMENT_MATCH_READY pushes
 *   - checks everyone in over sockets, plays the bracket out via abandons
 *   - verifies the final standings over REST
 *
 * HOW TO RUN:
 *   1. Terminal 1:  npm run dev            (server must be up on :3174)
 *   2. Terminal 2:  npx ts-node src/scripts/test-tournament-e2e.ts
 *   (no setup needed — 4 dedicated e2e accounts are created on first run)
 *
 * NOTE: games are resolved by abandoning (forfeit) — that drives the same
 * game-over -> advancePlayer pipeline as a real win, without needing to
 * compute legal Quoridor moves. Actual move gameplay is covered by the UI.
 * The no-show forfeit timer (10 min) is NOT exercised here — test manually.
 */
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { SOCKET_EVENTS as S, TournamentStatus, TournamentMatchStatus } from '@nakniki/shared';

const SERVER = 'http://localhost:3174';
const BASE = `${SERVER}/api`;

// dedicated e2e accounts — created automatically on the first run,
// reused (signed in) on every run after that
const TEST_USERS = [
    { email: 'e2e.player1@nakniki.test', password: 'E2e-test-pass-1!', username: 'e2e_player1' },
    { email: 'e2e.player2@nakniki.test', password: 'E2e-test-pass-2!', username: 'e2e_player2' },
    { email: 'e2e.player3@nakniki.test', password: 'E2e-test-pass-3!', username: 'e2e_player3' },
    { email: 'e2e.player4@nakniki.test', password: 'E2e-test-pass-4!', username: 'e2e_player4' },
];

// sign in; if the account doesn't exist yet, sign it up first
async function signInOrSignUp(u: { email: string; password: string; username: string }) {
    const tryIn = await axios.post(`${BASE}/auth/signin`,
        { email: u.email, password: u.password }, { validateStatus: () => true });
    if (tryIn.status === 200) return tryIn.data;

    const up = await axios.post(`${BASE}/auth/signup`,
        { email: u.email, password: u.password, username: u.username }, { validateStatus: () => true });
    if (up.status !== 201) {
        throw new Error(`Could not sign in OR sign up ${u.email}: ${JSON.stringify(up.data)}`);
    }

    const again = await axios.post(`${BASE}/auth/signin`, { email: u.email, password: u.password });
    return again.data;
}

// ---------- check helpers ----------
let passed = 0;
let failed = 0;

function check(name: string, cond: boolean, extra: string = '') {
    if (cond) { passed++; console.log(`  PASS  ${name}`); }
    else { failed++; console.log(`  FAIL  ${name} ${extra}`); }
}

// wait for a single socket event, or fail loudly after a timeout
function waitForEvent<T = any>(socket: Socket, event: string, label: string, timeoutMs = 10000): Promise<T> {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(
            () => reject(new Error(`Timed out waiting for "${event}" (${label})`)), timeoutMs);
        socket.once(event, (data: T) => { clearTimeout(timer); resolve(data); });
    });
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

interface Player {
    email: string;
    userId: string;
    token: string;
    socket: Socket;
    api: ReturnType<typeof axios.create>;
}

async function main() {
    // ---- 1. sign everyone in over REST ----
    console.log('\n=== 1. Sign in 4 players (REST) ===');
    const players: Player[] = [];
    for (const u of TEST_USERS) {
        const data = await signInOrSignUp(u);
        players.push({
            email: u.email,
            userId: data.user.id,
            token: data.access_token,
            socket: null as any,
            api: axios.create({
                baseURL: BASE,
                headers: { Authorization: `Bearer ${data.access_token}` },
                validateStatus: () => true,   // we assert status codes ourselves
            }),
        });
    }
    check('all 4 players signed in', players.every(p => p.token && p.userId));

    // ---- 2. connect 4 sockets ----
    console.log('\n=== 2. Connect 4 sockets ===');
    for (const p of players) {
        p.socket = io(SERVER, { auth: { token: p.token }, transports: ['websocket'] });
        await waitForEvent(p.socket, 'connect', p.email);
    }
    check('all 4 sockets connected & authenticated', players.every(p => p.socket.connected));

    // listen for the round-1 match notifications BEFORE they can fire
    const readyPromises = players.map(p =>
        waitForEvent<{ gameId: string }>(p.socket, S.SERVER.TOURNAMENT_MATCH_READY, `R1 ready: ${p.email}`));

    // ---- 3. create + list + join over REST ----
    console.log('\n=== 3. Create, list and fill the tournament (REST) ===');
    const createRes = await players[0]!.api.post('/tournaments/', { size: 4, name: 'E2E Cup2' });
    check('POST /tournaments returns 201 + id', createRes.status === 201 && !!createRes.data.id,
        `(got ${createRes.status})`);
    const tid = createRes.data.id;

    const listRes = await players[0]!.api.get('/tournaments/');
    check('GET /tournaments lists the new tournament',
        listRes.status === 200 && listRes.data.some((t: any) => t.id === tid));

    const badCreate = await players[0]!.api.post('/tournaments/', { size: 5, name: 'nope' });
    check('invalid size is rejected with 400', badCreate.status === 400);

    const noAuth = await axios.get(`${BASE}/tournaments/`, { validateStatus: () => true });
    check('request without token is rejected', noAuth.status === 401 || noAuth.status === 403,
        `(got ${noAuth.status})`);

    for (const p of players) {
        const joinRes = await p.api.post(`/tournaments/${tid}/join`);
        check(`join as ${p.email} -> 200`, joinRes.status === 200, `(got ${joinRes.status})`);
    }

    const fifthJoin = await players[0]!.api.post(`/tournaments/${tid}/join`);
    check('5th join rejected (tournament is full)', fifthJoin.status === 400,
        `(got ${fifthJoin.status}: ${JSON.stringify(fifthJoin.data)})`);

    // ---- 4. everyone is told about their round-1 match ----
    console.log('\n=== 4. TOURNAMENT_MATCH_READY pushes ===');
    const readies = await Promise.all(readyPromises);
    check('all 4 players received TOURNAMENT_MATCH_READY', readies.every(r => !!r.gameId));

    // players sharing a gameId are opponents — group them into the two round-1 games
    const byGame = new Map<string, Player[]>();
    readies.forEach((r, i) => {
        const list = byGame.get(r.gameId) ?? [];
        list.push(players[i]!);
        byGame.set(r.gameId, list);
    });
    check('exactly 2 distinct round-1 games, 2 players each',
        byGame.size === 2 && [...byGame.values()].every(ps => ps.length === 2),
        `(got ${byGame.size} games)`);

    const listAfter = await players[0]!.api.get('/tournaments/');
    check('started tournament no longer listed as open',
        !listAfter.data.some((t: any) => t.id === tid));

    const details1 = await players[0]!.api.get(`/tournaments/${tid}`);
    const r1 = details1.data.matches.filter((m: any) => m.round_number === 1);
    check('details: tournament IN_PROGRESS with 3 matches',
        details1.data.tournament.status === TournamentStatus.IN_PROGRESS && details1.data.matches.length === 3);
    check('details: round-1 matches IN_PROGRESS and linked to real matches',
        r1.every((m: any) => m.status === TournamentMatchStatus.IN_PROGRESS && m.match_id));

    // ---- 5. check in over sockets, then resolve round 1 by forfeits ----
    console.log('\n=== 5. Round 1: check in + play out (sockets) ===');
    const winners: Player[] = [];

    for (const [gameId, pair] of byGame) {
        const [quitter, winner] = [pair[0]!, pair[1]!];

        // register all expectations BEFORE acting
        const joined = pair.map(p => waitForEvent(p.socket, S.SERVER.LOBBY_JOINED, `joined: ${p.email}`));
        const started = pair.map(p => waitForEvent(p.socket, S.SERVER.GAME_STARTED, `started: ${p.email}`));

        pair.forEach(p => p.socket.emit(S.CLIENT.JOIN_TOURNAMENT_MATCH, { gameId }));
        await Promise.all(joined);
        await Promise.all(started);
        check(`game ${gameId}: both checked in, game started`, true);

        // the winner of this game will be told about the final later;
        // the abandoned-notice goes to the remaining player
        const abandonedSeen = waitForEvent(winner.socket, S.SERVER.GAME_ABANDONED, `abandoned: ${winner.email}`);
        quitter.socket.emit(S.CLIENT.MP_ABANDON_GAME);
        await abandonedSeen;
        check(`game ${gameId}: ${quitter.email} forfeited, ${winner.email} advances`, true);
        winners.push(winner);
    }

    // ---- 6. the final ----
    console.log('\n=== 6. The final (sockets) ===');
    // both winners should be notified of the final (registered before the last forfeit resolves fully)
    const finalReadies = await Promise.all(winners.map(w =>
        waitForEvent<{ gameId: string }>(w.socket, S.SERVER.TOURNAMENT_MATCH_READY, `final ready: ${w.email}`)));
    check('both winners notified of the final, same gameId',
        finalReadies[0]!.gameId === finalReadies[1]!.gameId);

    const finalGameId = finalReadies[0]!.gameId;
    const [runnerUp, champion] = [winners[0]!, winners[1]!];

    const fJoined = winners.map(w => waitForEvent(w.socket, S.SERVER.LOBBY_JOINED, `final join: ${w.email}`));
    const fStarted = winners.map(w => waitForEvent(w.socket, S.SERVER.GAME_STARTED, `final start: ${w.email}`));
    winners.forEach(w => w.socket.emit(S.CLIENT.JOIN_TOURNAMENT_MATCH, { gameId: finalGameId }));
    await Promise.all(fJoined);
    await Promise.all(fStarted);

    const fAbandoned = waitForEvent(champion.socket, S.SERVER.GAME_ABANDONED, `final abandon: ${champion.email}`);
    runnerUp.socket.emit(S.CLIENT.MP_ABANDON_GAME);
    await fAbandoned;
    check(`final: ${runnerUp.email} forfeited -> champion is ${champion.email}`, true);

    // ---- 7. final standings over REST (poll: DB writes finish after the socket event) ----
    console.log('\n=== 7. Verify final standings (REST) ===');
    let finalDetails: any = null;
    for (let i = 0; i < 10; i++) {
        const res = await players[0]!.api.get(`/tournaments/${tid}`);
        if (res.data.tournament?.status === TournamentStatus.FINISHED) { finalDetails = res.data; break; }
        await sleep(500);
    }
    check('tournament reached FINISHED', !!finalDetails);
    if (finalDetails) {
        check('winner_id is the champion', finalDetails.tournament.winner_id === champion.userId);
        check('all matches FINISHED',
            finalDetails.matches.every((m: any) => m.status === TournamentMatchStatus.FINISHED));
        const placements = finalDetails.participants.map((p: any) => p.placement).sort();
        check('placements are 1,2,3,3', JSON.stringify(placements) === JSON.stringify([1, 2, 3, 3]),
            `(got ${placements})`);
        const champRow = finalDetails.participants.find((p: any) => p.user_id === champion.userId);
        check('champion has placement 1 and is not eliminated',
            champRow?.placement === 1 && champRow?.eliminated === false);
    }

    // ---- summary ----
    console.log(`\n=== DONE: ${passed} passed, ${failed} failed ===`);
    console.log(`Tournament left in DB for inspection: ${tid}`);
    players.forEach(p => p.socket.disconnect());
    process.exit(failed > 0 ? 1 : 0);
}

main().catch(e => {
    console.error('\nE2E run crashed:', e.message ?? e);
    process.exit(1);
});
