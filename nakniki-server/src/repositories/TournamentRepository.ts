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
            .maybeSingle();

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
            .select('user_id, seed, placement, eliminated, user:user_id(username, avatar_url, elo_rating)')
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
            .select('id, name, size, status, created_at, tournament_participants(count)')
            .eq('status', TournamentStatus.REGISTERING);

        // check if success
        if (error) throw error;

        return data.map(t => ({
            ...t,
            participant_count: t.tournament_participants?.[0]?.count ?? 0,
        }));
    },

    async getUserTournaments(userId: string) {
        // every tournament this user joined, with the tournaments info
        const { data, error } = await supabase
            .from(DB.TABLES.TOURNAMENT_PARTICIPANTS)
            .select(`
                placement,
                eliminated,
                tournament:tournament_id(id, name, status, size, winner_id, created_at, finished_at)
            `)
            .eq('user_id', userId)
            .order('joined_at', { ascending: false });

        // check if success
        if (error) throw error;

        return data;
    }
}