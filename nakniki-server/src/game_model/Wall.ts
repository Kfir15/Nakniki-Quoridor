import { Position } from "./Position";

export class Wall {
    // fields
    public readonly start: Position;
    public readonly end: Position;

    // constructor
    constructor(start: Position, end: Position) {
        this.start = start;
        this.end = end;
    }

    // check if wall blocks move
    public blocksMove(p1: Position, p2: Position): boolean {
        return (this.start.equals(p1) && this.end.equals(p2)) ||
            (this.start.equals(p2) && this.end.equals(p1));
    }
}