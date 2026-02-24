import { PlayerId, GameState, Position, Wall, GameStatus, Player, PositionUtils } from "./types";

export class GameModel {
    private gameId: string;
    private rows: number;
    private cols: number;
    private players: Record<PlayerId, Player>;
    private currentTurn: PlayerId;
    private walls: Wall[];
    public status: GameStatus;
    public winner: PlayerId | null;

    constructor(gameId: string) {
        this.gameId = gameId;
        this.rows = 9;
        this.cols = 9;
        this.players = {
            p1: {
                id: 'p1',
                position: { r: 8, c: 4 },
                wallsLeft: 10
            },
            p2: {
                id: 'p2',
                position: { r: 0, c: 4 },
                wallsLeft: 10
            }
        };
        this.currentTurn = 'p1';
        this.status = 'IN_PROGRESS';
        this.winner = null;
        this.walls = [];
    }

    public tryMovePawn(playerId: PlayerId, target: Position): [boolean, GameState] {
        // check if player is allowed to move
        if (this.status === 'FINISHED' || playerId !== this.currentTurn) {
            return [false, this.getState()];
        }

        // check if the target is in the board
        if (!PositionUtils.isValid(target, this.rows, this.cols)) {
            return [false, this.getState()];
        }

        // get the player position
        const currentPos = this.players[playerId].position;
        const opponentId = playerId === 'p1' ? 'p2' : 'p1';
        const opponentPos = this.players[opponentId].position;

        // check if the target is near pos
        const rowDiff = Math.abs(target.r - currentPos.r);
        const colDiff = Math.abs(target.c - currentPos.c);

        if (rowDiff + colDiff == 1) {
            // check if the target is the opponent
            if (PositionUtils.equals(target, opponentPos)) {
                return [false, this.getState()];
            }

            // check if blocked by wall
            if (this.blockedByWall(currentPos, target)) {
                return [false, this.getState()];
            }

            // move the pawn
            this.movePawn(playerId, target);
            return [true, this.getState()];
        }
        // straight jump
        else if ((rowDiff == 2 && colDiff == 0) || (rowDiff == 0 && colDiff == 2)) {
            // check if the oppenent is in the way
            const rowAvg = (currentPos.r + target.r) / 2;
            const colAvg = (currentPos.c + target.c) / 2;
            if (!(opponentPos.r === rowAvg && opponentPos.c === colAvg)) {
                return [false, this.getState()];
            }

            // check that the way is not blocked by wall
            if (this.blockedByWall(opponentPos, target) || this.blockedByWall(currentPos, opponentPos)) {
                return [false, this.getState()];
            }

            // move the pawn
            this.movePawn(playerId, target);
            return [true, this.getState()];
        }

        else {
            return [false, this.getState()];
        }
    }

    private movePawn(playerId: PlayerId, target: Position): void {
        // move the pawn
        this.players[playerId].position = target;

        // check if the player won
        this.checkWin();

        // switch the turn
        this.currentTurn = playerId === 'p1' ? 'p2' : 'p1';

    }

    private blockedByWall(pos1: Position, pos2: Position): boolean {
        // check if the wall is between pos1 and pos2
        for (const wall of this.walls) {
            if ((PositionUtils.equals(wall.start, pos1) && PositionUtils.equals(wall.end, pos2))
                || (PositionUtils.equals(wall.start, pos2) && PositionUtils.equals(wall.end, pos1))) {
                return true;
            }
        }
        return false;
    }

    private checkWin(): void {
        // check if the game ended
        if (this.players.p1.position.r === 0) {
            this.status = 'FINISHED';
            this.winner = 'p1';
        }
        if (this.players.p2.position.r === 8) {
            this.status = 'FINISHED';
            this.winner = 'p2';
        }
    }

    private getState(): GameState {
        return {
            id: this.gameId,
            rows: this.rows,
            cols: this.cols,
            player1: this.players.p1,
            player2: this.players.p2,
            turn: this.currentTurn,
            status: this.status,
            walls: this.walls,
            winner: this.winner
        };
    }
}
