import { supabase } from '../lib/supabase';
import { DB_CONSTANTS as DB } from '../constants/db.constants';
import { GameStatus } from '../types/game.enums';

export const MatchRepository = {

    // create new match and return his id
    async createMatch(lobbyCode: string, p1Id: string, p2Id: string | null, isAI: boolean): Promise<string> {
        // create match
        const { data, error } = await supabase
            .from(DB.TABLES.MATCHES)
            .insert({
                lobby_code: lobbyCode,
                player_1_id: p1Id,
                player_2_id: p2Id,
                is_ai_match: isAI,
                status: isAI ? GameStatus.IN_PROGRESS : GameStatus.WAITING
            })
            .select('id')
            .single();

        // check if success
        if (error) throw error;

        return data.id;
    },

    async startMatch(id: string, p2Id: string) {
        // update game status
        const { data, error } = await supabase
            .from(DB.TABLES.MATCHES)
            .update({
                status: GameStatus.IN_PROGRESS,
                player_2_id: p2Id
            })
            .eq('id', id)
            .select()
            .single();

        // check if success
        if (error) throw error;
    },

    async finishMatch(matchId: string, winnerId: string | null) {
        // finish the game
        const { error } = await supabase
            .from(DB.TABLES.MATCHES)
            .update({
                winner_id: winnerId,
                status: GameStatus.FINISHED,
                finished_at: new Date().toISOString()
            })
            .eq('id', matchId);

        // check if success
        if (error) throw error;
    },

    async abandonMatch(matchId: string, winnerId: string | null = null) {
        // finish the game with abandoned status
        const { error } = await supabase
            .from(DB.TABLES.MATCHES)
            .update({
                status: GameStatus.ABANDONED,
                winner_id: winnerId,
                finished_at: new Date().toISOString()
            })
            .eq('id', matchId);

        // check if success
        if (error) throw error;
    },

    async getUserMatchHistory(userId: string) {
        // return the user's history matches
        const { data, error } = await supabase
            .from(DB.TABLES.MATCHES)
            .select(`
                id, lobby_code, status, is_ai_match, created_at, finished_at, winner_id, player_1_id, player_2_id,
                player_1:player_1_id(id, username, avatar_url, elo_rating),
                player_2:player_2_id(id, username, avatar_url, elo_rating)
            `)
            .or(`player_1_id.eq.${userId},player_2_id.eq.${userId}`)
            .order('created_at', { ascending: false });

        if (error) throw error;
        if (!data) return [];

        // calculate h2h statistics
        const h2hStats = new Map<string, { played: number, yourWins: number, theirWins: number }>();
        for (const match of data) {
            // const if this is ai game
            if (match.is_ai_match || !match.player_2_id) continue;

            // get the opponent id
            const isPlayer1 = match.player_1_id === userId;
            const opponentId = isPlayer1 ? match.player_2_id : match.player_1_id;

            // create key for opponent if not exist
            if (!h2hStats.has(opponentId)) {
                h2hStats.set(opponentId, { played: 0, yourWins: 0, theirWins: 0 });
            }

            const stats = h2hStats.get(opponentId)!;

            // add game played
            stats.played += 1;

            // if we won add win game, otherwise add loss
            if (match.status === GameStatus.FINISHED || match.status === GameStatus.ABANDONED) {
                if (match.winner_id === userId) {
                    stats.yourWins += 1;
                } else if (match.winner_id === opponentId) {
                    stats.theirWins += 1;
                }
            }
        }

        const enrichedHistory = data.map(match => {
            const isPlayer1 = match.player_1_id === userId;

            // get user and opponent
            const user = isPlayer1 ? match.player_1 : match.player_2;
            const opponent = match.is_ai_match ? { username: "Python AI Engine", avatar_url: null, elo_rating: "∞" }
                : (isPlayer1 ? match.player_2 : match.player_1);
            const opponentId = match.is_ai_match ? null : (isPlayer1 ? match.player_2_id : match.player_1_id);

            // return the match data with the h2h tatistics
            return {
                id: match.id,
                lobby_code: match.lobby_code,
                status: match.status,
                is_ai_match: match.is_ai_match,
                created_at: match.created_at,
                finished_at: match.finished_at,
                winner_id: match.winner_id,
                user_data: user,
                opponent_data: {
                    ...opponent,
                    head_to_head: opponentId ? h2hStats.get(opponentId) : null
                }
            };
        });

        return enrichedHistory;
    }
}