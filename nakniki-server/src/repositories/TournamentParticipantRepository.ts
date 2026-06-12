import { supabase } from '../lib/supabase';
import { DB_CONSTANTS as DB } from '../constants/db.constants';

export const TournamentParticipantRepository = {

    // create new tournament participant and return its id
    async createTournamentParticipant(tournamentId: string, userId: string) {
        // create new tournament participant
        const { error } = await supabase
            .from(DB.TABLES.TOURNAMENT_PARTICIPANTS)
            .insert({
                tournament_id: tournamentId,
                user_id: userId
            })

        // check if success
        if (error) throw error;
    },

    async setParticipantSeed(tournamentId: string, userId: string, participantSeed: number) {
        // set the participant's seed
        const { error } = await supabase
            .from(DB.TABLES.TOURNAMENT_PARTICIPANTS)
            .update({
                seed: participantSeed,
            })
            .eq('tournament_id', tournamentId)
            .eq('user_id', userId) 

        // check if success
        if (error) throw error;
    },

    async eliminateParticipant(tournamentId: string, userId: string) {
        // update tournament status
        const { error } = await supabase
            .from(DB.TABLES.TOURNAMENT_PARTICIPANTS)
            .update({
                eliminated: true,
            })
            .eq('tournament_id', tournamentId)
            .eq('user_id', userId)

        // check if success
        if (error) throw error;
    },

    async setParticipantPlacement(tournamentId: string, userId: string, placement: number) {
        // set the participant's placement in the tournament
        const { error } = await supabase
            .from(DB.TABLES.TOURNAMENT_PARTICIPANTS)
            .update({
                placement: placement,
            })
            .eq('tournament_id', tournamentId)
            .eq('user_id', userId);

        // check if success
        if (error) throw error;
    }
}