import { GameManager, GameSession } from '../game_model/GameManager';
import { MatchRepository } from '../repositories/MatchRepository';
import { TournamentRepository } from '../repositories/TournamentRepository';
import { TournamentParticipantRepository } from '../repositories/TournamentParticipantRepository';
import { TournamentMatchesRepository } from '../repositories/TournamentMatchesRepository';
import { UserRepository } from '../repositories/UserRepository';
import { supabase } from '../lib/supabase';
import { TournamentStatus } from '@nakniki/shared';

export class TournamentService {
    // create a new tournament and return its id
    static async createTournament(tSize: number, tName: string): Promise<string> {
        return await TournamentRepository.createTournament(tSize, tName);
    }

    // join a tournament as a participant
    static async joinTournament(tournamentId: string, userId: string) {
    // using the atomic join_tournament function from the database
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
        // getting the tournament and every participant in it, throwing errors upon failure
        const tournament = await TournamentRepository.getTournamentById(tournamentId);
        if (!tournament) throw new Error('Tournament not found');
        const tournamentParticipants = await TournamentRepository.getAllTournamentParticipants(tournamentId);
        if (tournamentParticipants.length !== tournament.size) throw new Error('Tournament is not full yet, cannot start');
        if (tournament.status !== TournamentStatus.REGISTERING) throw new Error('Tournament already started');

        // get the data of each participant and sort them by their ELOS
        const tournamentUsers = await Promise.all(tournamentParticipants.map((tp) => UserRepository.getUserById(tp.user_id)));
        tournamentUsers.sort((a, b) => b.elo_rating - a.elo_rating);
        
        // seed the players
        let seed = 0;
        for (const user of tournamentUsers) {
            await TournamentParticipantRepository.setParticipantSeed(tournamentId, user.id, seed);
            seed++;
        }

        let round = 1;
        const matchIds: string[][] = [];

        // create N-1 matches (start with N/2, then N/4 and so on...), saving each match id in a matrix accorfing to its round and slot in the round
        // we are matchmaking based on seeds, the strongest players will be matched with the weakest players first, and will be kept away from each other until the later rounds
        for (let i = 2; i <= tournament.size; i *= 2) {
            const roundMatches: string[] = [];
            for (let slot = 0; slot < tournament.size / i; slot++) {
                // creating the match and saving its id
                const id = await TournamentMatchesRepository.createTournamentMatch(
                    tournamentId,
                    round,
                    slot,                                                                           // the match's number in the round
                    round === 1 ? tournamentUsers[slot].id : null,                                  // we can only apply participants for the first round of the tournament
                    round === 1 ? tournamentUsers[tournamentUsers.length - slot - 1].id : null,     // same here
                    slot % 2 - 1                                                              // the position the winner will play from (player 1 or player 2)
                );
                roundMatches.push(id); 
            }
            // saving all of the round's matches ids in the matrix
            matchIds.push(roundMatches);
            round++;  
        } 

        // wiring up the next matches for each match, not including the finals match
        for (let r = 0; r < matchIds.length - 1; r++) {
            const thisRound = matchIds[r];
            const nextRound = matchIds[r + 1];
            // we have to ensure that the matches' ids are intact and not undefined
            if (!thisRound || !nextRound) continue;
            
            for (let slot = 0; slot < thisRound.length; slot++) {
                const currentId = thisRound[slot];
                // the next match id is determined by the slot in the next round, which is half of the current slot (as there are half the matches in the next round)
                const nextId = nextRound[Math.floor(slot / 2)];
                if (!currentId || !nextId) continue;

                await TournamentMatchesRepository.updateNextTournamentMatch(currentId, nextId);
            }
        }

        // set tournament status to in progress
        await TournamentRepository.startTournament(tournamentId);
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
    