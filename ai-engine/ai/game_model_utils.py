import copy


def parse_state(game_state: dict) -> dict:
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
            if cell == "wall":
                walls.add((r, c))

    # add the walls to the state
    new_state["walls"] = frozenset(walls)

    return new_state


def get_state_values(state):
    """
    get the current game state and return all state values
    """

    id = state["id"]
    size = state["size"]
    player1 = state["player1"]
    player2 = state["player2"]
    turn = state["turn"]
    status = state["status"]
    walls = state["walls"]

    return id, size, player1, player2, turn, status, walls


def get_players_positions(state):
    """
    get the players positions
    """

    _, _, player1, player2, turn, _, _ = get_state_values(state)

    player = player1 if turn == "p1" else player2
    opponent = player2 if turn == "p1" else player1
    player_pos = player["position"]
    opponent_pos = opponent["position"]

    return player_pos["r"], player_pos["c"], opponent_pos["r"], opponent_pos["c"]


def get_player_walls_left(state):
    """
    get the number of walls left for the current player
    """
    _, _, player1, player2, turn, _, _ = get_state_values(state)
    player = player1 if turn == "p1" else player2
    return player["wallsLeft"]


def get_players_ids(state):
    """
    returns the players ids
    """
    _, _, player1, player2, turn, _, _ = get_state_values(state)
    player = player1 if turn == "p1" else player2
    opponent = player2 if turn == "p1" else player1
    return player["id"], opponent["id"]


def get_target_rows(state):
    """
    return the target rows of the players
    """
    _, _, player1, player2, turn, _, _ = get_state_values(state)
    player = player1 if turn == "p1" else player2
    opponent = player2 if turn == "p1" else player1
    return player["targetRow"], opponent["targetRow"]
