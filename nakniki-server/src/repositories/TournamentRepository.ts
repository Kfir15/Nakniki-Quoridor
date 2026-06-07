import { supabase } from '../lib/supabase';
import { DB_CONSTANTS as DB } from '../constants/db.constants';
import { TournamentStatus } from '@nakniki/shared';

export const TournamentRepository = {

    // create new tournament and return its id
    async createTournament(tSize: number, tName: string): Promise<string> {
        // create tournament
        const { data, error } = await supabase
            .from(DB.TABLES.TOURNAMENTS)
            .insert({
                size: tSize,
                name: tName
            })
            .select('id')
            .single();

        // check if success
        if (error) throw error;

        return data.id;
    },

    async getTournamentById(tournamentId: string) {
        // get the tournament info by its id
        const { data, error } = await supabase
            .from(DB.TABLES.TOURNAMENTS)
            .select()
            .eq('id', tournamentId)
            .single();

        // check if success
        if (error) throw error;
        return data;
    },

    async startTournament(id: string) {
        // update tournament status
        const { data, error } = await supabase
            .from(DB.TABLES.TOURNAMENTS)
            .update({
                status: TournamentStatus.IN_PROGRESS,
            })
            .eq('id', id)
            .select()
            .single();

        // check if success
        if (error) throw error;
    },

    async endTournament(tournamentId: string, winnerId: string | null) {
        // end the tournament
        const { error } = await supabase
            .from(DB.TABLES.TOURNAMENTS)
            .update({
                winner_id: winnerId,
                status: TournamentStatus.FINISHED,
                finished_at: new Date().toISOString()
            })
            .eq('id', tournamentId);

        // check if success
        if (error) throw error;
    },

    async cancelTournament(tournamentId: string, winnerId: string | null = null) {
        // finish the tournament with cancelled status
        const { error } = await supabase
            .from(DB.TABLES.TOURNAMENTS)
            .update({
                status: TournamentStatus.CANCELLED,
                winner_id: winnerId,
                finished_at: new Date().toISOString()
            })
            .eq('id', tournamentId);

        // check if success
        if (error) throw error;
    },

    async getAllTournamentParticipants(tournamentId: string) {
        // Get the tournament participants
        const { data, error } = await supabase
            .from(DB.TABLES.TOURNAMENT_PARTICIPANTS)
            .select('user_id')
            .eq('tournament_id', tournamentId);

        // check if success
        if (error) throw error;
        return data;
    },

    async getAllTournamentMatches(tournamentId: string) {
        // Get the tournament matches
        const { data, error } = await supabase
            .from(DB.TABLES.TOURNAMENT_MATCHES)
            .select('id')
            .eq('tournament_id', tournamentId);
        
        // check if success
        if (error) throw error;

        return data;
    },

    async getAllOpenTournaments() {
        // Get all tournaments that can be joined
        const { data, error } = await supabase
            .from(DB.TABLES.TOURNAMENTS)
            .select('id, name')
            .eq('status', TournamentStatus.WAITING_FOR_PLAYERS);
        
        // check if success
        if (error) throw error;
        
        return data;
    }
}