/**
 * Seed three users to target ELOs and generate match history between them.
 *
 *   Run from nakniki-server:   npx ts-node src/scripts/seed-elo.ts
 *
 * Matches among only 3 players are ~zero-sum, so you can't push the ELO total
 * up to the targets by playing alone. Instead we generate realistic match
 * HISTORY (for the profile / nemesis / win-rate to display) and then set each
 * player's ELO directly so the tiers land exactly where you want.
 */
import { supabase } from '../lib/supabase';
import { MatchRepository } from '../repositories/MatchRepository';
import { UserRepository } from '../repositories/UserRepository';
import { DB_CONSTANTS as DB } from '../constants/db.constants';

// ─── configure here ───────────────────────────────────────────────────
const PLAYERS = [
    { email: 'bdavush1@gmail.com', password: 'JR4z28p1Q', targetElo: 2001 },  // 2000+  → Nakniki-God
    { email: 'tyrone@tyrone.tyrone', password: 'Tyrone1', targetElo: 1704 },  // 1601-2000 → Expert
    { email: 'nakniki@user.com', password: 'JR4z28p1Q', targetElo: 360  },  // <800   → Baby
];
const MATCHES_TO_GENERATE = 55;
const STRONGER_WIN_RATE = 0.7;   // chance the higher-target player wins each match
// ──────────────────────────────────────────────────────────────────────

async function resolveId(email: string, password: string): Promise<string> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) throw new Error(`Sign-in failed for ${email}: ${error?.message}`);
    return data.user.id;
}

// pick two distinct indices
function pickTwo<T>(arr: T[]): [T, T] {
    const i = Math.floor(Math.random() * arr.length);
    let j = Math.floor(Math.random() * arr.length);
    while (j === i) j = Math.floor(Math.random() * arr.length);
    return [arr[i]!, arr[j]!];
}

async function main() {
    // 1) resolve user ids from their credentials
    const players = [];
    for (const p of PLAYERS) {
        const id = await resolveId(p.email, p.password);
        players.push({ ...p, id, games: 0, wins: 0 });
        console.log(`resolved ${p.email} -> ${id}`);
    }

    // 2) generate match history — the higher-rated player usually wins, so the
    //    win/loss record and nemesis come out realistic
    for (let i = 0; i < MATCHES_TO_GENERATE; i++) {
        const [p1, p2] = pickTwo(players);
        const stronger = p1.targetElo >= p2.targetElo ? p1 : p2;
        const weaker = stronger === p1 ? p2 : p1;
        const winner = Math.random() < STRONGER_WIN_RATE ? stronger : weaker;

        const matchId = await MatchRepository.createMatch(`SEED${i}`, p1.id, p2.id, false);
        await MatchRepository.finishMatch(matchId, winner.id);

        p1.games++;
        p2.games++;
        winner.wins++;
    }
    console.log(`generated ${MATCHES_TO_GENERATE} matches`);

    // 3) set exact target ELOs + bump the totals so the leaderboard stays consistent
    for (const p of players) {
        const current = await UserRepository.getUserById(p.id);
        const { error } = await supabase.from(DB.TABLES.USERS).update({
            elo_rating: p.targetElo,
            total_games: (current.total_games ?? 0) + p.games,
            total_wins: (current.total_wins ?? 0) + p.wins,
        }).eq('id', p.id);
        if (error) throw error;
        console.log(`${p.email}: elo set to ${p.targetElo}  (+${p.games} games, +${p.wins} wins)`);
    }

    console.log('\nDone! Refresh the profiles / leaderboard to see the new tiers.');
    process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
