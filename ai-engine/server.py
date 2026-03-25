from flask import Flask, request, jsonify
from ai.minimax import get_action
from ai.game_model_utils import parse_state

app = Flask(__name__)


@app.route("/ai_get_action", methods=["POST"])
def api_get_action():
    try:
        # get the game state and parse it
        raw_game_state = request.get_json()
        state = parse_state(raw_game_state)

        # get the best action
        best_action = get_action(state)

        # return the best action
        return jsonify({"action": best_action}), 200

    except Exception as e:
        # return error
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    print("Quoridor AI Server is running on http://127.0.0.1:5000")
    # run the server
    app.run(host="127.0.0.1", port=5000, threaded=True)
