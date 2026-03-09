import time
from ai.minimax import get_action
from ai.transitions import apply_transition
from ai.game_model_utils import check_game_over


def print_board(state):
    size = state["size"]
    walls = state["walls"]
    p1 = state["player1"]["position"]
    p2 = state["player2"]["position"]

    print("\n   " + "   ".join(map(str, range(size))))
    for r in range(size):
        # Print row with players and vertical walls
        row_str = f"{r} "
        for c in range(size):
            char = "."
            if p1["r"] == r and p1["c"] == c:
                char = "1"
            elif p2["r"] == r and p2["c"] == c:
                char = "2"

            # Check for vertical wall to the right
            v_wall = "|" if (2 * r, 2 * c + 1) in walls else " "
            row_str += f" {char} {v_wall}"
        print(row_str)

        # Print horizontal walls between rows
        if r < size - 1:
            h_row = "  "
            for c in range(size):
                h_wall = "---" if (2 * r + 1, 2 * c) in walls else "   "
                h_row += f" {h_wall}"
            print(h_row)


def get_user_move(player_id):
    print(f"\nYour turn ({player_id})!")
    choice = input("Move (m) or Wall (w)? ").strip().lower()
    if choice == "m":
        r = int(input("Target Row: "))
        c = int(input("Target Col: "))
        return ("move", player_id, (r, c))
    else:
        r = int(input("Wall Row: "))
        c = int(input("Wall Col: "))
        o = input("Orientation (h/v): ").strip().lower()
        return ("wall", player_id, (r, c), o)


def play_game():
    # Initial State matching your AI format
    state = {
        "id": "test_game",
        "size": 9,
        "turn": "p1",
        "status": "IN_PROGRESS",
        "walls": frozenset(),
        "player1": {
            "id": "p1",
            "wallsLeft": 10,
            "targetRow": 0,
            "position": {"r": 8, "c": 4},
        },
        "player2": {
            "id": "p2",
            "wallsLeft": 10,
            "targetRow": 8,
            "position": {"r": 0, "c": 4},
        },
    }

    while not check_game_over(state):
        print_board(state)

        if state["turn"] == "p1":
            # HUMAN TURN
            move = get_user_move("p1")
            state = apply_transition(state, move)  #
        else:
            # AI TURN
            print("\nAI is thinking...")
            start = time.time()
            # Calling your Iterative Deepening logic
            move = get_action(state)
            print(f"AI Move: {move} (took {time.time() - start:.2f}s)")
            state = apply_transition(state, move)

    print_board(state)
    print("\nGAME OVER!")
    print(f"Winner: {'Human' if state['player1']['position']['r'] == 0 else 'AI'}")


if __name__ == "__main__":
    play_game()
