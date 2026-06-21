import { GameManager, GameSession } from '../game_model/GameManager';
import { MatchRepository } from '../repositories/MatchRepository';
import { TournamentRepository } from '../repositories/TournamentRepository';
import { TournamentParticipantRepository } from '../repositories/TournamentParticipantRepository';
import { TournamentMatchesRepository } from '../repositories/TournamentMatchesRepository';
import { UserRepository } from '../repositories/UserRepository';
import { supabase } from '../lib/supabase';
import { TournamentStatus, GameStatus, SOCKET_EVENTS as S,  PlayerRole, GAME_CONSTANTS as G } from '@nakniki/shared';
import { Server } from 'socket.io';

export class TournamentService {
    private gameManager: GameManager;
    private io: Server | null = null;

    constructor(gameManager: GameManager) {
        this.gameManager = gameManager;
    }
    
    setIo(io: Server) {
        this.io = io;
    }

    // create a new tournament and return its id
    async createTournament(tSize: number, tName: string, creatorId: string): Promise<string> {
        const tournamentId = await TournamentRepository.createTournament(tSize, tName);
        await this.joinTournament(tournamentId, creatorId);   // creator is also a participant
        return tournamentId;
    }

    // join a tournament as a participant
    async joinTournament(tournamentId: string, userId: string) {
    // using the atomic join_tournament function from the database
    const { error } = await supabase.rpc('join_tournament', {
        p_tournament: tournamentId,
        p_user: userId,
    });
    if (error) { 
        if (error.code === '23505') { // Duplicate unique key - meaning a player has attempted to join the same tournament twice
            throw new Error('You have already joined this tournament.');
        }
        throw error;
    }

    const tournament = await TournamentRepository.getTournamentById(tournamentId);
    const participants = await TournamentRepository.getAllTournamentParticipants(tournamentId);
    // automatically starting tournament once enough participants are in the tourney
    if (tournament.size == participants.length) await this.startTournament(tournamentId);
    }

    async getAllOpenTournaments() {
        // get all tournaments that are open for joining
        return await TournamentRepository.getAllOpenTournaments();
    }

    async startTournament(tournamentId: string) {
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
                    slot % 2 + 1                                                                    // the position the winner will play from (player 1 or player 2)
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

        // kicking off round 1 of the tournament, starting all R1 matches
        const currentRound = matchIds[0];
        if (currentRound) {
            for (let i = 0; i < tournament.size / 2; i++) {
            const thisMatch = currentRound[i];
                if (thisMatch) {
                    await this.startTournamentMatch(thisMatch);
                }
            }
        }
    }

    async advancePlayer(tMatchId: string, winnerId: string) {
        // Set the winner in the tournament_matches table and End tournament match in the tournament_matches table
        const tournamentMatch = await TournamentMatchesRepository.getTournamentMatchById(tMatchId);
        await TournamentMatchesRepository.endTournamentMatch(tMatchId, winnerId);

        // Eliminate the loser from the tournament
        const loserId = tournamentMatch.player_1_id === winnerId ? tournamentMatch.player_2_id : tournamentMatch.player_1_id;
        if (loserId) {
            await TournamentParticipantRepository.eliminateParticipant(tournamentMatch.tournament_id, loserId);
            // Calculate the placement of the eliminated player and place them accordingly
            const tournament = await TournamentRepository.getTournamentById(tournamentMatch.tournament_id);
            const placement = (tournament.size / 2 ** tournamentMatch.round_number) + 1;
            await TournamentParticipantRepository.setParticipantPlacement(tournamentMatch.tournament_id, loserId, placement);
        }

        // Check if the tournament_match has a subsequent match, if no - set the winner as the tournament winner and end the tournament
        if (!tournamentMatch.next_tournament_match_id) {
            await TournamentParticipantRepository.setParticipantPlacement(tournamentMatch.tournament_id, winnerId, 1);
            await TournamentRepository.endTournament(tournamentMatch.tournament_id, winnerId);
        }
        // If yes, set the winner as a player in the subsequent match, in their correct seed position
        else {
            await TournamentMatchesRepository.setTournamentMatchParticipant(
            tournamentMatch.next_tournament_match_id, tournamentMatch.next_slot, winnerId);

            // check if the next match now has both players, start the match if yes
            const nextMatch = await TournamentMatchesRepository.getTournamentMatchById(tournamentMatch.next_tournament_match_id);
            if (nextMatch.player_1_id && nextMatch.player_2_id) {
                await this.startTournamentMatch(tournamentMatch.next_tournament_match_id);
            }
        }     
    }

    async startTournamentMatch(tMatchId: string) {
        // get the match info from the tournament_matches table, specifically player IDs
        const tournamentMatch = await TournamentMatchesRepository.getTournamentMatchById(tMatchId);
        if (!tournamentMatch) throw new Error('Tournament match not found');
        if (!tournamentMatch.player_1_id || !tournamentMatch.player_2_id) throw new Error('Tournament match does not have both players yet');

        // Create a new game session in the GameManager for the match, with the player IDs and tournament match ID
        const { gameId, session } = this.gameManager.createSession(false, false, tMatchId);
        session.userIds[PlayerRole.P1] = tournamentMatch.player_1_id;
        session.userIds[PlayerRole.P2] = tournamentMatch.player_2_id;

        // Create new match through the MatchRepository and get the ID of it  
        session.dbMatchId = await MatchRepository.createMatch( gameId, tournamentMatch.player_1_id, tournamentMatch.player_2_id, false);    
        // Update the tournament_matches table with the game session ID
        await TournamentMatchesRepository.startTournamentMatch(tMatchId, session.dbMatchId);
        // tell both players their match exists and where to go
        this.io?.to(tournamentMatch.player_1_id).to(tournamentMatch.player_2_id)
        .emit(S.SERVER.TOURNAMENT_MATCH_READY, { gameId, tournamentMatchId: tMatchId });

        // forfeit the match if both players haven't checked in within the time limit
        session.lobbyTimeout = setTimeout(async () => {
            const checkSession = this.gameManager.getSession(gameId);
            if (!checkSession || checkSession.game.status !== GameStatus.WAITING) return;

            // whoever showed up wins; if neither did, player 1 advances arbitrarily
            const p1Here = checkSession.sockets[PlayerRole.P1] !== null;
            const p2Here = checkSession.sockets[PlayerRole.P2] !== null;
            const winnerId = p2Here && !p1Here ? tournamentMatch.player_2_id : tournamentMatch.player_1_id;

            try {
                // close the real match as abandoned and advance the bracket
                await MatchRepository.abandonMatch(checkSession.dbMatchId!, winnerId);
                await this.advancePlayer(tMatchId, winnerId);
                this.io?.to(gameId).emit(S.SERVER.GAME_ABANDONED);
            } catch (error) {
                console.error("Failed to forfeit unstarted tournament match:", error);
            } finally {
                this.gameManager.deleteSession(gameId);
            }
        }, G.LOBBY_TIMEOUT);
    }

    async getTournamentDetails(tournamentId: string) {
        const [tournament, participants, matches] = await Promise.all([
            TournamentRepository.getTournamentById(tournamentId),
            TournamentRepository.getAllTournamentParticipants(tournamentId),
            TournamentMatchesRepository.getBracket(tournamentId),
        ]);
        if (!tournament) throw new Error('Tournament not found');
        return { tournament, participants, matches };
    }

    startStaleSweep() {
        setInterval(async () => {
            const cutoff = new Date(Date.now() - G.TOURNAMENT_TIMEOUT).toISOString();
            try { await TournamentRepository.cancelStaleTournaments(cutoff); }
            catch (e) { console.error('stale-tournament sweep failed', e); }
        }, G.SWEEP_INTERVAL);
    }
}