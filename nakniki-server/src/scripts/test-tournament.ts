/**
 * Scratch test for the tournament DB layer + TournamentService.
 *
 * Run from the nakniki-server folder:
 *     npx ts-node src/scripts/test-tournament.ts
 *
 * What it does:
 *   1. Grabs 4 real users from the users table
 *   2. Creates a 4-player tournament, joins everyone
 *   3. Tests the guards (duplicate join, double start)
 *   4. Starts the tournament and verifies the bracket structure
 *   5. Plays the whole tournament via advancePlayer and verifies
 *      winners advance to the right slots, placements, and the final result
 *
 * It writes REAL rows to Supabase. Each run creates a fresh tournament.
 * To clean up: delete the tournament row in the dashboard (participants
 * and matches are wiped automatically via on delete cascade).
 */
import { supabase } from '../lib/supabase';
import { GameManager } from '../game_model/GameManager';
import { TournamentService } from '../services/TournamentService';
import { TournamentStatus, TournamentMatchStatus } from '@nakniki/shared';

const SIZE = 4;

// ---------- tiny check helpers ----------
let passed = 0;
let failed = 0;

function check(name: string, cond: boolean, extra: string = '') {
    if (cond) {
        passed++;
        console.log(`  PASS  ${name}`);
    } else {
        failed++;
        console.log(`  FAIL  ${name} ${extra}`);
    }
}

async function expectThrow(name: string, fn: () => Promise<unknown>) {
    try {
        await fn();
        check(name, false, '(expected an error, but none was thrown)');
    } catch (e: any) {
        check(`${name} -> threw: "${e.message ?? e}"`, true);
    }
}

// ---------- direct DB readers (verify what the service ACTUALLY wrote) ----------
async function getBracket(tournamentId: string): Promise<any[]> {
    const { data, error } = await supabase
        .from('tournament_matches')
        .select(`
            id, round_number, slot_in_round, status, match_id, winner_id,
            next_tournament_match_id, next_slot, player_1_id, player_2_id,
            player_1:player_1_id(username), player_2:player_2_id(username)
        `)
        .eq('tournament_id', tournamentId)
        .order('round_number', { ascending: true })
        .order('slot_in_round', { ascending: true });
    if (error) throw error;
    return data as any[];
}

async function getParticipants(tournamentId: string): Promise<any[]> {
    const { data, error } = await supabase
        .from('tournament_participants')
        .select('user_id, seed, placement, eliminated, user:user_id(username, elo_rating)')
        .eq('tournament_id', tournamentId)
        .order('seed', { ascending: true });
    if (error) throw error;
    return data as any[];
}

async function getTournamentRow(tournamentId: string): Promise<any> {
    const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', tournamentId)
        .single();
    if (error) throw error;
    return data;
}

function printBracket(matches: any[]) {
    for (const m of matches) {
        const p1 = m.player_1?.username ?? '---';
        const p2 = m.player_2?.username ?? '---';
        const next = m.next_tournament_match_id
            ? `next=${String(m.next_tournament_match_id).slice(0, 8)} (slot ${m.next_slot})`
            : 'FINAL';
        const win = m.winner_id ? ` winner=${String(m.winner_id).slice(0, 8)}` : '';
        console.log(`    R${m.round_number} slot ${m.slot_in_round} [${m.status}]  ${p1} vs ${p2}  ${next}${win}`);
    }
}

// ---------- the test ----------
async function main() {
    const service = new TournamentService(new GameManager());

    // ---- 0. fetch real users to play with ----
    console.log('\n=== 0. Fetching test users ===');
    const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, username, elo_rating')
        .limit(SIZE + 1); // one extra for the "tournament is full" test
    if (usersError) throw usersError;
    if (!users || users.length < SIZE) {
        throw new Error(`Need at least ${SIZE} users in the users table, found ${users?.length ?? 0}. ` +
            `Sign up a few accounts first.`);
    }
    const players = users.slice(0, SIZE);
    const extraUser = users.length > SIZE ? users[SIZE] : null;
    for (const u of players) console.log(`    ${u.username} (elo ${u.elo_rating})`);

    // ---- 1. create + join ----
    console.log('\n=== 1. Create tournament & join players ===');
    // players[0] is the creator, so they're auto-joined by createTournament
    const tournamentId = await service.createTournament(SIZE, `TEST ${new Date().toISOString()}`, players[0]!.id);
    console.log(`    tournament id: ${tournamentId}`);

    let t = await getTournamentRow(tournamentId);
    check('new tournament status is REGISTERING', t.status === TournamentStatus.REGISTERING, `(got ${t.status})`);

    // creator (players[0]) already joined via createTournament, so join the rest
    for (const u of players.slice(1)) {
        await service.joinTournament(tournamentId, u.id);
    }
    let participants = await getParticipants(tournamentId);
    check(`all ${SIZE} players joined`, participants.length === SIZE, `(got ${participants.length})`);

    // ---- 2. guards ----
    console.log('\n=== 2. Guard checks ===');
    await expectThrow('joining twice is rejected',
        () => service.joinTournament(tournamentId, players[0]!.id));
    if (extraUser) {
        await expectThrow('joining a full tournament is rejected',
            () => service.joinTournament(tournamentId, extraUser.id));
    } else {
        console.log('  SKIP  "tournament is full" check (need a 5th user in the users table)');
    }

    // ---- 3. bracket structure (auto-started by the 4th join) ----
    console.log('\n=== 3. Verify auto-started bracket ===');
    await expectThrow('manual start is rejected (tournament auto-started on 4th join)',
        () => service.startTournament(tournamentId));

    t = await getTournamentRow(tournamentId);
    check('tournament status is IN_PROGRESS', t.status === TournamentStatus.IN_PROGRESS, `(got ${t.status})`);

    let bracket = await getBracket(tournamentId);
    printBracket(bracket);

    check(`bracket has N-1 = ${SIZE - 1} matches`, bracket.length === SIZE - 1, `(got ${bracket.length})`);

    const round1 = bracket.filter(m => m.round_number === 1);
    const final = bracket.find(m => !m.next_tournament_match_id);
    check(`round 1 has ${SIZE / 2} matches`, round1.length === SIZE / 2, `(got ${round1.length})`);
    check('exactly one final (no next match)', bracket.filter(m => !m.next_tournament_match_id).length === 1);
    check('round 1 matches all have both players',
        round1.every(m => m.player_1_id && m.player_2_id));
    check('later rounds have no players yet',
        bracket.filter(m => m.round_number > 1).every(m => !m.player_1_id && !m.player_2_id));
    check('all round-1 matches point at the final',
        !!final && round1.every(m => m.next_tournament_match_id === final.id));
    check('sibling matches feed different slots (next_slot 1 and 2)',
        round1.map(m => m.next_slot).sort().join(',') === '1,2',
        `(got ${round1.map(m => m.next_slot).join(',')})`);
    check('round 1 matches auto-started (IN_PROGRESS)',
        round1.every(m => m.status === TournamentMatchStatus.IN_PROGRESS),
        `(got ${round1.map(m => m.status).join(',')})`);
    check('round 1 matches are linked to real matches rows',
        round1.every(m => m.match_id));

    // seeding: seed 0 must be the highest-elo player, paired against the lowest
    participants = await getParticipants(tournamentId);
    const sortedByElo = [...players].sort((a, b) => b.elo_rating - a.elo_rating);
    const seed0 = participants.find(p => p.seed === 0);
    check('seed 0 is the highest-elo player',
        !!seed0 && seed0.user_id === sortedByElo[0]!.id,
        `(seed 0 = ${seed0?.user?.username}, expected ${sortedByElo[0]!.username})`);
    const slot0 = round1.find(m => m.slot_in_round === 0);
    check('round 1 slot 0 pairs strongest vs weakest',
        !!slot0 && slot0.player_1_id === sortedByElo[0]!.id && slot0.player_2_id === sortedByElo[SIZE - 1]!.id);

    // ---- 4. play the tournament ----
    console.log('\n=== 4. Advance winners through the bracket ===');
    if (!final) throw new Error('No final found, cannot continue');

    // winner of slot 0 = its player_1, winner of slot 1 = its player_2 (arbitrary picks)
    const m0 = round1.find(m => m.slot_in_round === 0)!;
    const m1 = round1.find(m => m.slot_in_round === 1)!;
    const winner0 = m0.player_1_id as string;
    const winner1 = m1.player_2_id as string;
    const loser0 = m0.player_2_id as string;

    await service.advancePlayer(m0.id, winner0);
    bracket = await getBracket(tournamentId);
    let finalNow = bracket.find(m => m.id === final.id)!;
    check('winner of slot 0 landed in final player_1',
        finalNow.player_1_id === winner0,
        `(final p1=${finalNow.player_1_id}, p2=${finalNow.player_2_id})`);
    check('final not started yet (only one player)',
        finalNow.status !== TournamentMatchStatus.IN_PROGRESS);

    participants = await getParticipants(tournamentId);
    const loser0Row = participants.find(p => p.user_id === loser0);
    check('loser of slot 0 is eliminated', loser0Row?.eliminated === true);
    check(`loser of slot 0 placement is ${SIZE / 2 + 1}`,
        loser0Row?.placement === SIZE / 2 + 1, `(got ${loser0Row?.placement})`);

    await service.advancePlayer(m1.id, winner1);
    bracket = await getBracket(tournamentId);
    finalNow = bracket.find(m => m.id === final.id)!;
    check('winner of slot 1 landed in final player_2', finalNow.player_2_id === winner1);
    check('final auto-started once both players were known',
        finalNow.status === TournamentMatchStatus.IN_PROGRESS, `(got ${finalNow.status})`);
    check('final is linked to a real matches row', !!finalNow.match_id);

    // ---- 5. finish: champion & placements ----
    console.log('\n=== 5. Finish the final ===');
    const champion = winner0;
    const runnerUp = winner1;
    await service.advancePlayer(final.id, champion);

    t = await getTournamentRow(tournamentId);
    check('tournament status is FINISHED', t.status === TournamentStatus.FINISHED, `(got ${t.status})`);
    check('tournament winner_id is the champion', t.winner_id === champion);

    participants = await getParticipants(tournamentId);
    console.log('    final standings:');
    for (const p of participants) {
        console.log(`      seed ${p.seed}  ${p.user?.username}  placement=${p.placement}  eliminated=${p.eliminated}`);
    }
    const champRow = participants.find(p => p.user_id === champion);
    const runnerRow = participants.find(p => p.user_id === runnerUp);
    check('champion placement is 1', champRow?.placement === 1, `(got ${champRow?.placement})`);
    check('champion is not eliminated', champRow?.eliminated === false);
    check('runner-up placement is 2', runnerRow?.placement === 2, `(got ${runnerRow?.placement})`);
    check('everyone has a placement', participants.every(p => p.placement !== null));

    // ---- summary ----
    console.log(`\n=== DONE: ${passed} passed, ${failed} failed ===`);
    console.log(`Tournament left in DB for inspection: ${tournamentId}`);
    console.log('Delete its row in the dashboard to clean up (cascade removes the rest).');
    process.exit(failed > 0 ? 1 : 0);
}

main().catch(e => {
    console.error('\nTest run crashed:', e.message ?? e);
    console.error(e);
    process.exit(1);
});
