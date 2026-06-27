import { GameManager, GameSession } from '../game_model/GameManager';
import { MatchRepository } from '../repositories/MatchRepository';
import { EloService } from './EloService';
import { ActionManager } from './ActionManager';
import { PlayerRole, GameStatus, Orientation, GameState, Position, GAME_CONSTANTS as G } from '@nakniki/shared';
import { UserRepository } from '../repositories/UserRepository';
import { TournamentService } from '../services/TournamentService'
type ActionType = typeof G.ACTION_TYPES[keyof typeof G.ACTION_TYPES];

export class MultiplayerService {
    private gameManager: GameManager;
    private tournamentService: TournamentService;

    constructor(gameManager: GameManager, tournamentService: TournamentService) {
        this.gameManager = gameManager;
        this.tournamentService = tournamentService;
    }

    // craete new lobby
    public createLobby(userId: string, socketId: string, isPublic: boolean): string {
        // create the session
        const { gameId, session } = this.gameManager.createSession(false, isPublic);

        // insert the id's to the session
        session.userIds[PlayerRole.P1] = userId;
        session.userIds[PlayerRole.P2] = null;

        // insert the sockets
        session.sockets[PlayerRole.P1] = socketId;
        session.sockets[PlayerRole.P2] = null;

        // set lobby timeout if no one entered
        session.lobbyTimeout = setTimeout(() => {
            const checkSession = this.gameManager.getSession(gameId);

            // if no one joined, delete the session
            if (checkSession && checkSession.game.status === GameStatus.WAITING) {
                this.gameManager.deleteSession(gameId);
            }
        }, G.LOBBY_TIMEOUT);

        return gameId;
    }

    // join lobby
    public async joinLobby(userId: string, socketId: string, lobbyCode: string) {
        // get the session by the lobby code
        const session = this.gameManager.getSession(lobbyCode);

        // check that the player can join the lobby
        if (!session
            || session.isAI
            || session.game.status !== GameStatus.WAITING
            || session.userIds[PlayerRole.P2] !== null) {
            return null;
        }

        // stop the timer on the lobby
        if (session.lobbyTimeout) {
            clearTimeout(session.lobbyTimeout);
            session.lobbyTimeout = undefined;
        }

        // insert the new player
        session.userIds[PlayerRole.P2] = userId;
        session.sockets[PlayerRole.P2] = socketId;

        session.game.startGame();

        // create the match in the DB
        try {
            session.dbMatchId = await MatchRepository.createMatch(
                lobbyCode,
                session.userIds[PlayerRole.P1]!,
                session.userIds[PlayerRole.P2]!,
                false
            );
        } catch (error) {
            // if error, delete the session
            this.gameManager.deleteSession(lobbyCode);
            throw error;
        }

        return {
            gameId: lobbyCode,
            state: session.game.getState()
        };
    }

    
    // A function to add a player to a tournament game (not just a tournament_match instance)
    async joinTournamentGame(userId: string, socketId: string, gameId: string) {
        const session = this.gameManager.getSession(gameId);
        // must exist and actually be a tournament game
        if (!session || !session.tournamentMatchId) return null;

        // checking which player is this user, if none then kick the user from the match
        let role: PlayerRole | null = null;
        if (session.userIds[PlayerRole.P1] === userId) role = PlayerRole.P1;
        else if (session.userIds[PlayerRole.P2] === userId) role = PlayerRole.P2;
        if (!role) return null;

        // attach this connection to the session
        session.sockets[role] = socketId;

        // start the clock only when both players have checked in
        const bothPresent =
            session.sockets[PlayerRole.P1] !== null &&
            session.sockets[PlayerRole.P2] !== null;
        if (bothPresent && session.game.status === GameStatus.WAITING) {
            // both players showed up — cancel the no-show forfeit
            if (session.lobbyTimeout) {
                clearTimeout(session.lobbyTimeout);
                session.lobbyTimeout = undefined;
            }
            session.game.startGame();
        }
    return { state: session.game.getState(), started: bothPresent };
    }

    // find public lobbies
    public getPublicLobbies(): { lobbyCode: string, hostId: string }[] {
        const availableLobbies = this.gameManager.getAvailableLobbies();

        // return all the public lobbies
        return availableLobbies.map(lobby => ({
            lobbyCode: lobby.gameId,
            hostId: lobby.hostId
        }));
    }

    public async processMovePawn(gameId: string, userId: string, socketId: string, target: Position): Promise<GameState | null> {
        // get the session
        const session = this.gameManager.getSession(gameId);
        if (!session || session.game.status !== GameStatus.IN_PROGRESS) return null;
        const stateBefore = structuredClone(session.game.getState());

        // get the player session
        const role = this.getPlayerRole(session, userId, socketId);
        if (!role || session.game.getState().turn !== role) return null;

        // try to move the pawn
        const [success, newState] = session.game.tryMovePawn(role, target);
        if (!success) return null;

        // record the action
        ActionManager.recordAction(session, stateBefore, role, G.ACTION_TYPES.MOVE, { r: target.r, c: target.c }, true);

        // if the game ended
        if (newState.status === GameStatus.FINISHED) {
            await this.handleGameOver(session, newState);
        }

        return newState;
    }

    public async getLobbyPlayers(gameId: string) {
        const session = this.gameManager.getSession(gameId);
        if (!session) return null;

        let p1 = null;
        let p2 = null;

        if (session.userIds[PlayerRole.P1]) {
            p1 = await UserRepository.getUserById(session.userIds[PlayerRole.P1]!);
        }
        if (session.userIds[PlayerRole.P2]) {
            p2 = await UserRepository.getUserById(session.userIds[PlayerRole.P2]!);
        }

        return { p1, p2 };
    }

    public async processPlaceWall(gameId: string, userId: string, socketId: string, pos: Position, orient: Orientation): Promise<GameState | null> {
        // get the session
        const session = this.gameManager.getSession(gameId);
        if (!session || session.game.status !== GameStatus.IN_PROGRESS) return null;
        const stateBefore = structuredClone(session.game.getState());

        // get the player role and check that it is his turn
        const role = this.getPlayerRole(session, userId, socketId);
        if (!role || session.game.getState().turn !== role) return null;

        // try to place the wall
        const [success, newState] = session.game.tryPlaceWall(role, pos, orient);
        if (!success) return null;

        // record the action
        ActionManager.recordAction(session, stateBefore, role, G.ACTION_TYPES.WALL, { r: pos.r, c: pos.c, orient }, true);

        // if the game ended
        if (newState.status === GameStatus.FINISHED) {
            await this.handleGameOver(session, newState);
        }

        return newState;
    }

    public async processTimeout(gameId: string, userId: string, socketId: string): Promise<GameState | null> {
        // get the session
        const session = this.gameManager.getSession(gameId);
        if (!session || session.game.status !== GameStatus.IN_PROGRESS) return null;

        // get the player role and check that it is his turn
        const timeoutRole = this.getPlayerRole(session, userId, socketId);
        if (!timeoutRole || session.game.getState().turn !== timeoutRole) return null;
        const winnerRole = timeoutRole === PlayerRole.P1 ? PlayerRole.P2 : PlayerRole.P1;

        // end the game
        session.game.status = GameStatus.FINISHED;
        session.game.winner = winnerRole;
        const finalState = session.game.getState();

        // record the timeout
        ActionManager.recordAction(session, finalState, timeoutRole, G.ACTION_TYPES.SKIP, { reason: "timeout" }, false);

        this.handleGameOver(session, finalState);
        return finalState;
    }

    public async abandonGame(gameId: string, quittingUserId: string, socketId: string): Promise<void> {
        // get the game session
        const session = this.gameManager.getSession(gameId);
        if (!session) return;

        // if the game didnt start
        if (!session.dbMatchId) {
            if (session.lobbyTimeout) clearTimeout(session.lobbyTimeout);
            this.gameManager.deleteSession(gameId);
            return;
        }

        // get the role of the abandon player
        const quittingRole = this.getPlayerRole(session, quittingUserId, socketId);
        if (!quittingRole) return;

        // get the ID's
        const winnerRole = quittingRole === PlayerRole.P1 ? PlayerRole.P2 : PlayerRole.P1;
        const winnerDbId = session.userIds[winnerRole];
        const loserDbId = session.userIds[quittingRole];

        try {
            // insert the winner and the actions
            await MatchRepository.abandonMatch(session.dbMatchId, winnerDbId);
            await ActionManager.uploadActions(session);
            if (session.tournamentMatchId && winnerDbId) {
                await this.tournamentService.advancePlayer(session.tournamentMatchId, winnerDbId);
            }

            // update players stats after the game, only if not a tournament match
            if (winnerDbId && loserDbId && !session.tournamentMatchId) {
                await EloService.updateMatchStats(winnerDbId, loserDbId);
            }
        } catch (error) {
            console.error("Failed to process abandoned game:", error);
        } finally {
            session.dbMatchId = undefined;
            this.gameManager.deleteSession(gameId);
        }
    }

    // get the player role by his ID
    // --- THE LOCAL TESTING BYPASS FIX ---
    private getPlayerRole(session: GameSession, userId: string, socketId?: string): PlayerRole | null {
        // 1. If the socket officially joined the lobby, authorize them securely
        if (socketId) {
            if (session.sockets[PlayerRole.P1] === socketId) return PlayerRole.P1;
            if (session.sockets[PlayerRole.P2] === socketId) return PlayerRole.P2;
        }
        
        // 2. If testing locally (same user on both tabs) and the socket matches the DB
        const isP1 = session.userIds[PlayerRole.P1] === userId && userId !== undefined;
        const isP2 = session.userIds[PlayerRole.P2] === userId && userId !== undefined;
        if (isP1) return PlayerRole.P1;
        if (isP2) return PlayerRole.P2;
        
        // 3. Unknown caller: socket isn't registered AND userId matches neither player.
        // Reject the action instead of guessing — guessing corrupts real multiplayer games.
        return null;
    }

    private async handleGameOver(session: GameSession, finalState: GameState) {
        if (!session.dbMatchId) return;

        // if the game somehow ended without a real winner, don't continue the matches
        if (finalState.winner === null) {
            console.error("handleGameOver: game ended with no winner, skipping result.", finalState.id);
            this.gameManager.deleteSession(finalState.id);
            session.dbMatchId = undefined;
            return;
        }

        // get the roles (winner is guaranteed P1 or P2 here)
        const winnerRole = finalState.winner;
        const loserRole = winnerRole === PlayerRole.P1 ? PlayerRole.P2 : PlayerRole.P1;

        // get the ID's
        const winnerDbId = session.userIds[winnerRole] || null;
        const loserDbId = session.userIds[loserRole] || null;

        try {
            // finish the game in DB and also insert the actions
            await MatchRepository.finishMatch(session.dbMatchId, winnerDbId);
            await ActionManager.uploadActions(session);
            if (session.tournamentMatchId && winnerDbId) {
                await this.tournamentService.advancePlayer(session.tournamentMatchId, winnerDbId);
            }

            // update players stats after the game, only if not a tournament match
            if (winnerDbId && loserDbId && !session.tournamentMatchId) {
                await EloService.updateMatchStats(winnerDbId, loserDbId);
            }
        } catch (error) {
            console.error("Failed to save Multiplayer game over stats to DB:", error);
        } finally {
            this.gameManager.deleteSession(finalState.id);
            session.dbMatchId = undefined;
        }
    }
}
