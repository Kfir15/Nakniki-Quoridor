from .game_model_utils import (
    get_state_values,
    get_players_positions,
    get_player_walls_left,
    get_players_ids,
    get_target_rows,
)
from .search_utils import has_path, get_path

def successors(state):
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

    # get the target rows
    curr_target_row, opp_target_row = get_target_rows(state)

    # get the legal moves
    move_actions = get_legal_moves(
        curr_id, curr_row, curr_col, opp_row, opp_col, size, walls
    )

    # get the legal wall placements
    wall_actions = get_legal_walls(
        curr_id, curr_row, curr_col, curr_target_row, opp_row, opp_col, opp_target_row, size, walls, walls_left
    )

    return move_actions + wall_actions


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
            if (wall_behind_opp_r, wall_behind_opp_c) not in walls and (0 <= jump_r < size and 0 <= jump_c < size):
                continue
            
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

def get_legal_walls(curr_id, curr_row, curr_col, curr_target, opp_row, opp_col, opp_target, size, walls, walls_left):
    # check all possible wall placements

    walls_with_scores = []
    
    if walls_left <= 0:
        return []
    
    """
    optimization - instead of run "has_path" for every possible wall placement, 
    we can get the current paths for both players and check if the wall placement blocks the path, which is much faster.
    if the wall placement blocks the path, then we can run "has_path" to check if it completely blocks the player from reaching the target. 
    """
    
    # get the players shortest paths to target
    curr_path = get_path(curr_row, curr_col, curr_target, size, walls)
    opp_path = get_path(opp_row, opp_col, opp_target, size, walls)
    
    # if there is no path for one of the players, return []
    if not curr_path or not opp_path:
        return []
    
    # check all possible wall placements
    for r in range(size - 1):
        for c in range(size - 1):
            
            # ===horizontal wall===
            h1 = (2 * r + 1, 2 * c)
            h2 = (2 * r + 1, 2 * c + 1)
            h3 = (2 * r + 1, 2 * c + 2)
            
            # if there is already a wall in the way, skip
            if h1 in walls or h2 in walls or h3 in walls:
                continue
            
            # check if the wall placement blocks the current player or the opponent paths
            blocks_curr, blocks_opp = check_if_blocks(r, c, "h", curr_path, opp_path)
            
            is_legal = True
            
            # if the wall block either player, check if it completely blocks them from reaching the target 
            if blocks_curr or blocks_opp:
                # create a test wall set that includes the new wall
                test_wall = set(walls)
                test_wall.update([h1, h2, h3])
                
                # check if both players still have a path to the target with the new wall
                if blocks_curr and not has_path(curr_row, curr_col, curr_target, size, test_wall):
                    is_legal = False
                if is_legal and blocks_opp and not has_path(opp_row, opp_col, opp_target, size, test_wall):
                    is_legal = False
            
            # if the wall legal, add it to the list with its score
            if is_legal:
                score = wall_heuristic(r, c, "h", opp_row, opp_col, opp_target, blocks_curr, blocks_opp)
                walls_with_scores.append(("wall", curr_id, (r, c), "h", score))
                
            # ===vertical wall===
            v1 = (2 * r, 2 * c + 1)
            v2 = (2 * r + 1, 2 * c + 1)
            v3 = (2 * r + 2, 2 * c + 1)
            
            # if there is already a wall in the way, skip
            if v1 in walls or v2 in walls or v3 in walls:
                continue
            
            # evaluate the wall placement and get indicators if it blocks the player or the opponent
            blocks_curr, blocks_opp = check_if_blocks(r, c, "v", curr_path, opp_path)
            
            is_legal = True
            
            # if the wall block either player, check if it completely blocks them from reaching the target
            if blocks_curr or blocks_opp:
                # create a test wall set that includes the new wall
                test_wall = set(walls)
                test_wall.update([v1, v2, v3])
                
                # check if both players still have a path to the target with the new wall
                if blocks_curr and not has_path(curr_row, curr_col, curr_target, size, test_wall):
                    is_legal = False
                if is_legal and blocks_opp and not has_path(opp_row, opp_col, opp_target, size, test_wall):
                    is_legal = False
                    
            # if the wall legal, add it to the list with its score
            if is_legal:
                score = wall_heuristic(r, c, "v", opp_row, opp_col, opp_target, blocks_curr, blocks_opp)
                walls_with_scores.append(("wall", curr_id, (r, c), "v", score))
    
    # sort the walls by score and return the walls
    walls_with_scores.sort(key=lambda x: x[4])
    return [action[:4] for action in walls_with_scores]

def check_if_blocks(wall_r, wall_c, orientation, curr_path, opp_path):
    # for each orientation
    if orientation == "h":
        # check if the wall placement blocks the current player or the opponent paths
        blocks_curr = ((wall_r, wall_c) in curr_path and (wall_r + 1, wall_c) in curr_path) or \
                      ((wall_r, wall_c + 1) in curr_path and (wall_r + 1, wall_c + 1) in curr_path)
        
        blocks_opp =  ((wall_r, wall_c) in opp_path and (wall_r + 1, wall_c) in opp_path) or \
                      ((wall_r, wall_c + 1) in opp_path and (wall_r + 1, wall_c + 1) in opp_path)
    else:
        # check if the wall placement blocks the current player or the opponent paths
        blocks_curr = ((wall_r, wall_c) in curr_path and (wall_r, wall_c + 1) in curr_path) or \
                      ((wall_r + 1, wall_c) in curr_path and (wall_r + 1, wall_c + 1) in curr_path)
                      
        blocks_opp =  ((wall_r, wall_c) in opp_path and (wall_r, wall_c + 1) in opp_path) or \
                      ((wall_r + 1, wall_c) in opp_path and (wall_r + 1, wall_c + 1) in opp_path)
                      
    return blocks_curr, blocks_opp

def wall_heuristic(wall_r, wall_c, orientation, opp_row, opp_col, opp_target, blocks_curr, blocks_opp):
    """
    evaluate the wall placement and return a score
    """
    score = 0

    # penalty for blocking paths
    if blocks_opp:
        score -= 100
    if blocks_curr:
        score += 150

    # distance to opponent - walls that closer to opponent are more effective
    dist_to_opp = abs(wall_r - opp_row) + abs(wall_c - opp_col)
    score += dist_to_opp * 2

    # check if wall is placed behind or directly in front of the opponent
    if opp_target > opp_row: # opponent is moving down
        if wall_r < opp_row:
            # penalty - wall is behind them
            score += 40
        elif wall_r == opp_row and orientation == "h":
            # bonus - horizontal wall right in front of them
            score -= 15 
    else: # opponent is moving up
        if wall_r >= opp_row:
            # penalty - wall is behind them
            score += 40 
        elif wall_r == opp_row - 1 and orientation == "h":
            # bonus - horizontal wall right in front of them
            score -= 15 

    # walls in the center of the board disrupt more paths than edge walls
    dist_to_center = abs(wall_r - 3.5) + abs(wall_c - 3.5)
    score += int(dist_to_center)

    # horizontal walls are slightly better at stopping vertical movement
    if orientation == "h":
        score -= 2

    return score