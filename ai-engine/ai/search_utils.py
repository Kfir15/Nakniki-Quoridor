from collections import deque


def has_path(start_r, start_c, target_r, size, walls):
    """
    check if there is a path from (start_r, start_c) to target_r using BFS
    """

    # queue that stores positions to check
    queue = deque([(start_r, start_c)])
    # set that stores visited positions
    visited = {(start_r, start_c)}
    # directions for moves
    directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]

    while queue:
        # get position
        r, c = queue.popleft()

        # if this is target row, return True
        if r == target_r:
            return True

        # check all directions
        for dr, dc in directions:
            # get the new position
            nr, nc = r + dr, c + dc

            # if the new position is in bounds and not visited
            if 0 <= nr < size and 0 <= nc < size and (nr, nc) not in visited:
                # check if there is a wall between current position and new position
                wall_r = 2 * r + dr
                wall_c = 2 * c + dc

                # if there is no wall, add the new position to the queue and visited set
                if (wall_r, wall_c) not in walls:
                    visited.add((nr, nc))
                    queue.append((nr, nc))

    return False

def get_path(start_r, start_c, target_r, size, walls):
    """
    return (if exists) the path from (start_r, start_c) to target_r using BFS
    """
    
    # queue that stores positions to check
    queue = deque([(start_r, start_c)])
    # set that stores visited positions
    visited = {(start_r, start_c)}
    # directions for moves
    directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]
    parent_map = {}
    
    while queue:
        # get position
        r, c = queue.popleft()

        # if this is target row, go backwards and return the path
        if r == target_r:
            path = {(r, c)}
            curr = (r, c)
            
            # go backwards until we reach the start position
            while curr in parent_map:
                pr, pc = parent_map[curr]
                path.add((pr, pc))
                curr = (pr, pc)
            return path

        # check all directions
        for dr, dc in directions:
            # get the new position
            nr, nc = r + dr, c + dc

            # if the new position is in bounds and not visited
            if 0 <= nr < size and 0 <= nc < size and (nr, nc) not in visited:
                # check if there is a wall between current position and new position
                wall_r = 2 * r + dr
                wall_c = 2 * c + dc

                # if there is no wall, add the new position to the queue and visited set
                if (wall_r, wall_c) not in walls:
                    visited.add((nr, nc))
                    parent_map[(nr, nc)] = (r, c)
                    queue.append((nr, nc))

    return None
        