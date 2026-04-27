import tkinter as tk
from tkinter import messagebox
import time
import copy
import logging

# Core AI modules
from ai.minimax import get_action
from ai.transitions import apply_transition
from ai.game_model_utils import check_game_over
from ai.rules import get_legal_moves
from ai.search_utils import has_path

# Analysis module
from analysis.analysis import get_analysis

# --- LOGGING CONFIGURATION ---
logging.basicConfig(
    filename="quoridor_ai_logs.txt",
    filemode="w",
    level=logging.INFO,
    format="%(message)s",
)


class NaknikiHumanVsAI:
    def __init__(self, root):
        self.root = root
        self.root.title("Nakniki Quoridor - Play vs AI (Strict Sequential)")
        self.root.configure(bg="#2b2b2b")

        self.size = 9
        self.cell_sz = 55
        self.wall_th = 16
        self.unit = self.cell_sz + self.wall_th
        self.wall_mode = "h"

        self.history = []
        self.is_thinking = False
        self.hint_move = None

        self.initial_state = {
            "id": "gui_play",
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
        self.state = copy.deepcopy(self.initial_state)

        self.build_ui()
        self.draw_board()
        logging.info("=== NEW HUMAN VS AI GAME STARTED ===")

    def build_ui(self):
        self.left_frame = tk.Frame(self.root, bg="#2b2b2b")
        self.left_frame.pack(side=tk.LEFT, padx=20, pady=20)

        self.right_frame = tk.Frame(
            self.root, bg="#333333", padx=20, pady=20, relief=tk.RIDGE, bd=2
        )
        self.right_frame.pack(side=tk.RIGHT, fill=tk.Y, padx=20, pady=20)

        self.status_var = tk.StringVar(value="Your Turn (Blue)")
        self.status_label = tk.Label(
            self.left_frame,
            textvariable=self.status_var,
            font=("Segoe UI", 16, "bold"),
            bg="#2b2b2b",
            fg="#4da6ff",
        )
        self.status_label.pack(pady=(0, 10))

        canvas_dim = self.size * self.unit - self.wall_th
        self.canvas = tk.Canvas(
            self.left_frame,
            width=canvas_dim,
            height=canvas_dim,
            bg="#8c6b4a",
            highlightthickness=0,
        )
        self.canvas.pack()
        self.canvas.bind("<Button-1>", self.on_board_click)

        self.mode_btn = tk.Button(
            self.left_frame,
            text="Wall Mode: Horizontal (Click to Swap)",
            command=self.toggle_wall_mode,
            font=("Segoe UI", 10, "bold"),
            bg="#555555",
            fg="white",
            relief=tk.FLAT,
            pady=5,
        )
        self.mode_btn.pack(fill=tk.X, pady=10)

        tk.Label(
            self.right_frame,
            text="Game Info",
            font=("Segoe UI", 14, "bold"),
            bg="#333333",
            fg="white",
        ).pack(pady=(0, 10))

        self.p1_walls_lbl = tk.Label(
            self.right_frame,
            text="You (Blue): 10 Walls",
            font=("Segoe UI", 12),
            bg="#333333",
            fg="#4da6ff",
        )
        self.p1_walls_lbl.pack(anchor="w")
        self.p2_walls_lbl = tk.Label(
            self.right_frame,
            text="AI (Black): 10 Walls",
            font=("Segoe UI", 12),
            bg="#333333",
            fg="#ff4d4d",
        )
        self.p2_walls_lbl.pack(anchor="w", pady=(0, 15))

        btn_style = {
            "font": ("Segoe UI", 10, "bold"),
            "fg": "white",
            "relief": tk.FLAT,
            "width": 18,
            "pady": 5,
        }
        tk.Button(
            self.right_frame,
            text="↩️ Undo Move",
            bg="#cc5200",
            command=self.undo_move,
            **btn_style,
        ).pack(pady=5)
        tk.Button(
            self.right_frame,
            text="🔄 Restart Game",
            bg="#cc0000",
            command=self.reset_game,
            **btn_style,
        ).pack(pady=5)

        tk.Frame(self.right_frame, height=2, bg="#555555").pack(fill=tk.X, pady=15)
        tk.Label(
            self.right_frame,
            text="📊 Your Move Analysis",
            font=("Segoe UI", 13, "bold"),
            bg="#333333",
            fg="#e6b800",
        ).pack(pady=(0, 10))

        self.analysis_var = tk.StringVar(
            value="Make a move to see\nyour grade.\n\n\n\n"
        )
        self.analysis_lbl = tk.Label(
            self.right_frame,
            textvariable=self.analysis_var,
            font=("Consolas", 11),
            bg="#222222",
            fg="#00ffcc",
            justify=tk.LEFT,
            padx=10,
            pady=10,
            relief=tk.SUNKEN,
            bd=2,
            width=25,
        )
        self.analysis_lbl.pack(fill=tk.X)

    def toggle_wall_mode(self):
        self.wall_mode = "v" if self.wall_mode == "h" else "h"
        self.mode_btn.config(
            text=f"Wall Mode: {'Vertical' if self.wall_mode == 'v' else 'Horizontal'} (Click to Swap)"
        )

    def draw_board(self):
        self.canvas.delete("all")
        for r in range(self.size):
            for c in range(self.size):
                x0, y0 = c * self.unit, r * self.unit
                self.canvas.create_rectangle(
                    x0,
                    y0,
                    x0 + self.cell_sz,
                    y0 + self.cell_sz,
                    fill="#e0c097",
                    outline="#5c4322",
                    width=2,
                )

        for extended_r, extended_c in self.state["walls"]:
            self._draw_wall(extended_r, extended_c, fill_color="#d13838")

        for p_key, color in [("player1", "#0066cc"), ("player2", "#333333")]:
            pos = self.state[p_key]["position"]
            px, py = (
                pos["c"] * self.unit + self.cell_sz // 2,
                pos["r"] * self.unit + self.cell_sz // 2,
            )
            self.canvas.create_oval(
                px - 18, py - 18, px + 18, py + 18, fill=color, outline="white", width=2
            )

        self.p1_walls_lbl.config(
            text=f"You (Blue): {self.state['player1']['wallsLeft']} Walls"
        )
        self.p2_walls_lbl.config(
            text=f"AI (Black): {self.state['player2']['wallsLeft']} Walls"
        )

    def _draw_wall(self, extended_r, extended_c, fill_color):
        r, c = extended_r // 2, extended_c // 2
        is_h_gap, is_v_gap = extended_r % 2 != 0, extended_c % 2 != 0
        x0, y0 = c * self.unit, r * self.unit

        if is_h_gap and is_v_gap:
            x1, y1, x2, y2 = (
                x0 + self.cell_sz,
                y0 + self.cell_sz,
                x0 + self.unit,
                y0 + self.unit,
            )
        elif is_h_gap:
            x1, y1, x2, y2 = x0, y0 + self.cell_sz, x0 + self.cell_sz, y0 + self.unit
        elif is_v_gap:
            x1, y1, x2, y2 = x0 + self.cell_sz, y0, x0 + self.unit, y0 + self.cell_sz
        else:
            x1, y1, x2, y2 = x0, y0, x0 + self.cell_sz, y0 + self.cell_sz

        self.canvas.create_rectangle(x1, y1, x2, y2, fill=fill_color, outline="")

    def validate_human_move(self, action):
        if action[0] == "move":
            p1, p2 = (
                self.state["player1"]["position"],
                self.state["player2"]["position"],
            )
            legal_moves = get_legal_moves(
                self.state["turn"],
                p1["r"],
                p1["c"],
                p2["r"],
                p2["c"],
                self.size,
                self.state["walls"],
            )
            return action in legal_moves
        elif action[0] == "wall":
            r, c, orientation = action[2][0], action[2][1], action[3]
            if (
                self.state["player1" if self.state["turn"] == "p1" else "player2"][
                    "wallsLeft"
                ]
                <= 0
                or r < 0
                or r >= self.size - 1
                or c < 0
                or c >= self.size - 1
            ):
                return False
            new_coords = (
                {(2 * r + 1, 2 * c), (2 * r + 1, 2 * c + 1), (2 * r + 1, 2 * c + 2)}
                if orientation == "h"
                else {
                    (2 * r, 2 * c + 1),
                    (2 * r + 1, 2 * c + 1),
                    (2 * r + 2, 2 * c + 1),
                }
            )
            if new_coords.intersection(self.state["walls"]):
                return False
            test_walls = frozenset(self.state["walls"].union(new_coords))
            p1_can_finish = has_path(
                self.state["player1"]["position"]["r"],
                self.state["player1"]["position"]["c"],
                self.state["player1"]["targetRow"],
                self.size,
                test_walls,
            )
            p2_can_finish = has_path(
                self.state["player2"]["position"]["r"],
                self.state["player2"]["position"]["c"],
                self.state["player2"]["targetRow"],
                self.size,
                test_walls,
            )
            return p1_can_finish and p2_can_finish
        return False

    def on_board_click(self, event):
        if (
            self.is_thinking
            or self.state["status"] == "FINISHED"
            or self.state["turn"] != "p1"
        ):
            return

        c, r = event.x // self.unit, event.y // self.unit
        off_x, off_y = event.x % self.unit, event.y % self.unit
        if r >= self.size or c >= self.size:
            return

        action = None
        if off_x < self.cell_sz and off_y < self.cell_sz:
            action = ("move", "p1", (r, c))
        else:
            wr, wc = min(r, self.size - 2), min(c, self.size - 2)
            if off_x >= self.cell_sz and off_y < self.cell_sz:
                action = ("wall", "p1", (wr, wc), "v")
            elif off_y >= self.cell_sz and off_x < self.cell_sz:
                action = ("wall", "p1", (wr, wc), "h")
            else:
                action = ("wall", "p1", (wr, wc), self.wall_mode)

        if action and self.validate_human_move(action):
            self.execute_action(action, analyze=True)

    def execute_action(self, action, analyze=False):
        state_for_analysis = copy.deepcopy(self.state)
        self.history.append(state_for_analysis)

        self.state = apply_transition(self.state, action)
        self.draw_board()
        self._update_status()
        self.root.update()

        if analyze:
            logging.info(f"\n[HUMAN (Blue)] played {action}")
            self.is_thinking = True
            self.analysis_var.set("Grading your move...\n\n\n\n\n")
            self.analysis_lbl.config(fg="#aaaaaa")
            self.root.update()

            self._run_analysis(state_for_analysis, action)

            if not check_game_over(self.state):
                self.trigger_ai_turn()
        else:
            logging.info(f"[AI (Black)] played {action}\n")

    def _run_analysis(self, before_state, human_action):
        try:
            result = get_analysis(before_state, human_action, max_time=2.0)

            eval_score = result["evaluation"]
            acc = result["accuracy"]
            drop = result["scoreDrop"]
            best = result["bestAction"]

            best_str = f"{best[0].upper()} to {best[2]}"
            if best[0] == "wall":
                best_str += f" ({best[3].upper()})"

            # FIX: If it is the best move, congratulate the player instead of showing alternatives!
            if acc == "Best Move" or acc == "MoveAccuracy.BEST":
                res_text = f"Bar Eval: {eval_score}\n\nGrade:    {acc}\nPenalty:  -{drop}\n\n🏆 You found the best move!"
            else:
                res_text = f"Bar Eval: {eval_score}\n\nGrade:    {acc}\nPenalty:  -{drop}\n\nBest Option:\n{best_str}"

            # --- WRITE ANALYSIS TO THE LOG FILE ---
            logging.info(f"   -> AI Evaluation: {eval_score}")
            logging.info(f"   -> Grade:         {acc}")
            logging.info(f"   -> Penalty Drop:  -{drop}")
            if acc != "Best Move":
                logging.info(f"   -> Best Option:   {best}")

            color = "#00ffcc"
            if acc == "Inaccuracy":
                color = "#ffcc00"
            elif acc == "Mistake":
                color = "#ff9933"
            elif acc == "Blunder":
                color = "#ff3333"

            self._update_analysis_ui(res_text, color)
        except Exception as e:
            self._update_analysis_ui(f"Analysis Failed:\n{str(e)}\n\n\n\n", "#ff3333")
            logging.error(f"   -> Analysis Failed: {str(e)}")

        self.root.update()

    def _update_analysis_ui(self, text, color):
        self.analysis_var.set(text)
        self.analysis_lbl.config(fg=color)

    def trigger_ai_turn(self):
        self.status_var.set("AI is Thinking...")
        self.status_label.config(fg="#ff4d4d")
        self.root.update()

        ai_move = get_action(self.state, max_time=2.5)

        self.is_thinking = False
        if ai_move:
            self.execute_action(ai_move, analyze=False)

    def undo_move(self):
        if self.is_thinking or len(self.history) < 2:
            return
        self.state = self.history[-2]
        self.history = self.history[:-2]
        self.analysis_var.set("Undid move. Make a move\nto see analysis.\n\n\n\n")
        self.analysis_lbl.config(fg="#aaaaaa")
        self.draw_board()
        self._update_status()

    def reset_game(self):
        if self.is_thinking:
            return
        self.history.clear()
        self.state = copy.deepcopy(self.initial_state)
        self.analysis_var.set("Game Reset. Make a move\nto see analysis.\n\n\n\n")
        self.analysis_lbl.config(fg="#aaaaaa")
        self.draw_board()
        self._update_status()
        logging.info("=== GAME RESET ===")

    def _update_status(self):
        if self.state["status"] == "FINISHED":
            winner = (
                "You (Blue) Won!"
                if self.state["player1"]["position"]["r"]
                == self.state["player1"]["targetRow"]
                else "AI (Black) Won!"
            )
            self.status_var.set(f"Game Over: {winner}")
            self.status_label.config(fg="#00ff00")
        else:
            if self.state["turn"] == "p1":
                self.status_var.set("Your Turn (Blue)")
                self.status_label.config(fg="#4da6ff")
            else:
                self.status_var.set("AI Turn (Black)")
                self.status_label.config(fg="#ff4d4d")


if __name__ == "__main__":
    root = tk.Tk()
    app = NaknikiHumanVsAI(root)
    root.mainloop()
