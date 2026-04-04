import random
from .search_utils import get_path
from .game_model_utils import get_state_values
from .common.enums import PlayerRole


def state_heuristic(state, maximizing_player_id, depth=0):
    """
    get state
    return the state heuristic
    """

    # get the state values
    _, size, player1, player2, turn, _, walls = get_state_values(state)

    # set the max and min players
    if player1["id"] == maximizing_player_id:
        max_p = player1
        min_p = player2
    else:
        max_p = player2
        min_p = player1

    # check if this is goal state
    if max_p["position"]["r"] == max_p["targetRow"]:
        return 100000 + (depth * 1000)
    if min_p["position"]["r"] == min_p["targetRow"]:
        return -100000 - (depth * 1000)

    # get the shortests paths for each player
    max_path = get_path(
        max_p["position"]["r"], max_p["position"]["c"], max_p["targetRow"], size, walls
    )
    min_path = get_path(
        min_p["position"]["r"], min_p["position"]["c"], min_p["targetRow"], size, walls
    )

    if not max_path:
        return -100000
    if not min_path:
        return 100000

    # get the dists
    max_dist = len(max_path)
    min_dist = len(min_path)

    # disstance score (we want min_dist (opponent) to be high, and max_dist (us) to be low)
    score = (min_dist * 200) - (max_dist * 100)

    progress = (
        max_p["position"]["r"]
        if max_p["targetRow"] == size - 1
        else (size - 1 - max_p["position"]["r"])
    )
    score += progress * 10

    # the player whose turn it is effectively has a half-step head start.
    is_max_turn = (turn == PlayerRole.P1 and player1["id"] == maximizing_player_id) or (
        turn == PlayerRole.P2 and player2["id"] == maximizing_player_id
    )
    if is_max_turn:
        score += 50
    else:
        score -= 50

    # for each player, get dist to the center (Pawns in the center columns have more options)
    center_col = size // 2
    max_centrality = abs(max_p["position"]["c"] - center_col)
    min_centrality = abs(min_p["position"]["c"] - center_col)

    # penalize being pushed to the edges
    score -= max_centrality * 5
    score += min_centrality * 5

    # prevent the AI from bleeding its walls dry if the opponent is still far away
    if max_p["wallsLeft"] <= 2 and min_dist > 4:
        score -= 400

    if max_p["wallsLeft"] == 0 and min_dist > 2:
        score -= 800

    wall_diff = max_p["wallsLeft"] - min_p["wallsLeft"]

    # find the wall value base on the opponent distance
    if min_dist > 6:
        wall_value = 180
    elif min_dist > 3:
        wall_value = 110
    else:
        wall_value = 40

    score += wall_diff * wall_value

    # add random noise to break ties
    score += random.uniform(0.0, 0.05)

    return score
