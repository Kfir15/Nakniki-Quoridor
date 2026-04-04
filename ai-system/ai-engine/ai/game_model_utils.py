import copy
from typing import Dict, Any, Tuple
from .common.enums import CellType, PlayerRole


def parse_state(game_state: Dict[str, Any]) -> Dict[str, Any]:
    """
    get the game state and return new state with walls as a set of coordinates
    """
    # create a deep copy of the state
    new_state = copy.deepcopy(game_state)

    # remove the extendedBoard from the state
    extended_board = new_state.pop("extendedBoard", [])

    # find all the walls in the extendedBoard
    walls = set()
    for r, row in enumerate(extended_board):
        for c, cell in enumerate(row):
            if cell == CellType.WALL:
                walls.add((r, c))

    # add the walls to the state
    new_state["walls"] = frozenset(walls)

    return new_state


def get_state_values(state: Dict[str, Any]) -> Tuple:
    return (
        state["id"],
        state["size"],
        state["player1"],
        state["player2"],
        state["turn"],
        state["status"],
        state["walls"],
    )


def get_players_positions(state: Dict[str, Any]) -> Tuple[int, int, int, int]:
    """
    get the players positions
    """

    _, _, player1, player2, turn, _, _ = get_state_values(state)

    player = player1 if turn == PlayerRole.P1 else player2
    opponent = player2 if turn == PlayerRole.P1 else player1
    player_pos = player["position"]
    opponent_pos = opponent["position"]

    return player_pos["r"], player_pos["c"], opponent_pos["r"], opponent_pos["c"]


def get_player_walls_left(state: Dict[str, Any]) -> int:
    """
    get the number of walls left for the current player
    """
    _, _, player1, player2, turn, _, _ = get_state_values(state)
    player = player1 if turn == PlayerRole.P1 else player2
    return player["wallsLeft"]


def get_players_ids(state: Dict[str, Any]) -> Tuple[str, str]:
    """
    returns the players ids
    """
    _, _, player1, player2, turn, _, _ = get_state_values(state)
    player = player1 if turn == PlayerRole.P1 else player2
    opponent = player2 if turn == PlayerRole.P1 else player1
    return player["id"], opponent["id"]


def get_target_rows(state: Dict[str, Any]) -> Tuple[int, int]:
    """
    return the target rows of the players
    """
    _, _, player1, player2, turn, _, _ = get_state_values(state)
    player = player1 if turn == PlayerRole.P1 else player2
    opponent = player2 if turn == PlayerRole.P1 else player1
    return player["targetRow"], opponent["targetRow"]


def get_current_player(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    get the current player
    """
    _, _, player1, player2, turn, _, _ = get_state_values(state)
    player = player1 if turn == PlayerRole.P1 else player2
    return player


def get_opponent(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    get the opponent
    """
    _, _, player1, player2, turn, _, _ = get_state_values(state)
    opponent = player2 if turn == PlayerRole.P1 else player1
    return opponent


def check_game_over(state: Dict[str, Any]) -> bool:
    """
    get game state
    return True if the game is over, False otherwise
    """

    _, _, player1, player2, _, _, _ = get_state_values(state)

    # check if the player reached the target
    if player1["position"]["r"] == player1["targetRow"]:
        return True
    if player2["position"]["r"] == player2["targetRow"]:
        return True

    return False


def fast_copy_state(state: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": state.get("id"),
        "size": state["size"],
        "turn": state["turn"],
        "status": state["status"],
        "walls": state["walls"],
        "player1": {
            "id": state["player1"]["id"],
            "wallsLeft": state["player1"]["wallsLeft"],
            "targetRow": state["player1"]["targetRow"],
            "position": {
                "r": state["player1"]["position"]["r"],
                "c": state["player1"]["position"]["c"],
            },
        },
        "player2": {
            "id": state["player2"]["id"],
            "wallsLeft": state["player2"]["wallsLeft"],
            "targetRow": state["player2"]["targetRow"],
            "position": {
                "r": state["player2"]["position"]["r"],
                "c": state["player2"]["position"]["c"],
            },
        },
    }
