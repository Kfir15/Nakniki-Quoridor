import { Position } from "./Position";
import { CellType } from "./BoardManager";

export type Orientation = "h" | "v";

export type PlayerId = 'p1' | 'p2';

export interface Player {
    id: PlayerId;
    position: Position;
    wallsLeft: number;
    targetRow: number;
}

export type GameStatus = 'WAITING' | 'IN_PROGRESS' | 'FINISHED';

export interface GameState {
    id: string;
    size: number;
    player1: Player;
    player2: Player;
    turn: PlayerId;
    status: GameStatus;
    winner: PlayerId | null;
    extendedBoard?: CellType[][];
}
