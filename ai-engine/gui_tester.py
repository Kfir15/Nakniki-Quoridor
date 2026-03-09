import tkinter as tk
from tkinter import messagebox
import threading
import time
import logging

# Ensure these modules are in your python path
from ai.minimax import get_action
from ai.transitions import apply_transition
from ai.game_model_utils import check_game_over
from ai.rules import successors

# --- LOGGING CONFIGURATION ---
# 'w' mode ensures the file is emptied every time the application starts
logging.basicConfig(
    filename="quoridor_ai_logs.txt",
    filemode="w",
    level=logging.INFO,
    format="%(message)s",
)


class QuoridorGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Quoridor AI Debugger")

        # Board Visual Settings
        self.size = 9
        self.cell_size = 50
        self.wall_width = 12
        self.unit = self.cell_size + self.wall_width
        self.wall_mode = "h"

        # Initial State
        self.state = {
            "id": "gui_test",
            "size": self.size,
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

        self.setup_ui()
        self.draw_board()

        # Initial log entry
        logging.info("=== GAME STARTED ===")
        self.print_console_board()
        logging.info("Waiting for Human move...\n")

    def setup_ui(self):
        self.info_label = tk.Label(
            self.root, text="Your Turn (Blue)", font=("Arial", 14, "bold")
        )
        self.info_label.pack(pady=5)

        # Canvas sizing
        canvas_dim = self.size * self.unit - self.wall_width
        self.canvas = tk.Canvas(
            self.root, width=canvas_dim, height=canvas_dim, bg="#deb887"
        )
        self.canvas.pack(padx=20, pady=10)
        self.canvas.bind("<Button-1>", self.handle_click)

        # Bottom Controls
        ctrl_frame = tk.Frame(self.root)
        ctrl_frame.pack(pady=10)

        self.mode_btn = tk.Button(
            ctrl_frame,
            text="Wall Mode: Horizontal (H)",
            command=self.toggle_mode,
            width=22,
        )
        self.mode_btn.pack(side=tk.LEFT, padx=10)

        self.p1_walls_label = tk.Label(
            ctrl_frame, text="Your Walls: 10", fg="blue", font=("Arial", 12, "bold")
        )
        self.p1_walls_label.pack(side=tk.LEFT, padx=15)

        self.p2_walls_label = tk.Label(
            ctrl_frame, text="AI Walls: 10", font=("Arial", 12, "bold")
        )
        self.p2_walls_label.pack(side=tk.LEFT, padx=15)

    def toggle_mode(self):
        self.wall_mode = "v" if self.wall_mode == "h" else "h"
        self.mode_btn.config(
            text=f"Wall Mode: {'Vertical (V)' if self.wall_mode == 'v' else 'Horizontal (H)'}"
        )

    def draw_board(self):
        self.canvas.delete("all")

        # 1. Draw all base cells
        for r in range(self.size):
            for c in range(self.size):
                x1 = c * self.unit
                y1 = r * self.unit
                x2 = x1 + self.cell_size
                y2 = y1 + self.cell_size
                self.canvas.create_rectangle(
                    x1, y1, x2, y2, fill="#f5deb3", outline="#8b4513"
                )

        # 2. Draw Walls perfectly using extended coordinates
        for er, ec in self.state["walls"]:
            row = er // 2
            col = ec // 2
            is_h_gap = er % 2 != 0
            is_v_gap = ec % 2 != 0

            x1 = col * self.unit
            y1 = row * self.unit

            if is_h_gap:
                y1 += self.cell_size
                y2 = y1 + self.wall_width
            else:
                y2 = y1 + self.cell_size

            if is_v_gap:
                x1 += self.cell_size
                x2 = x1 + self.wall_width
            else:
                x2 = x1 + self.cell_size

            self.canvas.create_rectangle(x1, y1, x2, y2, fill="#8b0000", outline="")

        # 3. Draw Players
        for p_key, color in [("player1", "blue"), ("player2", "black")]:
            pos = self.state[p_key]["position"]
            x = pos["c"] * self.unit + self.cell_size // 2
            y = pos["r"] * self.unit + self.cell_size // 2
            self.canvas.create_oval(x - 15, y - 15, x + 15, y + 15, fill=color)

        self.p1_walls_label.config(
            text=f"Your Walls: {self.state['player1']['wallsLeft']}"
        )
        self.p2_walls_label.config(
            text=f"AI Walls: {self.state['player2']['wallsLeft']}"
        )

    def print_console_board(self):
        """Writes an ASCII version of the board to the log file."""
        walls = self.state["walls"]
        p1 = self.state["player1"]["position"]
        p2 = self.state["player2"]["position"]

        output = []
        output.append("\n   " + "   ".join(map(str, range(self.size))))
        for r in range(self.size):
            # Print row with players and vertical walls
            row_str = f"{r} "
            for c in range(self.size):
                char = "."
                if p1["r"] == r and p1["c"] == c:
                    char = "1"
                elif p2["r"] == r and p2["c"] == c:
                    char = "2"

                v_wall = "|" if (2 * r, 2 * c + 1) in walls else " "
                row_str += f" {char} {v_wall}"
            output.append(row_str)

            # Print horizontal walls between rows
            if r < self.size - 1:
                h_row = "  "
                for c in range(self.size):
                    h_wall = "---" if (2 * r + 1, 2 * c) in walls else "   "
                    h_row += f" {h_wall}"
                output.append(h_row)

        logging.info("\n".join(output) + "\n")

    def log_action(self, actor, action, duration=None):
        """Logs the move and current stats to the file."""
        logging.info("-" * 40)

        # Format the action string
        if action[0] == "move":
            action_str = f"MOVED to ({action[2][0]}, {action[2][1]})"
        else:
            action_str = (
                f"PLACED {action[3].upper()}-WALL at ({action[2][0]}, {action[2][1]})"
            )

        time_str = f" [Took: {duration:.2f}s]" if duration else ""
        logging.info(f"[{actor}] {action_str}{time_str}")

        # Log Stats
        p1 = self.state["player1"]
        p2 = self.state["player2"]
        logging.info(
            f"P1 (Human) | Pos: ({p1['position']['r']}, {p1['position']['c']}) | Walls: {p1['wallsLeft']}"
        )
        logging.info(
            f"P2 (AI)    | Pos: ({p2['position']['r']}, {p2['position']['c']}) | Walls: {p2['wallsLeft']}"
        )

        self.print_console_board()

    def handle_click(self, event):
        if self.state["turn"] != "p1" or self.state["status"] == "FINISHED":
            return

        c = event.x // self.unit
        r = event.y // self.unit
        offsetX = event.x % self.unit
        offsetY = event.y % self.unit

        if r >= self.size or c >= self.size:
            return

        action = None

        # Move click detection
        if offsetX < self.cell_size and offsetY < self.cell_size:
            action = ("move", "p1", (r, c))
        # Wall click detection
        else:
            wr = min(r, 7)
            wc = min(c, 7)
            if offsetX >= self.cell_size and offsetY < self.cell_size:
                action = ("wall", "p1", (wr, wc), "v")
            elif offsetY >= self.cell_size and offsetX < self.cell_size:
                action = ("wall", "p1", (wr, wc), "h")
            else:
                action = ("wall", "p1", (wr, wc), self.wall_mode)

        # Validation against legal moves
        legal_actions = successors(self.state)

        if action in legal_actions:
            self.state = apply_transition(self.state, action)
            self.draw_board()
            self.log_action("HUMAN", action)

            if check_game_over(self.state):
                self.end_game()
            else:
                self.info_label.config(text="AI is thinking...", fg="red")
                self.root.update()
                threading.Thread(target=self.ai_turn).start()
        else:
            logging.warning(f"--> Illegal move attempted: {action}")

    def ai_turn(self):
        start = time.time()
        # Ensure max_time is sufficient for your minimax depth
        move = get_action(self.state, max_time=2.5)
        duration = time.time() - start

        self.state = apply_transition(self.state, move)
        self.log_action("AI", move, duration)

        self.root.after(0, self.update_after_ai)

    def update_after_ai(self):
        self.draw_board()
        if check_game_over(self.state):
            self.end_game()
        else:
            self.info_label.config(text="Your Turn (Blue)", fg="black")

    def end_game(self):
        winner = (
            "You (Blue)"
            if self.state["player1"]["position"]["r"] == 0
            else "AI (Black)"
        )
        self.info_label.config(text=f"GAME OVER! Winner: {winner}")
        logging.info("=" * 40)
        logging.info(f"GAME OVER! Winner: {winner}")
        logging.info("=" * 40)
        messagebox.showinfo("Game Over", f"The winner is {winner}!")


if __name__ == "__main__":
    root = tk.Tk()
    app = QuoridorGUI(root)
    root.mainloop()
