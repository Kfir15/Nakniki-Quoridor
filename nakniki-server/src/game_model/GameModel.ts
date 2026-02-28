import { PlayerId, GameState, GameStatus, Player, Orientation } from "./types";
import { Position } from "./Position";
import { BoardManager } from "./BoardManager";

const BOARD_SIZE = 9
const MIDDLE_COL_OF_BOARD = ((BOARD_SIZE - 1) / 2)
const INITIAL_WALLS = 10;

export class GameModel {
    private gameId: string;
    private size: number;
    private players: Record<PlayerId, Player>;
    private currentTurn: PlayerId;
    private boardManager: BoardManager;
    public status: GameStatus;
    public winner: PlayerId | null;

    constructor(gameId: string) {
        this.gameId = gameId;
        this.size = BOARD_SIZE;
        this.boardManager = new BoardManager(this.size);
        this.players = {
            p1: {
                id: 'p1',
                position: new Position(BOARD_SIZE - 1, MIDDLE_COL_OF_BOARD),
                wallsLeft: INITIAL_WALLS,
                targetRow: 0,
            },
            p2: {
                id: 'p2',
                position: new Position(0, MIDDLE_COL_OF_BOARD),
                wallsLeft: INITIAL_WALLS,
                targetRow: BOARD_SIZE - 1,
            }
        };
        this.currentTurn = 'p1';
        this.status = 'IN_PROGRESS';
        this.winner = null;
    }

    public tryPlaceWall(playerId: PlayerId, wallPosition: Position, orientation: Orientation): [boolean, GameState] {
        // check if player is allowed to place wall
        if (this.status === 'FINISHED' || playerId !== this.currentTurn || this.players[playerId].wallsLeft <= 0) {
            return [false, this.getState()];
        }

        // check if the wall can be placed in the desired position
        if (!this.boardManager.canPlaceWall(wallPosition, orientation)) {
            return [false, this.getState()];
        }

        // place the wall
        this.boardManager.placeWall(wallPosition, orientation);

        // Check there is paths
        if (!this.boardManager.hasPath(this.players.p1.position, this.players.p1.targetRow)
             || !this.boardManager.hasPath(this.players.p2.position, this.players.p2.targetRow)) {
            // if not, remove the wall and return false
            this.boardManager.removeWall(wallPosition, orientation);
            return [false, this.getState()];
        }

        // Decrease the player's walls left
        this.players[playerId].wallsLeft--;

        // Switch the turn
        this.currentTurn = playerId === 'p1' ? 'p2' : 'p1';
        return [true, this.getState()];
    }
    
    public tryMovePawn(playerId: PlayerId, target: Position): [boolean, GameState] {
        // check if player is allowed to move
        if (this.status === 'FINISHED' || playerId !== this.currentTurn) {
            return [false, this.getState()];
        }

        // check if the target is in the board
        if (!target.isWithinBounds(this.size)) {
            return [false, this.getState()];
        }

        // get the players position
        const currentPos = this.players[playerId].position;
        const opponentId = playerId === 'p1' ? 'p2' : 'p1';
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
    private movePawn(playerId: PlayerId, target: Position): void {
        // Move the pawn
        this.players[playerId].position = target;

        // Check if the player won
        this.checkWin();

        // Switch the turn
        if (this.status !== 'FINISHED') {
            this.currentTurn = playerId === 'p1' ? 'p2' : 'p1';
        }
    }

    private checkWin(): void {
        // check if a player has reached their end goal
        if (this.players.p1.position.r === this.players.p1.targetRow) {
            this.status = 'FINISHED';
            this.winner = 'p1';
        }
        if (this.players.p2.position.r === this.players.p2.targetRow) {
            this.status = 'FINISHED';
            this.winner = 'p2';
        }
    }
    
    public getState(): GameState {
        return {
            id: this.gameId,
            size: this.size,
            player1: this.players.p1,
            player2: this.players.p2,
            turn: this.currentTurn,
            status: this.status,
            winner: this.winner,
            extendedBoard: this.boardManager.getBoard()
        };
    }
}
