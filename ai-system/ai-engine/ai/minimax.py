import time
from .rules import successors
from .transitions import apply_transition
from .game_model_utils import get_current_player, check_game_over
from .heuristics import state_heuristic
from common.minimax_constants import MinimaxConstants


def get_action(
    state, max_time=MinimaxConstants.MAX_TIME, max_depth=MinimaxConstants.MAX_DEPTH
):
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
                state,
                depth,
                MinimaxConstants.NEG_INF,
                MinimaxConstants.INF,
                curr_player["id"],
                start_time,
                max_time,
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
        best_value = MinimaxConstants.NEG_INF

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
        best_value = MinimaxConstants.INF

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
