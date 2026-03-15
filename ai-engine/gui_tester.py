import tkinter as tk
from tkinter import messagebox
import threading
import time
import copy
import json
import logging

# Core AI modules
from ai.minimax import get_action
from ai.transitions import apply_transition
from ai.game_model_utils import check_game_over
from ai.rules import get_legal_moves
from ai.search_utils import has_path

# --- LOGGING CONFIGURATION ---
logging.basicConfig(
    filename="quoridor_ai_logs.txt",
    filemode="w",
    level=logging.INFO,
    format="%(message)s",
)


class NaknikiAdvancedTester:
    def __init__(self, root):
        self.root = root
        self.root.title("Nakniki Quoridor - Advanced AI Tester")
        self.root.configure(bg="#2b2b2b")

        # Board metrics
        self.size = 9
        self.cell_sz = 55
        self.wall_th = 16
        self.unit = self.cell_sz + self.wall_th
        self.wall_mode = "h"

        # Game Tracking
        self.history = []
        self.is_thinking = False
        self.hint_move = None

        # Initial clean state
        self.initial_state = {
            "id": "gui_adv",
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

        logging.info("=== NAKNIKI ADVANCED TESTER STARTED ===")

    def build_ui(self):
        # Main Layout Frames
        self.left_frame = tk.Frame(self.root, bg="#2b2b2b")
        self.left_frame.pack(side=tk.LEFT, padx=20, pady=20)

        self.right_frame = tk.Frame(
            self.root, bg="#333333", padx=20, pady=20, relief=tk.RIDGE, bd=2
        )
        self.right_frame.pack(side=tk.RIGHT, fill=tk.Y, padx=20, pady=20)

        # --- LEFT FRAME (Board) ---
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

        # Bottom Wall Toggle
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

        # --- RIGHT FRAME (Controls) ---
        tk.Label(
            self.right_frame,
            text="Test Controls",
            font=("Segoe UI", 14, "bold"),
            bg="#333333",
            fg="white",
        ).pack(pady=(0, 20))

        # Walls Left display
        self.p1_walls_lbl = tk.Label(
            self.right_frame,
            text="P1 Walls: 10",
            font=("Segoe UI", 12),
            bg="#333333",
            fg="#4da6ff",
        )
        self.p1_walls_lbl.pack(anchor="w")
        self.p2_walls_lbl = tk.Label(
            self.right_frame,
            text="P2 Walls: 10",
            font=("Segoe UI", 12),
            bg="#333333",
            fg="#ff4d4d",
        )
        self.p2_walls_lbl.pack(anchor="w", pady=(0, 20))

        # Action Buttons
        btn_style = {
            "font": ("Segoe UI", 10, "bold"),
            "fg": "white",
            "relief": tk.FLAT,
            "width": 18,
            "pady": 5,
        }

        tk.Button(
            self.right_frame,
            text="💡 Show AI Hint",
            bg="#b38f00",
            command=self.request_hint,
            **btn_style,
        ).pack(pady=5)
        tk.Button(
            self.right_frame,
            text="🤖 Force AI Move",
            bg="#0066cc",
            command=self.trigger_ai_turn,
            **btn_style,
        ).pack(pady=5)
        tk.Button(
            self.right_frame,
            text="↩️ Undo Move",
            bg="#cc5200",
            command=self.undo_move,
            **btn_style,
        ).pack(pady=5)
        tk.Button(
            self.right_frame,
            text="🔄 Reset Game",
            bg="#cc0000",
            command=self.reset_game,
            **btn_style,
        ).pack(pady=25)

        tk.Button(
            self.right_frame,
            text="📋 Copy Raw State",
            bg="#4d4d4d",
            command=self.copy_state,
            **btn_style,
        ).pack(side=tk.BOTTOM)

    def toggle_wall_mode(self):
        self.wall_mode = "v" if self.wall_mode == "h" else "h"
        mode_text = "Vertical" if self.wall_mode == "v" else "Horizontal"
        self.mode_btn.config(text=f"Wall Mode: {mode_text} (Click to Swap)")

    def draw_board(self):
        self.canvas.delete("all")

        # 1. Floor tiles
        for r in range(self.size):
            for c in range(self.size):
                x0 = c * self.unit
                y0 = r * self.unit
                self.canvas.create_rectangle(
                    x0,
                    y0,
                    x0 + self.cell_sz,
                    y0 + self.cell_sz,
                    fill="#e0c097",
                    outline="#5c4322",
                    width=2,
                )

        # 2. Placed Walls
        for extended_r, extended_c in self.state["walls"]:
            self._draw_wall(extended_r, extended_c, fill_color="#d13838")

        # 3. Highlight Hint Move (if active)
        if self.hint_move:
            self._draw_hint(self.hint_move)

        # 4. Pawns
        for p_key, color in [("player1", "#0066cc"), ("player2", "#333333")]:
            pos = self.state[p_key]["position"]
            px = pos["c"] * self.unit + self.cell_sz // 2
            py = pos["r"] * self.unit + self.cell_sz // 2
            self.canvas.create_oval(
                px - 18, py - 18, px + 18, py + 18, fill=color, outline="white", width=2
            )

        # Labels
        self.p1_walls_lbl.config(
            text=f"P1 (Blue) Walls: {self.state['player1']['wallsLeft']}"
        )
        self.p2_walls_lbl.config(
            text=f"P2 (Black) Walls: {self.state['player2']['wallsLeft']}"
        )

    def _draw_wall(self, extended_r, extended_c, fill_color):
        r = extended_r // 2
        c = extended_c // 2
        is_h_gap = extended_r % 2 != 0
        is_v_gap = extended_c % 2 != 0

        # Base top-left of the main cell (r, c)
        x0 = c * self.unit
        y0 = r * self.unit

        if is_h_gap and is_v_gap:
            # Intersection between 4 cells
            x1 = x0 + self.cell_sz
            y1 = y0 + self.cell_sz
            x2 = x0 + self.unit
            y2 = y0 + self.unit
        elif is_h_gap:
            # Horizontal gap (directly below the cell)
            x1 = x0
            y1 = y0 + self.cell_sz
            x2 = x0 + self.cell_sz
            y2 = y0 + self.unit
        elif is_v_gap:
            # Vertical gap (directly to the right of the cell)
            x1 = x0 + self.cell_sz
            y1 = y0
            x2 = x0 + self.unit
            y2 = y0 + self.cell_sz
        else:
            # Shouldn't happen for walls, but fall back to the cell area
            x1 = x0
            y1 = y0
            x2 = x0 + self.cell_sz
            y2 = y0 + self.cell_sz

        self.canvas.create_rectangle(x1, y1, x2, y2, fill=fill_color, outline="")

    def _draw_hint(self, move):
        action_type = move[0]
        if action_type == "move":
            r, c = move[2]
            px = c * self.unit + self.cell_sz // 2
            py = r * self.unit + self.cell_sz // 2
            self.canvas.create_oval(
                px - 12, py - 12, px + 12, py + 12, fill="#00ff00", outline=""
            )
        elif action_type == "wall":
            r, c = move[2]
            orientation = move[3]
            walls_to_draw = (
                [(2 * r + 1, 2 * c), (2 * r + 1, 2 * c + 1), (2 * r + 1, 2 * c + 2)]
                if orientation == "h"
                else [
                    (2 * r, 2 * c + 1),
                    (2 * r + 1, 2 * c + 1),
                    (2 * r + 2, 2 * c + 1),
                ]
            )
            for wr, wc in walls_to_draw:
                self._draw_wall(wr, wc, fill_color="#00ff00")

    def validate_human_move(self, action):
        act_type = action[0]
        if act_type == "move":
            target_r, target_c = action[2]
            p1 = self.state["player1"]["position"]
            p2 = self.state["player2"]["position"]
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
        elif act_type == "wall":
            r, c = action[2]
            orientation = action[3]

            # FIXED: Map "p1" to "player1" and "p2" to "player2"
            player_key = "player1" if self.state["turn"] == "p1" else "player2"
            current_player = self.state[player_key]

            if (
                current_player["wallsLeft"] <= 0
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
        if self.is_thinking or self.state["status"] == "FINISHED":
            return

        c = event.x // self.unit
        r = event.y // self.unit
        off_x = event.x % self.unit
        off_y = event.y % self.unit
        if r >= self.size or c >= self.size:
            return

        action = None
        turn_id = self.state["turn"]

        if off_x < self.cell_sz and off_y < self.cell_sz:
            action = ("move", turn_id, (r, c))
        else:
            wr, wc = min(r, self.size - 2), min(c, self.size - 2)
            if off_x >= self.cell_sz and off_y < self.cell_sz:
                action = ("wall", turn_id, (wr, wc), "v")
            elif off_y >= self.cell_sz and off_x < self.cell_sz:
                action = ("wall", turn_id, (wr, wc), "h")
            else:
                action = ("wall", turn_id, (wr, wc), self.wall_mode)

        if action and self.validate_human_move(action):
            self.execute_action(action, actor="Human")
            # Auto-trigger AI if it's p2's turn now
            if self.state["turn"] == "p2" and not check_game_over(self.state):
                self.trigger_ai_turn()

    def execute_action(self, action, actor="AI", duration=0.0):
        self.hint_move = None
        self.history.append(copy.deepcopy(self.state))
        self.log_action(actor, action, duration)
        self.state = apply_transition(self.state, action)
        self.draw_board()
        self._update_status()

    # --- ADVANCED TESTER TOOLS ---

    def log_action(self, actor, action, duration):
        actor_label = f"{actor} ({'Blue' if self.state['turn'] == 'p1' else 'Black'})"
        action_type = (
            "MOVED" if action[0] == "move" else f"PLACED {action[3].upper()}-WALL"
        )
        logging.info("-" * 30)
        logging.info(
            f"[{actor_label}] {action_type} to {action[2]} | Time: {duration:.2f}s"
        )

    def trigger_ai_turn(self):
        if self.is_thinking or self.state["status"] == "FINISHED":
            return
        self.is_thinking = True
        self.status_var.set("AI is Thinking...")
        self.status_label.config(fg="#ff4d4d")
        self.root.update()
        threading.Thread(target=self._ai_worker, daemon=True).start()

    def _ai_worker(self):
        start_time = time.time()
        ai_move = get_action(self.state, max_time=2.5)
        duration = time.time() - start_time
        self.root.after(0, lambda: self._apply_ai_move(ai_move, duration))

    def _apply_ai_move(self, ai_move, duration):
        self.is_thinking = False
        if ai_move:
            self.execute_action(ai_move, actor="AI", duration=duration)

    def request_hint(self):
        if self.is_thinking or self.state["status"] == "FINISHED":
            return
        self.is_thinking = True
        self.status_var.set("Calculating Hint...")
        self.root.update()
        threading.Thread(target=self._hint_worker, daemon=True).start()

    def _hint_worker(self):
        start_time = time.time()
        best_move = get_action(self.state, max_time=2.0)
        duration = time.time() - start_time
        logging.info(f"[HINT REQUESTED] AI suggested {best_move} in {duration:.2f}s")
        self.root.after(0, lambda: self._show_hint(best_move))

    def _show_hint(self, move):
        self.is_thinking = False
        self.hint_move = move
        self.draw_board()
        self._update_status()

    def undo_move(self):
        if self.is_thinking or not self.history:
            return
        self.hint_move = None
        self.state = self.history.pop()
        logging.info("[UNDO] Reverted to previous state.")
        self.draw_board()
        self._update_status()

    def reset_game(self):
        if self.is_thinking:
            return
        self.hint_move = None
        self.history.clear()
        self.state = copy.deepcopy(self.initial_state)
        logging.info("=== GAME RESET ===")
        self.draw_board()
        self._update_status()

    def copy_state(self):
        # Convert frozenset back to list for JSON serialization
        export_state = copy.deepcopy(self.state)
        export_state["walls"] = list(export_state["walls"])
        state_json = json.dumps(export_state, indent=2)
        self.root.clipboard_clear()
        self.root.clipboard_append(state_json)
        messagebox.showinfo("Copied", "Current game state JSON copied to clipboard!")

    def _update_status(self):
        if self.state["status"] == "FINISHED":
            winner = (
                "P1 (Blue) Won!"
                if self.state["player1"]["position"]["r"]
                == self.state["player1"]["targetRow"]
                else "P2 (Black) Won!"
            )
            self.status_var.set(f"Game Over: {winner}")
            self.status_label.config(fg="#00ff00")
            logging.info(f"=== GAME OVER: {winner} ===")
        else:
            if self.state["turn"] == "p1":
                self.status_var.set("P1 Turn (Blue)")
                self.status_label.config(fg="#4da6ff")
            else:
                self.status_var.set("P2 Turn (Black)")
                self.status_label.config(fg="#ff4d4d")


if __name__ == "__main__":
    root = tk.Tk()
    app = NaknikiAdvancedTester(root)
    root.mainloop()
