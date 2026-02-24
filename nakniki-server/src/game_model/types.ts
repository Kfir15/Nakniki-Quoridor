import { Position } from "./Position";
import { Wall } from "./Wall";

export type PlayerId = 'p1' | 'p2';

export interface Player {
    id: PlayerId;
    position: Position;
    wallsLeft: number;
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
