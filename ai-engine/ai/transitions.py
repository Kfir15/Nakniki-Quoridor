from .game_model_utils import get_current_player, check_game_over, fast_copy_state


def apply_transition(state, action):
    """
    get game state and action
    return the new game state after applying the action
    """

    new_state = fast_copy_state(state)

    # get the action type
    action_type = action[0]

    # get the current player
    player = get_current_player(new_state)

    # if this is move action
    if action_type == "move":
        # change the player position
        new_r, new_c = action[2]
        player["position"]["r"] = new_r
        player["position"]["c"] = new_c

    # if this is wall action
    else:
        # get the wall position
        wall_r, wall_c = action[2]
        orientation = action[3]

        # get the walls to add
        if orientation == "h":
            new_walls = [
                (2 * wall_r + 1, 2 * wall_c),
                (2 * wall_r + 1, 2 * wall_c + 1),
                (2 * wall_r + 1, 2 * wall_c + 2),
            ]
        else:
            new_walls = [
                (2 * wall_r, 2 * wall_c + 1),
                (2 * wall_r + 1, 2 * wall_c + 1),
                (2 * wall_r + 2, 2 * wall_c + 1),
            ]

        # add the walls to the state
        current_walls = set(new_state["walls"])
        current_walls.update(new_walls)
        new_state["walls"] = frozenset(current_walls)

        # remove a wall from the player
        player["wallsLeft"] -= 1

    # check if the game is over
    if check_game_over(new_state):
        new_state["status"] = "FINISHED"
    # else, change the turn
    else:
        new_state["turn"] = "p2" if new_state["turn"] == "p1" else "p1"

    # return the new state
    return new_state
