import time
import math
from ai.rules import successors
from ai.transitions import apply_transition
from ai.game_model_utils import get_current_player
from ai.minimax import minimax
from common.minimax_constants import MinimaxConstants
from common.analysis_constants import AnalysisConstants
from common.enums import MoveAccuracy


def get_analysis(
    state,
    user_action,
    max_time=MinimaxConstants.MAX_TIME,
    max_depth=MinimaxConstants.MAX_DEPTH,
):
    """
    find the best move and the score of the user move
    """
    curr_player = get_current_player(state)
    start_time = time.time()
    best_action_overall = None
    best_value_overall = MinimaxConstants.NEG_INF
    user_value_overall = MinimaxConstants.NEG_INF
    actions = successors(state)

    # add the user action if it not inside
    if user_action not in actions:
        actions.append(user_action)

    for depth in range(2, max_depth + 1):
        try:
            current_depth_best_action = None
            current_depth_best_value = MinimaxConstants.NEG_INF
            current_depth_user_value = MinimaxConstants.NEG_INF

            # expand tge first layer of the tree and apply minimax (to make sure we open the user action)
            for action in actions:
                # apply the action
                new_state = apply_transition(state, action)

                # apply the minimax
                value, _ = minimax(
                    new_state,
                    depth - 1,
                    MinimaxConstants.NEG_INF,
                    MinimaxConstants.INF,
                    curr_player["id"],
                    start_time,
                    max_time,
                )

                # if this action is better, save it
                if (
                    value > current_depth_best_value
                    or current_depth_best_action is None
                ):
                    current_depth_best_value = value
                    current_depth_best_action = action

                # if this is the user action, save it value
                if action == user_action:
                    current_depth_user_value = value

            # update variables
            best_action_overall = current_depth_best_action
            best_value_overall = current_depth_best_value
            user_value_overall = current_depth_user_value

            if time.time() - start_time > max_time:
                break

        except TimeoutError:
            break

    # normalize the scores to (-5, 5) scale
    eval_user = normalize_score(user_value_overall)

    # get drop score and accuracy
    raw_score_drop = best_value_overall - user_value_overall
    penalty = raw_score_drop / AnalysisConstants.HEURISTIC_SCALE
    accuracy = get_accuracy(penalty)

    return {
        "bestAction": best_action_overall,
        "accuracy": accuracy.value,
        "scoreDrop": round(penalty, 2),
        "evaluation": eval_user,
    }


def normalize_score(raw_score):
    """
    normalize the score to (-5, 5) scale
    """
    # if this player win, this is the best (5)
    if raw_score >= MinimaxConstants.INF:
        return AnalysisConstants.MAX_SCORE

    # if the player loses, this is the worst (-5)
    if raw_score <= MinimaxConstants.NEG_INF:
        return AnalysisConstants.MIN_SCORE

    adjusted_score = raw_score - AnalysisConstants.STARTING_BIAS
    curved_value = math.tanh(adjusted_score / AnalysisConstants.SMOOTHING_FACTOR)
    return round(curved_value * AnalysisConstants.MAX_SCORE, 2)


def get_accuracy(score_drop):

    # get the accuracy based on the score drop
    if score_drop <= AnalysisConstants.THRESHOLD_BEST:
        return MoveAccuracy.BEST
    elif score_drop <= AnalysisConstants.THRESHOLD_EXCELLENT:
        return MoveAccuracy.EXCELLENT
    elif score_drop <= AnalysisConstants.THRESHOLD_GOOD:
        return MoveAccuracy.GOOD
    elif score_drop <= AnalysisConstants.THRESHOLD_INACCURACY:
        return MoveAccuracy.INACCURACY
    elif score_drop <= AnalysisConstants.THRESHOLD_MISTAKE:
        return MoveAccuracy.MISTAKE
    else:
        return MoveAccuracy.BLUNDER
