import { Position } from "../models/Position";
import { CellType, PlayerRole, GameStatus } from "./game.enums";

export interface Player {
    id: PlayerRole;
    position: Position;
    wallsLeft: number;
    targetRow: number;
}

export interface GameState {
    id: string;
    size: number;
    player1: Player;
    player2: Player;
    turn: PlayerRole;
    status: GameStatus;
    winner: PlayerRole | null;
    turnCount: number,
    extendedBoard?: CellType[][];
}