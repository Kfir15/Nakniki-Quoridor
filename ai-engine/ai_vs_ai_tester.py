import tkinter as tk
from tkinter import messagebox
import threading
import time
import logging

# Ensure these modules are in your python path
from ai.minimax import get_action
from ai.transitions import apply_transition
from ai.game_model_utils import check_game_over

# --- LOGGING CONFIGURATION ---
logging.basicConfig(
    filename="ai_vs_ai_logs.txt",
    filemode="w",
    level=logging.INFO,
    format="%(message)s",
)


class QuoridorAIvsAI:
    def __init__(self, root):
        self.root = root
        self.root.title("Quoridor AI vs AI Battle")

        # Board Visual Settings
        self.size = 9
        self.cell_size = 50
        self.wall_width = 12
        self.unit = self.cell_size + self.wall_width
        self.is_running = False

        # Initial State
        self.state = {
            "id": "ai_battle",
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

        logging.info("=== AI VS AI BATTLE STARTED ===")

    def setup_ui(self):
        self.info_label = tk.Label(
            self.root, text="Press Start to Begin AI Battle", font=("Arial", 14, "bold")
        )
        self.info_label.pack(pady=5)

        # Canvas sizing
        canvas_dim = self.size * self.unit - self.wall_width
        self.canvas = tk.Canvas(
            self.root, width=canvas_dim, height=canvas_dim, bg="#deb887"
        )
        self.canvas.pack(padx=20, pady=10)

        # Bottom Controls
        ctrl_frame = tk.Frame(self.root)
        ctrl_frame.pack(pady=10)

        self.start_btn = tk.Button(
            ctrl_frame,
            text="Start Battle",
            command=self.start_game,
            width=15,
            bg="green",
            fg="white",
        )
        self.start_btn.pack(side=tk.LEFT, padx=10)

        self.p1_walls_label = tk.Label(
            ctrl_frame,
            text="P1 (Blue) Walls: 10",
            fg="blue",
            font=("Arial", 12, "bold"),
        )
        self.p1_walls_label.pack(side=tk.LEFT, padx=15)

        self.p2_walls_label = tk.Label(
            ctrl_frame, text="P2 (Black) Walls: 10", font=("Arial", 12, "bold")
        )
        self.p2_walls_label.pack(side=tk.LEFT, padx=15)

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

        # 2. Draw Walls perfectly using extended coordinates (Restored to your original logic)
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
            text=f"P1 (Blue) Walls: {self.state['player1']['wallsLeft']}"
        )
        self.p2_walls_label.config(
            text=f"P2 (Black) Walls: {self.state['player2']['wallsLeft']}"
        )

    def start_game(self):
        if not self.is_running:
            self.is_running = True
            self.start_btn.config(state=tk.DISABLED, text="Battle in Progress...")
            # Run the game loop in a background thread so UI doesn't freeze
            threading.Thread(target=self.game_loop, daemon=True).start()

    def game_loop(self):
        """Main automated loop for AI vs AI."""
        while self.is_running:
            current_turn = self.state["turn"]
            actor_name = "AI_1 (Blue)" if current_turn == "p1" else "AI_2 (Black)"

            # Update UI to show who is thinking
            self.info_label.config(
                text=f"{actor_name} is thinking...",
                fg="blue" if current_turn == "p1" else "black",
            )

            start_time = time.time()
            move = get_action(self.state, max_time=1.5)
            duration = time.time() - start_time

            # Apply the move
            self.state = apply_transition(self.state, move)
            self.log_action(actor_name, move, duration)

            # Schedule UI update on the main thread
            self.root.after(0, self.draw_board)

            # Check win condition
            if check_game_over(self.state):
                self.is_running = False
                self.root.after(0, self.end_game)
                break

            # Pause briefly so you can actually watch the moves happen
            time.sleep(0.5)

    def log_action(self, actor, action, duration):
        logging.info("-" * 30)
        action_type = (
            "MOVED" if action[0] == "move" else f"PLACED {action[3].upper()}-WALL"
        )
        logging.info(f"[{actor}] {action_type} to {action[2]} | Time: {duration:.2f}s")

    def end_game(self):
        winner = (
            "P1 (Blue)" if self.state["player1"]["position"]["r"] == 0 else "P2 (Black)"
        )
        self.info_label.config(text=f"GAME OVER! Winner: {winner}", fg="green")
        messagebox.showinfo("Game Over", f"Battle finished!\nThe winner is {winner}.")


if __name__ == "__main__":
    root = tk.Tk()
    app = QuoridorAIvsAI(root)
    root.mainloop()
