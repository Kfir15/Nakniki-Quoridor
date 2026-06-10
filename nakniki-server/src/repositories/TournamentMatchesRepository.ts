import { supabase } from '../lib/supabase';
import { DB_CONSTANTS as DB } from '../constants/db.constants';
import { TournamentMatchStatus } from '@nakniki/shared';

export const TournamentMatchesRepository = {

    // create new match in a tournament and return its id
    async createTournamentMatch(tournamentId: string, roundNumber: number, slotInRound: number, p1Id: string | null, p2Id: string | null, nextSlot: number): Promise<string> {
        // create tournament match
        const { data, error } = await supabase
            .from(DB.TABLES.TOURNAMENT_MATCHES)
            .insert({
                tournament_id: tournamentId,
                round_number: roundNumber,
                slot_in_round: slotInRound,
                player_1_id: p1Id,
                player_2_id: p2Id,
                match_id: null,
                winner_id: null,
                next_tournament_match_id: null,
                next_slot: nextSlot,
                status: TournamentMatchStatus.PENDING,
                created_at: new Date().toISOString(),
            })
            .select('id')
            .single();

        // check if success
        if (error) throw error;

        return data.id;
    },

    async getTournamentMatchById(tMatchId: string) {
        // get the tournament match info by its id
        const { data, error } = await supabase
            .from(DB.TABLES.TOURNAMENT_MATCHES)
            .select()
            .eq('id', tMatchId)
            .single();

        // check if success
        if (error) throw error;
        return data;
    },

    async startTournamentMatch(id: string, matchId: string) {
        // update tournament status
        const { error } = await supabase
            .from(DB.TABLES.TOURNAMENT_MATCHES)
            .update({
                status: TournamentMatchStatus.IN_PROGRESS,
                match_id: matchId,
            })
            .eq('id', id)

        // check if success
        if (error) throw error;
    },

    async endTournamentMatch(tournamentMatchId: string, winnerId: string | null) {
        // end the tournament
        const { error } = await supabase
            .from(DB.TABLES.TOURNAMENT_MATCHES)
            .update({
                winner_id: winnerId,
                status: TournamentMatchStatus.FINISHED
            })
            .eq('id', tournamentMatchId);

        // check if success
        if (error) throw error;
    },

    async setTournamentMatchParticipant(tournamentMatchId: string, slot: number, playerId: string) {
        // sets the player in the given slot (1 or 2) in the tournament match
        const column = slot === 1 ? 'player_1_id' : 'player_2_id';
        const { error } = await supabase
            .from(DB.TABLES.TOURNAMENT_MATCHES)
            .update({ [column]: playerId })
            .eq('id', tournamentMatchId);
        // check if success
        if (error) throw error;
    },

    async updateNextTournamentMatch(tournamentMatchId: string, nextTournamentMatchId: string) {
        // update the next tournament match info
        const { error } = await supabase
            .from(DB.TABLES.TOURNAMENT_MATCHES)
            .update({
                next_tournament_match_id: nextTournamentMatchId
            })
            .eq('id', tournamentMatchId)

        // check if success
        if (error) throw error;
        },

    async getBracket(tournamentId: string) {
        // Gets all necessary information about the users to visualize the brackets
        const { data, error } = await supabase
            .from(DB.TABLES.TOURNAMENT_MATCHES)
            .select(`
                id, round_number, slot_in_round, status, match_id, winner_id,
                next_tournament_match_id, next_slot, player_1_id, player_2_id,
                player_1:player_1_id(username, avatar_url, elo_rating),
                player_2:player_2_id(username, avatar_url, elo_rating)
            `)
            .eq('tournament_id', tournamentId)
            .order('round_number', { ascending: true })
            .order('slot_in_round', { ascending: true });

        // check if success
        if (error) throw error;

        return data as any[];
    }
}

