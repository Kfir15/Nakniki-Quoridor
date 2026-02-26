import { Position } from "./Position";
import { Orientation } from "./types";

export type CellType = "cell" | "wall" | "empty" | "intersection";

export class BoardManager {
    private board: CellType[][];
    private boardSize: number;
    private originalSize: number;

    constructor(s: number) {
        this.originalSize = s;
        this.boardSize = 2 * s - 1;
        // A board that contains both cells and paths between cells, cells are located on spots with only even coordinates, edges are located on one even coordinate and one uneven. Intersects/irrelevant spots are located on both uneven coordinates.
        this.board = Array.from({ length: this.boardSize }, () => Array(this.boardSize).fill("cell"));

        // Fills the boardManager with corresponding values - cell for cells, intersections for paths between cells, and empty if the spot does not exist/matter in the actual game board
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (i % 2 === 0 && j % 2 == 0) {
                    this.board[i]![j] = "cell";
                }
                else if (i % 2 === 1 && j % 2 === 1) {
                    this.board[i]![j] = "intersection"
                }
                else {
                    this.board[i]![j] = "empty"
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
        if (o == "h") {
            const r = pos.r * 2 + 1;
            const c = pos.c * 2;
            return this.board[r]![c] === "empty" && this.board[r]![c + 1] === "intersection" && this.board[r]![c + 2] === "empty";
        }
        else {
            const c = pos.c * 2 + 1;
            const r = pos.r * 2;
            return this.board[r]![c] === "empty" && this.board[r + 1]![c] === "intersection" && this.board[r + 2]![c] === "empty";
        }
    }

    // Places a wall (after we've already ensured it is a legal move)
    public placeWall(pos: Position, o: Orientation): void {
        // If horizontal, we need to place a wall in the middle of the 3 cells below the position
        if (o == "h") {
            const r = pos.r * 2 + 1;
            const c = pos.c * 2;
            this.board[r]![c] = "wall";
            this.board[r]![c + 1] = "wall";
            this.board[r]![c + 2] = "wall";
        }
        // If vertical, we need to place a wall in the middle of the 3 cells to the right of the position
        else {
            const c = pos.c * 2 + 1;
            const r = pos.r * 2;
            this.board[r]![c] = "wall";
            this.board[r + 1]![c] = "wall";
            this.board[r + 2]![c] = "wall";
        }       
    }

    public removeWall(pos: Position, o: Orientation): void {
        if (o == "h") {
            // If horizontal, we need to place empty in the outer slots (the leftmost and rightmost ones), and in the middle place "intersection"
            const r = pos.r * 2 + 1;
            const c = pos.c * 2;
            this.board[r]![c] = "empty";
            this.board[r]![c + 1] = "intersection";
            this.board[r]![c + 2] = "empty";
        }
        else {
            // If Vertical , we need to place empty in the outer slots (the upmost and downmost ones), and in the middle place "intersection"
            const c = pos.c * 2 + 1;
            const r = pos.r * 2;
            this.board[r]![c] = "empty";
            this.board[r + 1]![c] = "intersection";
            this.board[r + 2]![c] = "empty";
        } 
       
    }

    // Assuming start and target are neighbors on the game board, and are legal squares
    public isMoveBlocked(start: Position, target: Position): boolean {
        
        // Translates the positions on the game matrix into the boardManager matrix
        const new_start = new Position(start.r * 2, start.c * 2);
        const new_target = new Position(target.r * 2, target.c * 2);
        
        // Checks if the edge to the next cell (located in between the two cells) is clear
        const middle_cell = new Position((new_start.r + new_target.r) / 2, (new_start.c + new_target.c) / 2);
        return this.board[middle_cell.r]![middle_cell.c] === "wall";
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

        // Directions for moving
        const directions = [
            { dr: -1, dc: 0 }, // up
            { dr: 1, dc: 0 },  // down
            { dr: 0, dc: -1 }, // left
            { dr: 0, dc: 1 }   // right
        ];

        // BFS loop
        while (queue.length > 0) {
            const current = queue.shift()!;

            // Check if we've reached the target row
            if (current.r === rowTarget) {
                return true;
            }

            // Check all adjacent positions
            for (const dir of directions) {
                // get the next position
                const newR = current.r + dir.dr;
                const newC = current.c + dir.dc;
                const nextPos = new Position(newR, newC);
                
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
    