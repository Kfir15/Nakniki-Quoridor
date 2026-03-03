from .utils import (
    get_state_values,
    get_players_positions,
    get_player_walls_left,
    get_players_ids,
)


def get_legal_actions(state):
    """
    Get the current game state and return all legal moves
    """

    _, size, player1, player2, turn, status, walls = get_state_values(state)

    # if the game is finished, return no legal moves
    if status == "FINISHED":
        return []

    # get the players positions
    curr_row, curr_col, opp_row, opp_col = get_players_positions(state)

    # get how many walls the current player has left
    walls_left = get_player_walls_left(state)

    # get the players ids
    curr_id, opp_id = get_players_ids(state)

    actions = get_legal_moves(
        curr_id, curr_row, curr_col, opp_row, opp_col, size, walls
    )

    return actions


def get_legal_moves(curr_id, curr_row, curr_col, opp_row, opp_col, size, walls):
    # check all possible moves for player
    moves = []
    directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]

    for dr, dc in directions:
        # get the target position
        target_r = curr_row + dr
        target_c = curr_col + dc

        # if the target not in the board, skip it
        if target_r < 0 or target_r >= size or target_c < 0 or target_c >= size:
            continue

        # check if move blocked by wall
        wall_r = 2 * curr_row + dr
        wall_c = 2 * curr_col + dc
        if (wall_r, wall_c) in walls:
            continue

        # check if move blocked by opponent
        if (target_r, target_c) == (opp_row, opp_col):
            # try straight jump (above opponent)

            # get the jump position
            jump_r = opp_row + dr
            jump_c = opp_col + dc

            # get the wall behind the opponent
            wall_behind_opp_r = 2 * opp_row + dr
            wall_behind_opp_c = 2 * opp_col + dc

            # check if jump is legal (in bounds and not blocked by wall)
            if (
                0 <= jump_r < size
                and 0 <= jump_c < size
                and (wall_behind_opp_r, wall_behind_opp_c) not in walls
            ):
                moves.append(("move", curr_id, (jump_r, jump_c)))
                continue

            # try diagonal jump

            # get the diagonal jump directions (up/down sides or left/right sides, based on the direction of the move)
            if dr != 0:
                # if move is up or down, try diagonal jump left and right
                diag_dirs = [(0, -1), (0, 1)]
            else:
                # if move is left or right, try diagonal jump up and down
                diag_dirs = [(-1, 0), (1, 0)]

            # check all the diagonal jumps
            for ddr, ddc in diag_dirs:
                # get the diagonal jump position
                diag_jump_r = opp_row + ddr
                diag_jump_c = opp_col + ddc

                # continue if pos not in bounds
                if not (0 <= diag_jump_r < size and 0 <= diag_jump_c < size):
                    continue

                # check if wall block the move between opponent and the diagonal jump position
                wall_r = 2 * opp_row + ddr
                wall_c = 2 * opp_col + ddc
                if (wall_r, wall_c) in walls:
                    continue

                moves.append(("move", curr_id, (diag_jump_r, diag_jump_c)))

        # else, regular move
        else:
            moves.append(("move", curr_id, (target_r, target_c)))

    return moves
