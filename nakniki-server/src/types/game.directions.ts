import { Position } from "../game_model/Position";

const UP = new Position(-1, 0);
const DOWN = new Position(1, 0);
const LEFT = new Position(0, -1);
const RIGHT = new Position(0, 1);


export const DIRECTIONS = [
    UP,
    DOWN,
    LEFT,
    RIGHT,
] as const;