import { GameManager, GameSession } from '../game_model/GameManager';
import { MatchRepository } from '../repositories/MatchRepository';
import { ActionManager } from './ActionManager';
import { PlayerRole, GameStatus, Orientation, Position, GameState, GAME_CONSTANTS as G } from '@nakniki/shared';
import { AI_CONSTANTS as AI } from '../constants/ai.constants';
type ActionType = typeof G.ACTION_TYPES[keyof typeof G.ACTION_TYPES];

export class AIGameService {
    private gameManager: GameManager;

    constructor(gameManager: GameManager) {
        this.gameManager = gameManager;
    }

    public async startAIGame(userId: string, socketId: string): Promise<{ gameId: string, state: GameState }> {
        // create new ai session
        const { gameId, session } = this.gameManager.createSession(true);

        // insert the id's to the session
        session.userIds[PlayerRole.P1] = userId;
        session.userIds[PlayerRole.P2] = null;

        // insert the sockets
        session.sockets[PlayerRole.P1] = socketId;
        session.sockets[PlayerRole.P2] = null;

        // create the match in the DB
        try {
            session.dbMatchId = await MatchRepository.createMatch(gameId, userId, null, true);
        } catch (error) {
            // if error, delete the session
            this.gameManager.deleteSession(gameId);
            throw error;
        }

        // start the game
        session.game.startGame();
        return { gameId, state: session.game.getState() };
    }

    public async processHumanMovePawn(gameId: string, target: Position): Promise<GameState | null> {
        // get the session
        const session = this.gameManager.getSession(gameId);
        if (!session || session.game.status !== GameStatus.IN_PROGRESS) return null;
        const stateBefore = session.game.getState();

        // try to move the pawn
        const [success, newState] = session.game.tryMovePawn(PlayerRole.P1, target);
        if (!success) return null;

        // record the action
        ActionManager.recordAction(session, stateBefore, PlayerRole.P1, G.ACTION_TYPES.MOVE, { r: target.r, c: target.c }, true);

        // if the game ended
        if (newState.status === GameStatus.FINISHED) {
            await this.handleGameOver(session, newState);
        }

        return newState;
    }

    public async processHumanPlaceWall(gameId: string, pos: Position, orient: Orientation): Promise<GameState | null> {
        // get the session
        const session = this.gameManager.getSession(gameId);
        if (!session || session.game.status !== GameStatus.IN_PROGRESS) return null;
        const stateBefore = session.game.getState();

        // try to place the wall
        const [success, newState] = session.game.tryPlaceWall(PlayerRole.P1, pos, orient);
        if (!success) return null;

        // record the action
        ActionManager.recordAction(session, stateBefore, PlayerRole.P1, G.ACTION_TYPES.WALL, { r: pos.r, c: pos.c, orient }, true);

        // if the game ended
        if (newState.status === GameStatus.FINISHED) {
            await this.handleGameOver(session, newState);
        }

        return newState;
    }

    public async processHumanTimeout(gameId: string): Promise<GameState | null> {
        // get the session
        const session = this.gameManager.getSession(gameId);
        if (!session || session.game.status !== GameStatus.IN_PROGRESS) return null;
        const stateBefore = session.game.getState();

        // skip the turn
        const [success, newState] = session.game.skipTurn();
        if (!success) return null;

        // record the action
        ActionManager.recordAction(session, stateBefore, PlayerRole.P1, G.ACTION_TYPES.SKIP, { reason: "timeout" }, false);

        return newState;
    }

    public async triggerAITurn(gameId: string): Promise<GameState | null> {
        const session = this.gameManager.getSession(gameId);
        if (!session) return null;

        try {
            // get the next ai move
            const currentState = session.game.getState();
            const response = await fetch(`${AI.PROXY_BASE_URL}${AI.ENDPOINTS.GET_MOVE}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ state: currentState }),
            });
            if (!response.ok) throw new Error(`AI Server Error: ${response.status}`);

            // get the AI action from the array
            const rawAiMove = await response.json();
            const [actionType, _playerId, [r, c], orientation] = rawAiMove;
            const targetPos = new Position(r, c);
            let success = false;
            let newState = currentState;

            // if this is move pawn action
            if (actionType === G.ACTION_TYPES.MOVE) {
                // move the pawn
                [success, newState] = session.game.tryMovePawn(PlayerRole.P2, targetPos);

                // record the action
                if (success) {
                    ActionManager.recordAction(session, currentState, PlayerRole.P2, G.ACTION_TYPES.MOVE, { r: targetPos.r, c: targetPos.c }, false);
                }
            }
            // if this is wall placement action
            else if (actionType === G.ACTION_TYPES.WALL && orientation) {
                // try to place the wall
                [success, newState] = session.game.tryPlaceWall(PlayerRole.P2, targetPos, orientation);

                // record the action
                if (success) {
                    ActionManager.recordAction(session, currentState, PlayerRole.P2, G.ACTION_TYPES.WALL, { r, c, orient: orientation }, false);
                }
            }

            // if the ai win, handle game over
            if (success && newState.status === GameStatus.FINISHED) {
                await this.handleGameOver(session, newState);
            }

            return success ? newState : null;
        } catch (error) {
            throw error;
        }
    }

    private async handleGameOver(session: GameSession, finalState: GameState) {
        if (!session.dbMatchId) return;

        // get the winner DB id
        const isHumanWon = finalState.winner === PlayerRole.P1;
        const winnerDbId = isHumanWon ? session.userIds[PlayerRole.P1] : null;

        try {
            // finish the game in DB and also insert the actions
            await MatchRepository.finishMatch(session.dbMatchId, winnerDbId);
            await ActionManager.uploadActions(session);
        } catch (error) {
            console.error("Failed to save AI game over stats to DB:", error);
        } finally {
            session.dbMatchId = undefined;
            this.gameManager.deleteSession(finalState.id);
        }
    }

    public async abandonGame(gameId: string): Promise<void> {
        // get the ssession
        const session = this.gameManager.getSession(gameId);
        if (!session || !session.dbMatchId) return;

        try {
            // make the winner null (this is ai game)
            await MatchRepository.abandonMatch(session.dbMatchId, null);
            await ActionManager.uploadActions(session);
        } catch (error) {
            console.error("Failed to abandon AI game in DB:", error);
        } finally {
            session.dbMatchId = undefined;
            this.gameManager.deleteSession(gameId);
        }
    }
}