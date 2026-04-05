import { GameManager, GameSession } from '../game_model/GameManager';
import { MatchRepository } from '../repositories/MatchRepository';
import { MatchActionRepository } from '../repositories/MatchActionRepository';
import { PlayerRole, GameStatus, Orientation } from '../types/game.enums';
import { Position } from '../game_model/Position';
import { GameState } from '../types/game.interfaces';
import { AI_CONSTANTS as AI } from '../constants/ai.constants';
import { GAME_CONSTANTS as G } from '../constants/game.constants';

type ActionType = typeof G.ACTION_TYPES[keyof typeof G.ACTION_TYPES];

interface AIResponse {
    actionType: ActionType;
    targetRow: number;
    targetCol: number;
    orientation?: Orientation;
}

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

        // try to move the pawn
        const [success, newState] = session.game.tryMovePawn(PlayerRole.P1, target);
        if (!success) return null;

        // record the action
        this.recordAction(session, newState, G.ACTION_TYPES.MOVE, { r: target.r, c: target.c });

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

        // try to place the wall
        const [success, newState] = session.game.tryPlaceWall(PlayerRole.P1, pos, orient);
        if (!success) return null;

        // record the action
        this.recordAction(session, newState, G.ACTION_TYPES.WALL, { r: pos.r, c: pos.c, orient });

        // if the game ended
        if (newState.status === GameStatus.FINISHED) {
            await this.handleGameOver(session, newState);
        }

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

            const aiMove: AIResponse = await response.json();
            let success = false;
            let newState = currentState;

            // if this is move pawn action
            if (aiMove.actionType === G.ACTION_TYPES.MOVE) {
                // get the target pos
                const targetPos = new Position(aiMove.targetRow, aiMove.targetCol);

                // move the pawn
                [success, newState] = session.game.tryMovePawn(PlayerRole.P2, targetPos);

                // record the action
                if (success) this.recordAction(session, newState, G.ACTION_TYPES.MOVE, { r: targetPos.r, c: targetPos.c });
            }
            // if this is wall placement action
            else if (aiMove.actionType === G.ACTION_TYPES.WALL && aiMove.orientation) {
                // get the wall pos
                const wallPos = new Position(aiMove.targetRow, aiMove.targetCol);

                // try to place the wall
                [success, newState] = session.game.tryPlaceWall(PlayerRole.P2, wallPos, aiMove.orientation);

                // record the action
                if (success) this.recordAction(session, newState, G.ACTION_TYPES.WALL, { r: wallPos.r, c: wallPos.c, orient: aiMove.orientation });
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

    private recordAction(session: GameSession, state: GameState, type: ActionType, data: any) {
        if (!session.dbMatchId) return;

        // get the action player id
        const justPlayed = state.turn === PlayerRole.P1 ? PlayerRole.P2 : PlayerRole.P1;

        // insert the action
        session.actionHistory.push({
            match_id: session.dbMatchId,
            turn_number: state.turnCount,
            player_id: session.userIds[justPlayed],
            action_type: type,
            action_data: data
        });
    }

    private async handleGameOver(session: GameSession, finalState: GameState) {
        if (!session.dbMatchId) return;

        // get the winner DB id
        const isHumanWon = finalState.winner === PlayerRole.P1;
        const winnerDbId = isHumanWon ? session.userIds[PlayerRole.P1] : null;

        try {
            // finish the game in DB and also insert the actions
            await MatchRepository.finishMatch(session.dbMatchId, winnerDbId);
            await MatchActionRepository.insertActions(session.actionHistory);
            this.gameManager.deleteSession(finalState.id);
        } catch (error) {
            throw error;
        }
    }
}