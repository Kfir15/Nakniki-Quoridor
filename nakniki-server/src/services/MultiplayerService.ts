import { GameManager, GameSession } from '../game_model/GameManager';
import { MatchRepository } from '../repositories/MatchRepository';
import { EloService } from './EloService';
import { MatchActionRepository } from '../repositories/MatchActionRepository';
import { PlayerRole, GameStatus, Orientation } from '../types/game.enums';
import { GameState } from '../types/game.interfaces';
import { Position } from '../game_model/Position';
import { GAME_CONSTANTS as G } from '../constants/game.constants';
type ActionType = typeof G.ACTION_TYPES[keyof typeof G.ACTION_TYPES];

export class MultiplayerService {
    private gameManager: GameManager;

    constructor(gameManager: GameManager) {
        this.gameManager = gameManager;
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

        return session.game.getState();
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

    public async processMovePawn(gameId: string, userId: string, target: Position): Promise<GameState | null> {
        // get the session
        const session = this.gameManager.getSession(gameId);
        if (!session || session.game.status !== GameStatus.IN_PROGRESS) return null;

        // get the player session
        const role = this.getPlayerRole(session, userId);
        if (!role || session.game.getState().turn !== role) return null;

        // try to move the pawn
        const [success, newState] = session.game.tryMovePawn(role, target);
        if (!success) return null;

        // record the action
        this.recordAction(session, newState, role, G.ACTION_TYPES.MOVE, { r: target.r, c: target.c });

        // if the game ended
        if (newState.status === GameStatus.FINISHED) {
            await this.handleGameOver(session, newState);
        }

        return newState;
    }

    public async processPlaceWall(gameId: string, userId: string, pos: Position, orient: Orientation): Promise<GameState | null> {
        // get the session
        const session = this.gameManager.getSession(gameId);
        if (!session || session.game.status !== GameStatus.IN_PROGRESS) return null;

        // get the player role and check that it is his turn
        const role = this.getPlayerRole(session, userId);
        if (!role || session.game.getState().turn !== role) return null;

        // try to place the wall
        const [success, newState] = session.game.tryPlaceWall(role, pos, orient);
        if (!success) return null;

        // record the action
        this.recordAction(session, newState, role, G.ACTION_TYPES.WALL, { r: pos.r, c: pos.c, orient });

        // if the game ended
        if (newState.status === GameStatus.FINISHED) {
            await this.handleGameOver(session, newState);
        }

        return newState;
    }

    public async processTimeout(gameId: string, userId: string): Promise<GameState | null> {
        // get the session
        const session = this.gameManager.getSession(gameId);
        if (!session || session.game.status !== GameStatus.IN_PROGRESS) return null;

        // get the player role and check that it is his turn
        const role = this.getPlayerRole(session, userId);
        if (!role || session.game.getState().turn !== role) return null;

        // skip the turn
        const [success, newState] = session.game.skipTurn();
        if (!success) return null;

        // record the skip
        this.recordAction(session, newState, role, G.ACTION_TYPES.SKIP, { reason: "timeout" });
        return newState;
    }

    public async abandonGame(gameId: string, quittingUserId: string): Promise<void> {
        // get the game session
        const session = this.gameManager.getSession(gameId);
        if (!session) return;

        // if the game didnt start
        if (!session.dbMatchId) {
            if (session.lobbyTimeout) clearTimeout(session.lobbyTimeout);
            this.gameManager.deleteSession(gameId);
            return;
        }

        const currentDbMatchId = session.dbMatchId;
        session.dbMatchId = undefined;

        // get the role of the abandon player
        const quittingRole = this.getPlayerRole(session, quittingUserId);
        if (!quittingRole) return;

        // get the ID's
        const winnerRole = quittingRole === PlayerRole.P1 ? PlayerRole.P2 : PlayerRole.P1;
        const winnerDbId = session.userIds[winnerRole];
        const loserDbId = session.userIds[quittingRole];

        try {
            // insert the winner and the actions
            await MatchRepository.abandonMatch(currentDbMatchId, winnerDbId);
            await MatchActionRepository.insertActions(session.actionHistory);

            // update players stats after the game
            if (winnerDbId && loserDbId) {
                await EloService.updateMatchStats(winnerDbId, loserDbId);
            }
        } catch (error) {
            console.error("Failed to process abandoned game:", error);
        } finally {
            this.gameManager.deleteSession(gameId);
        }
    }

    // get the player role by his ID
    private getPlayerRole(session: GameSession, userId: string): PlayerRole | null {
        if (session.userIds[PlayerRole.P1] === userId) return PlayerRole.P1;
        if (session.userIds[PlayerRole.P2] === userId) return PlayerRole.P2;
        return null;
    }

    private recordAction(session: GameSession, state: GameState, playerRole: PlayerRole, type: ActionType, data: any) {
        if (!session.dbMatchId) return;

        // insert the action
        session.actionHistory.push({
            match_id: session.dbMatchId,
            turn_number: state.turnCount,
            player_id: session.userIds[playerRole],
            action_type: type,
            action_data: data
        });
    }

    private async handleGameOver(session: GameSession, finalState: GameState) {
        if (!session.dbMatchId) return;

        // get the roles
        const winnerRole = finalState.winner === PlayerRole.P1 ? PlayerRole.P1 : PlayerRole.P2;
        const loserRole = winnerRole === PlayerRole.P1 ? PlayerRole.P2 : PlayerRole.P1;

        const currentDbMatchId = session.dbMatchId;
        session.dbMatchId = undefined;

        // get the ID's
        const winnerDbId = session.userIds[winnerRole] || null;
        const loserDbId = session.userIds[loserRole] || null;

        try {
            // finish the game in DB and also insert the actions
            await MatchRepository.finishMatch(currentDbMatchId, winnerDbId);
            await MatchActionRepository.insertActions(session.actionHistory);

            // update players stats after the game
            if (winnerDbId && loserDbId) {
                await EloService.updateMatchStats(winnerDbId, loserDbId);
            }
        } catch (error) {
            console.error("Failed to save Multiplayer game over stats to DB:", error);
        } finally {
            this.gameManager.deleteSession(finalState.id);
        }
    }
}
