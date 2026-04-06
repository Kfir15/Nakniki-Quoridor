import { GameState, Player } from "../types/game.interfaces";
import { Position } from "./Position";
import { BoardManager } from "./BoardManager";
import { GAME_CONSTANTS as G } from "../constants/game.constants";
import { PlayerRole, GameStatus, Orientation } from "../types/game.enums";

export class GameModel {
    private gameId: string;
    private size: number;
    private players: Record<PlayerRole, Player>;
    private currentTurn: PlayerRole;
    private boardManager: BoardManager;
    private turnCount: number;
    public status: GameStatus;
    public winner: PlayerRole | null;

    constructor(gameId: string) {
        this.gameId = gameId;
        this.size = G.BOARD_SIZE;
        this.boardManager = new BoardManager(this.size);
        this.players = {
            [PlayerRole.P1]: {
                id: PlayerRole.P1,
                position: new Position(G.BOARD_SIZE - 1, G.MIDDLE_COL_OF_BOARD),
                wallsLeft: G.INITIAL_WALLS,
                targetRow: 0,
            },
            [PlayerRole.P2]: {
                id: PlayerRole.P2,
                position: new Position(0, G.MIDDLE_COL_OF_BOARD),
                wallsLeft: G.INITIAL_WALLS,
                targetRow: G.BOARD_SIZE - 1,
            }
        };
        this.currentTurn = PlayerRole.P1;
        this.status = GameStatus.WAITING;
        this.turnCount = 0;
        this.winner = null;
    }

    // start the game
    public startGame(): void {
        if (this.status === GameStatus.WAITING) {
            this.status = GameStatus.IN_PROGRESS;
        }
    }

    public skipTurn(): [boolean, GameState] {
        // check if this is actually the player turn
        if (this.status !== GameStatus.IN_PROGRESS) {
            return [false, this.getState()];
        }

        // change the trun
        this.changeTurn(this.currentTurn);
        this.turnCount++;

        return [true, this.getState()];
    }

    public tryPlaceWall(playerId: PlayerRole, wallPosition: Position, orientation: Orientation): [boolean, GameState] {
        // check if player is allowed to place wall
        if (this.status !== GameStatus.IN_PROGRESS || playerId !== this.currentTurn || this.players[playerId].wallsLeft <= 0) {
            return [false, this.getState()];
        }

        // check if the wall can be placed in the desired position
        if (!this.boardManager.canPlaceWall(wallPosition, orientation)) {
            return [false, this.getState()];
        }

        // place the wall
        this.boardManager.placeWall(wallPosition, orientation);

        // Check there is paths
        if (!this.boardManager.hasPath(this.players[PlayerRole.P1].position, this.players[PlayerRole.P1].targetRow)
            || !this.boardManager.hasPath(this.players[PlayerRole.P2].position, this.players[PlayerRole.P2].targetRow)) {
            // if not, remove the wall and return false
            this.boardManager.removeWall(wallPosition, orientation);
            return [false, this.getState()];
        }

        // Decrease the player's walls left
        this.players[playerId].wallsLeft--;

        this.turnCount++;

        // Switch the turn
        this.changeTurn(playerId);
        return [true, this.getState()];
    }

    public tryMovePawn(playerId: PlayerRole, target: Position): [boolean, GameState] {
        // check if player is allowed to move
        if (this.status !== GameStatus.IN_PROGRESS || playerId !== this.currentTurn) {
            return [false, this.getState()];
        }

        // check if the target is in the board
        if (!target.isWithinBounds(this.size)) {
            return [false, this.getState()];
        }

        // get the players position
        const currentPos = this.players[playerId].position;
        const opponentId = playerId === PlayerRole.P1 ? PlayerRole.P2 : PlayerRole.P1;
        const opponentPos = this.players[opponentId].position;

        // check if the target is near pos
        const { rowDiff, colDiff } = currentPos.getDiff(target);

        // regular move
        if (rowDiff + colDiff == 1) {
            // check if the target is the opponent
            if (target.equals(opponentPos)) {
                return [false, this.getState()];
            }

            // check if move blocked by wall
            if (this.boardManager.isMoveBlocked(currentPos, target)) {
                return [false, this.getState()];
            }

            // move the pawn
            this.movePawn(playerId, target);
            return [true, this.getState()];
        }
        // jump above opponent
        else if ((rowDiff == 2 && colDiff == 0) || (rowDiff == 0 && colDiff == 2)) {
            // check if the oppenent is in the way
            const avgPos = new Position((currentPos.r + target.r) / 2, (currentPos.c + target.c) / 2);
            if (!opponentPos.equals(avgPos)) {
                return [false, this.getState()];
            }

            // check that the way is not blocked by wall
            if (this.boardManager.isMoveBlocked(currentPos, opponentPos) || this.boardManager.isMoveBlocked(opponentPos, target)) {
                return [false, this.getState()];
            }

            // move the pawn
            this.movePawn(playerId, target);
            return [true, this.getState()];
        }
        // Opponent in front and blocked by wall behind them (diagonal move)
        else if (rowDiff == 1 && colDiff == 1) {
            const { rowDiff: oppRowDiff, colDiff: oppColDiff } = currentPos.getDiff(opponentPos);

            // Checking if the opponent is one tile away from the player
            if (Math.abs(oppRowDiff) + Math.abs(oppColDiff) != 1) {
                return [false, this.getState()];
            }
            // Check if there is a wall blocking the jump over the opponent
            // First saves the true value diff (positive or negative) to calculate the position behind the opponent
            const { rowDiff: oppRowTrueDiff, colDiff: oppColTrueDiff } = opponentPos.getTrueValueDiff(currentPos);
            const opponentFrontPos = new Position(opponentPos.r + oppRowTrueDiff, opponentPos.c + oppColTrueDiff);

            // If the way to the opponent is blocked,
            if (this.boardManager.isMoveBlocked(currentPos, opponentPos)) {
                return [false, this.getState()];
            }

            // Checking if the opponent is at the edge of the board, if not, checking if the position in front of the opponent is blocked
            if (opponentFrontPos.isWithinBounds(this.size)) {
                if (!this.boardManager.isMoveBlocked(opponentPos, opponentFrontPos)) {
                    return [false, this.getState()];
                }
            }

            // Check if the target is in a diagonal position, and goes through the opponent
            // First we check whether the opponent is in the same row or column as the player.
            // Then we check if the target is in the correct diagonal position (relative to the opponent)
            if ((oppRowDiff == 0)) {
                // Opponent is in the same row, so the target should in a different row than the opponent, and the same col
                if (target.c != opponentPos.c || Math.abs(target.r - opponentPos.r) != 1) {
                    return [false, this.getState()];
                }
                // Now check if the way from the opponent to the target is blocked or not
                if (this.boardManager.isMoveBlocked(opponentPos, target)) {
                    return [false, this.getState()];
                }
                // If we passed all checks, the mvoe is legal, so we move the pawn
                this.movePawn(playerId, target);
                return [true, this.getState()];

            } else {
                // Opponent is in the same column, so the target should be in a different column than the opponent, and the same row
                if (target.r != opponentPos.r || Math.abs(target.c - opponentPos.c) != 1) {
                    return [false, this.getState()];
                }
                // Now check if the way from the opponent to the target is blocked or not
                if (this.boardManager.isMoveBlocked(opponentPos, target)) {
                    return [false, this.getState()];
                }
                // If we passed all checks, the mvoe is legal, so we move the pawn
                this.movePawn(playerId, target);
                return [true, this.getState()];
            }
        }
        // In case the target tile is more than two moves away, it is illegal.
        else {
            return [false, this.getState()];
        }

    }

    // Moves the pawn (assuming the move is valid)
    private movePawn(playerId: PlayerRole, target: Position): void {
        // Move the pawn
        this.players[playerId].position = target;

        this.turnCount++;

        // Check if the player won
        this.checkWin();

        // Switch the turn
        if (this.status !== GameStatus.FINISHED) {
            this.changeTurn(playerId);
        }
    }

    private checkWin(): void {
        if (this.players[PlayerRole.P1].position.r === this.players[PlayerRole.P1].targetRow) {
            this.status = GameStatus.FINISHED;
            this.winner = PlayerRole.P1;
        }
        if (this.players[PlayerRole.P2].position.r === this.players[PlayerRole.P2].targetRow) {
            this.status = GameStatus.FINISHED;
            this.winner = PlayerRole.P2;
        }
    }

    private changeTurn(playerId: PlayerRole): void {
        this.currentTurn = playerId === PlayerRole.P1 ? PlayerRole.P2 : PlayerRole.P1;
    }

    public getState(): GameState {
        return {
            id: this.gameId,
            size: this.size,
            player1: this.players[PlayerRole.P1],
            player2: this.players[PlayerRole.P2],
            turn: this.currentTurn,
            status: this.status,
            winner: this.winner,
            turnCount: this.turnCount,
            extendedBoard: this.boardManager.getBoard()
        };
    }
}
