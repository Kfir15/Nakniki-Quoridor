from enum import Enum


class PlayerRole(str, Enum):
    P1 = "p1"
    P2 = "p2"


class GameStatus(str, Enum):
    WAITING = "WAITING"
    IN_PROGRESS = "IN_PROGRESS"
    FINISHED = "FINISHED"


class CellType(str, Enum):
    WALL = "wall"
    CELL = "cell"
    EMPTY = "empty"
    INTERSECTION = "intersection"


class Orientation(str, Enum):
    HORIZONTAL = "h"
    VERTICAL = "v"


class ActionType(str, Enum):
    MOVE = "move"
    WALL = "wall"
