export class Position {
    // fields
    public readonly r: number;
    public readonly c: number;

    // constructor
    constructor(r: number, c: number) {
        this.r = r;
        this.c = c;
    }

    // check equal
    public equals(other: Position): boolean {
        return this.r === other.r && this.c === other.c;
    }

    // check if the position in bounds
    public isWithinBounds(size: number): boolean {
        return this.r >= 0 && this.r < size && this.c >= 0 && this.c < size;
    }

    // check if adjacent to other position
    public isAdjacentTo(other: Position): boolean {
        const rowDiff = Math.abs(this.r - other.r);
        const colDiff = Math.abs(this.c - other.c);
        return rowDiff + colDiff === 1;
    }

    // get diff between two positions
    public getDiff(other: Position) {
        return {
            rowDiff: Math.abs(this.r - other.r),
            colDiff: Math.abs(this.c - other.c)
        };
    }

    // Returns the coordinates of THIS minus the coordinates of OTHER, without taking the absolute value.
    public getTrueValueDiff(other: Position) {
        return {
            rowDiff: this.r - other.r,
            colDiff: this.c - other.c
        };
    }
}