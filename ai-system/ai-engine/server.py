from waitress import serve
from flask import Flask, request, jsonify
from ai.minimax import get_action
from ai.game_model_utils import parse_state
import sys

app = Flask(__name__)


@app.route("/ai_get_action", methods=["POST"])
def api_get_action():
    try:
        # get the game state and parse it
        raw_game_state = request.get_json()

        if "state" in raw_game_state:
            raw_game_state = raw_game_state["state"]

        state = parse_state(raw_game_state)

        # get the best action
        best_action = get_action(state)

        # return the best action
        return jsonify(best_action), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    # get the port
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    else:
        port = 5001

    # run the server
    serve(app, host="127.0.0.1", port=port, _quiet=True)
