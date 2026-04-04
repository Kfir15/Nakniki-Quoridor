import { Position } from "./Position";
import { CellType as C, Orientation } from "../types/game.enums";
import { DIRECTIONS } from "../types/game.directions";

export class BoardManager {
    private board: C[][];
    private boardSize: number;
    private originalSize: number;

    constructor(s: number) {
        this.originalSize = s;
        this.boardSize = 2 * s - 1;
        // A board that contains both cells and paths between cells, cells are located on spots with only even coordinates, edges are located on one even coordinate and one uneven. Intersects/irrelevant spots are located on both uneven coordinates.
        this.board = Array.from({ length: this.boardSize }, () => Array(this.boardSize).fill(C.CELL));

        // Fills the boardManager with corresponding values - cell for cells, intersections for paths between cells, and empty if the spot does not exist/matter in the actual game board
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (i % 2 === 0 && j % 2 == 0) {
                    this.board[i]![j] = C.CELL;
                }
                else if (i % 2 === 1 && j % 2 === 1) {
                    this.board[i]![j] = C.INTERSECTION;
                }
                else {
                    this.board[i]![j] = C.EMPTY;
                }
            }
        }
    }

    // return the board
    public getBoard() {
        return this.board;
    }

    public canPlaceWall(pos: Position, o: Orientation): boolean {
        // Checks if the leftmost cell of the wall is within the bounds of the board minus one (to not cause a wall to go outside of the board)
        if (!pos.isWithinBounds(this.originalSize - 1)) {
            return false;
        }

        // Check that the wall is not overlapping another wall
        if (o == Orientation.HORIZONTAL) {
            const r = pos.r * 2 + 1;
            const c = pos.c * 2;
            return this.board[r]![c] === C.EMPTY && this.board[r]![c + 1] === C.INTERSECTION && this.board[r]![c + 2] === C.EMPTY;
        }
        else {
            const c = pos.c * 2 + 1;
            const r = pos.r * 2;
            return this.board[r]![c] === C.EMPTY && this.board[r + 1]![c] === C.INTERSECTION && this.board[r + 2]![c] === C.EMPTY;
        }
    }

    // Places a wall (after we've already ensured it is a legal move)
    public placeWall(pos: Position, o: Orientation): void {
        // If horizontal, we need to place a wall in the middle of the 3 cells below the position
        if (o == Orientation.HORIZONTAL) {
            const r = pos.r * 2 + 1;
            const c = pos.c * 2;
            this.board[r]![c] = C.WALL;
            this.board[r]![c + 1] = C.WALL;
            this.board[r]![c + 2] = C.WALL;
        }
        // If vertical, we need to place a wall in the middle of the 3 cells to the right of the position
        else {
            const c = pos.c * 2 + 1;
            const r = pos.r * 2;
            this.board[r]![c] = C.WALL;
            this.board[r + 1]![c] = C.WALL;
            this.board[r + 2]![c] = C.WALL;
        }
    }

    public removeWall(pos: Position, o: Orientation): void {
        if (o == Orientation.HORIZONTAL) {
            // If horizontal, we need to place empty in the outer slots (the leftmost and rightmost ones), and in the middle place "intersection"
            const r = pos.r * 2 + 1;
            const c = pos.c * 2;
            this.board[r]![c] = C.EMPTY;
            this.board[r]![c + 1] = C.INTERSECTION;
            this.board[r]![c + 2] = C.EMPTY;
        }
        else {
            // If Vertical , we need to place empty in the outer slots (the upmost and downmost ones), and in the middle place "intersection"
            const c = pos.c * 2 + 1;
            const r = pos.r * 2;
            this.board[r]![c] = C.EMPTY;
            this.board[r + 1]![c] = C.INTERSECTION;
            this.board[r + 2]![c] = C.EMPTY;
        }

    }

    // Assuming start and target are neighbors on the game board, and are legal squares
    public isMoveBlocked(start: Position, target: Position): boolean {

        // Translates the positions on the game matrix into the boardManager matrix
        const new_start = start.multiply(2);
        const new_target = target.multiply(2);

        // Checks if the edge to the next cell (located in between the two cells) is clear
        const middle_cell = new Position((new_start.r + new_target.r) / 2, (new_start.c + new_target.c) / 2);
        return this.board[middle_cell.r]![middle_cell.c] === C.WALL;
    }

    // BFS Algorithm
    public hasPath(start: Position, rowTarget: number): boolean {
        // Visited matrix to keep track of visited positions
        const visited: boolean[][] = Array.from(
            { length: this.originalSize },
            () => Array(this.originalSize).fill(false)
        );

        const queue: Position[] = [start];
        visited[start.r]![start.c] = true;

        // BFS loop
        while (queue.length > 0) {
            const current = queue.shift()!;

            // Check if we've reached the target row
            if (current.r === rowTarget) {
                return true;
            }

            // Check all adjacent positions
            for (const dir of DIRECTIONS) {
                // get the next position
                const nextPos = current.add(dir);

                // check that the next pos is valid
                if (nextPos.r >= 0 && nextPos.r < this.originalSize && nextPos.c >= 0 && nextPos.c < this.originalSize) {
                    if (!this.isMoveBlocked(current, nextPos) && !visited[nextPos.r]![nextPos.c]) {
                        // enter the next position
                        visited[nextPos.r]![nextPos.c] = true;
                        queue.push(nextPos);
                    }
                }
            }
        }
        return false;
    }
}