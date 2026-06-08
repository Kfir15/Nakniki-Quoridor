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

    static async getAllOpenTournaments() {
        // get all tournaments that are open for joining
        return await TournamentRepository.getAllOpenTournaments();
    }

    static async startTournament(tournamentId: string) {
        // TODO: Check whether tournament has enough participants
        // Seed the players
        // create N-1 matches (start with N/2, then N/4 and so on...)
        // set players into the first round of matches
        // set tournament status to in progress
    }

    static async advancePlayer(matchId: string, winnerId: string) {
        // TODO: get the winner and the match id from MatchRepository database
        // Set the winner in the tournament_matches table
        // Eliminate the loser from the tournament
        // Check if the tournament_match has a subsequent match, if no - set the winner as the tournament winner and end the tournament
        // If yes, set the winner as a player in the subsequent match, in their correct seed position
    }

    static async startTournamentMatch(tMatchId: string) {
        // TODO: get the match info from the tournament_matches table, specifically player IDs
        // Create new match through the MatchRepository and get the ID of it
        // Create a new game session in the GameManager for the match, with the player IDs and tournament match ID
        // Update the tournament_matches table with the game session ID
    }
}
    