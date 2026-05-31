import { PlayerRole, Orientation, GameStatus } from '../types/game.enums';
import { Position } from '../models/Position';
import { BoardManager } from '../models/BoardManager';
import { type GameState } from '../types/game.interfaces';

export class ActionsValidator {

    public static isValidPawnMove(state: GameState, playerId: PlayerRole, target: Position, boardManager: BoardManager): boolean {
        // check if player is allowed to move
        if (state.status !== GameStatus.IN_PROGRESS || playerId !== state.turn) {
            return false;
        }

        // check if the target is in the board
        if (!target.isWithinBounds(state.size)) {
            return false;
        }

        // get the players position
        const currentPos = playerId === PlayerRole.P1 ? state.player1.position : state.player2.position;
        const opponentId = playerId === PlayerRole.P1 ? PlayerRole.P2 : PlayerRole.P1;
        const opponentPos = opponentId === PlayerRole.P1 ? state.player1.position : state.player2.position;
        
        // --- THE CORE FIX: Convert differences to absolute numbers so P2 can move downwards! ---
        const { rowDiff, colDiff } = currentPos.getDiff(target);
        const absRow = Math.abs(rowDiff);
        const absCol = Math.abs(colDiff);

        // regular move
        if (absRow + absCol === 1) {
            // check if the target is the opponent
            if (target.equals(opponentPos)) {
                return false;
            }

            // check if move blocked by wall
            if (boardManager.isMoveBlocked(currentPos, target)) {
                return false;
            }

            return true;
        }
        // jump above opponent
        else if ((absRow === 2 && absCol === 0) || (absRow === 0 && absCol === 2)) {
            // check if the oppenent is in the way
            const avgPos = new Position((currentPos.r + target.r) / 2, (currentPos.c + target.c) / 2);
            if (!opponentPos.equals(avgPos)) {
                return false;
            }

            // check that the way is not blocked by wall
            if (boardManager.isMoveBlocked(currentPos, opponentPos) || boardManager.isMoveBlocked(opponentPos, target)) {
                return false;
            }

            return true;
        }
        // Opponent in front and blocked by wall behind them (diagonal move)
        else if (absRow === 1 && absCol === 1) {
            const { rowDiff: oppRowDiff, colDiff: oppColDiff } = currentPos.getDiff(opponentPos);

            // Checking if the opponent is one tile away from the player
            if (Math.abs(oppRowDiff) + Math.abs(oppColDiff) != 1) {
                return false;
            }
            
            // First saves the true value diff (positive or negative) to calculate the position behind the opponent
            const { rowDiff: oppRowTrueDiff, colDiff: oppColTrueDiff } = opponentPos.getTrueValueDiff(currentPos);
            const opponentFrontPos = new Position(opponentPos.r + oppRowTrueDiff, opponentPos.c + oppColTrueDiff);

            // If the way to the opponent is blocked,
            if (boardManager.isMoveBlocked(currentPos, opponentPos)) {
                return false;
            }

            // Checking if the opponent is at the edge of the board, if not, checking if the position in front of the opponent is blocked
            if (opponentFrontPos.isWithinBounds(state.size)) {
                if (!boardManager.isMoveBlocked(opponentPos, opponentFrontPos)) {
                    return false;
                }
            }

            // Check if the target is in a diagonal position, and goes through the opponent
            if ((oppRowDiff == 0)) {
                // Opponent is in the same row, so the target should in a different row than the opponent, and the same col
                if (target.c != opponentPos.c || Math.abs(target.r - opponentPos.r) != 1) {
                    return false;
                }
                // Now check if the way from the opponent to the target is blocked or not
                if (boardManager.isMoveBlocked(opponentPos, target)) {
                    return false;
                }

                return true;

            } else {
                // Opponent is in the same column, so the target should be in a different column than the opponent, and the same row
                if (target.r != opponentPos.r || Math.abs(target.c - opponentPos.c) != 1) {
                    return false;
                }
                // Now check if the way from the opponent to the target is blocked or not
                if (boardManager.isMoveBlocked(opponentPos, target)) {
                    return false;
                }
                return true;
            }
        }
        // In case the target tile is more than two moves away, it is illegal.
        return false;
    }

    public static isValidWallPlacement(state: GameState, playerId: PlayerRole, wallPosition: Position, orientation: Orientation, boardManager: BoardManager): boolean {
        // ... (Keep your existing wall validation logic here)
        const player = playerId === PlayerRole.P1 ? state.player1 : state.player2;

        if (state.status !== GameStatus.IN_PROGRESS || playerId !== state.turn || player.wallsLeft <= 0) {
            return false;
        }

        if (!boardManager.canPlaceWall(wallPosition, orientation)) {
            return false;
        }

        boardManager.placeWall(wallPosition, orientation);
        const hasPathP1 = boardManager.hasPath(state.player1.position, state.player1.targetRow);
        const hasPathP2 = boardManager.hasPath(state.player2.position, state.player2.targetRow);
        boardManager.removeWall(wallPosition, orientation);

        return hasPathP1 && hasPathP2;
    }
}