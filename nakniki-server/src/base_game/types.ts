export type PlayerId = 'p1' | 'p2';

export interface Player {
    id: PlayerId;
    position: Position;
    wallsLeft: number;
}

export interface Position {
    r: number;
    c: number;
}

export interface Wall {
    start: Position;
    end: Position;
}

export type GameStatus = 'IN_PROGRESS' | 'FINISHED';

export interface GameState {
    id: string;
    rows: number;
    cols: number;
    player1: Player;
    player2: Player;
    turn: PlayerId;
    status: GameStatus;
    walls: Wall[];
    winner: PlayerId | null;
}

export const PositionUtils = {
    equals: (p1: Position, p2: Position): boolean => {
        return p1.r === p2.r && p1.c === p2.c;
    },

    isValid: (pos: Position, rows: number, cols: number): boolean => {
        return pos.r >= 0 && pos.r < rows && pos.c >= 0 && pos.c < cols;
    }
};