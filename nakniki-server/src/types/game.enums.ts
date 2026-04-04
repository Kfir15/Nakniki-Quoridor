export enum PlayerRole {
    P1 = 'p1',
    P2 = 'p2'
}

export enum CellType {
    CELL = "cell",
    WALL = "wall",
    EMPTY = "empty",
    INTERSECTION = "intersection"
}

export enum Orientation {
    HORIZONTAL = "h",
    VERTICAL = "v"
}

export enum GameStatus {
    WAITING = 'WAITING',
    IN_PROGRESS = 'IN_PROGRESS',
    FINISHED = 'FINISHED'
}