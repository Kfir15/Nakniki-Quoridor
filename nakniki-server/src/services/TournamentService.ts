import { GameManager, GameSession } from '../game_model/GameManager';
import { MatchRepository } from '../repositories/MatchRepository';
import { TournamentRepository } from '../repositories/TournamentRepository';
import { TournamentParticipantRepository } from '../repositories/TournamentParticipantRepository';
import { TournamentMatchesRepository } from '../repositories/TournamentMatchesRepository';
import { UserRepository } from '../repositories/UserRepository';
import { supabase } from '../lib/supabase';

export class TournamentService {
    // create a new tournament and return its id
    static async createTournament(tSize: number, tName: string): Promise<string> {
        return await TournamentRepository.createTournament(tSize, tName);
    }

    // join a tournament as a participant
    static async joinTournament(tournamentId: string, userId: string) {
    // Using the atomic join_tournament function from the database
    const { error } = await supabase.rpc('join_tournament', {
        p_tournament: tournamentId,
        p_user: userId,
    });
    if (error) throw error;
}


}
    