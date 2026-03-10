import math
import time
from .rules import successors
from .transitions import apply_transition
from .game_model_utils import get_current_player, check_game_over, get_state_values
from .search_utils import get_path


INF = float("inf")
NEG_INF = float("-inf")


def get_action(state, max_time=3, max_depth=10):
    """
    get state
    return best action
    """
    curr_player = get_current_player(state)
    best_action = None

    start_time = time.time()

    # search depth 1, then 2, then 3, until we run out of time
    for depth in range(2, max_depth + 1):
        try:
            # get the action
            value, action = minimax(
                state, depth, NEG_INF, INF, curr_player["id"], start_time, max_time
            )

            # ALWAYS update our best action, because deeper = smarter!
            if action is not None:
                best_action = action

            # if we have spent too much time, stop searching deeper and return what we have
            if time.time() - start_time > max_time:
                break

        except TimeoutError:
            break

    return best_action


def minimax(state, depth, alpha, beta, maximizing_player_id, start_time, max_time):
    """
    minimax algorithm with alpha-beta pruning
    """
    # check time
    if time.time() - start_time > max_time:
        raise TimeoutError()

    # check if game over or depth is 0
    if check_game_over(state) or depth == 0:
        return state_heuristic(state, maximizing_player_id, depth), None

    # get the current player
    curr_player = get_current_player(state)

    # check if the current player is the maximizing player
    is_maximizing = curr_player["id"] == maximizing_player_id

    # get all the possible actions for this state
    actions = successors(state)
    best_action = None

    # if the current player is the maximizing player (alpha)
    if is_maximizing:
        best_value = NEG_INF

        # for each possible action
        for action in actions:
            # apply the action
            new_state = apply_transition(state, action)

            # get the value of the new state
            value, _ = minimax(
                new_state,
                depth - 1,
                alpha,
                beta,
                maximizing_player_id,
                start_time,
                max_time,
            )

            # if this state has better value
            if value > best_value or best_action is None:
                # save the val and action
                best_value = value
                best_action = action

            # check alpha beta prunning
            alpha = max(alpha, best_value)
            if beta <= alpha:
                break

        # return the best value and action
        return best_value, best_action
    # if this is the opponent (beta)
    else:
        best_value = INF

        # for each possible action
        for action in actions:
            # apply the action
            new_state = apply_transition(state, action)

            # get the value of the new state
            value, _ = minimax(
                new_state,
                depth - 1,
                alpha,
                beta,
                maximizing_player_id,
                start_time,
                max_time,
            )

            # if this state has better value
            if value < best_value or best_action is None:
                # save the val and action
                best_value = value
                best_action = action

            # check alpha beta prunning
            beta = min(beta, best_value)
            if beta <= alpha:
                break

        # return the best value and action
        return best_value, best_action


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
    is_max_turn = (turn == "p1" and player1["id"] == maximizing_player_id) or (
        turn == "p2" and player2["id"] == maximizing_player_id
    )
    if is_max_turn:
        score += 50
    else:
        score -= 50

    # add wall score base on the opponent distance
    wall_diff = max_p["wallsLeft"] - min_p["wallsLeft"]
    if min_dist <= 3:
        score += wall_diff * 150
    elif min_dist <= 6:
        score += wall_diff * 100
    else:
        score += wall_diff * 80

    # for each player, get dist to the center (Pawns in the center columns have more options)
    center_col = size // 2
    max_centrality = abs(max_p["position"]["c"] - center_col)
    min_centrality = abs(min_p["position"]["c"] - center_col)

    # penalize being pushed to the edges
    score -= max_centrality * 5
    score += min_centrality * 5

    # find the wall value base on the opponent distance
    if min_dist > 6:
        wall_value = 125
    elif min_dist > 3:
        wall_value = 80
    else:
        wall_value = 45

    # add wall score with his value
    score += wall_diff * wall_value

    # prevent the AI from bleeding its walls dry if the opponent is still far away
    if max_p["wallsLeft"] <= 2 and min_dist > 4:
        score -= 400

    if max_p["wallsLeft"] == 0 and min_dist > 2:
        score -= 800

    score += max_p["wallsLeft"] * 10
    score -= min_p["wallsLeft"] * 10

    return score
