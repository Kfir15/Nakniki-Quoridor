from flask import Flask, request, Response
from waitress import serve
import requests
import json
import os
import threading

app = Flask(__name__)

# load config file
CONFIG_PATH = os.path.join(os.path.dirname(__file__), "..", "config.json")
with open(CONFIG_PATH, "r") as f:
    config = json.load(f)

# get the proxy port
PROXY_PORT = config.get("proxy_port", 5000)

# get all the workers
AI_WORKERS = config.get("ai_workers", [])

# track how many active requests each worker has right now
active_requests = {worker: 0 for worker in AI_WORKERS}

# lock to update active_requests
lock = threading.Lock()


# return the least busy worker
def get_least_busy_worker():
    with lock:
        # get the worker
        best_worker = min(active_requests, key=active_requests.get)

        # increase its active requsets
        active_requests[best_worker] += 1

        return best_worker


@app.route("/", defaults={"path": ""}, methods=["GET", "POST", "PUT", "DELETE"])
@app.route("/<path:path>", methods=["GET", "POST", "PUT", "DELETE"])
def proxy(path):
    # get the worker and his url
    target_worker = get_least_busy_worker()
    target_url = f"{target_worker}/{path}"

    try:
        # forward the request to the worker
        resp = requests.request(
            method=request.method,
            url=target_url,
            headers={key: value for (key, value) in request.headers if key != "Host"},
            data=request.get_data(),
            cookies=request.cookies,
            allow_redirects=False,
        )

        # remove headers that will be auto set
        excluded_headers = [
            "content-encoding",
            "content-length",
            "transfer-encoding",
            "connection",
        ]
        headers = [
            (name, value)
            for (name, value) in resp.raw.headers.items()
            if name.lower() not in excluded_headers
        ]

        return Response(resp.content, resp.status_code, headers)

    except requests.exceptions.RequestException as e:
        return f"AI Worker unreachable: {e}", 502

    finally:
        with lock:
            # deacrese the active requests in the end
            active_requests[target_worker] -= 1


if __name__ == "__main__":
    serve(app, host="127.0.0.1", port=PROXY_PORT, _quiet=True)
