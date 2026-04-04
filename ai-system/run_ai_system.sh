#!/bin/bash

# print error and exit
error_exit() {
    echo "❌ Error: $1" >&2
    exit 1
}

# check that all the files exist
echo "🔍 Running files checks..."
if ! command -v python3 &> /dev/null; then error_exit "python3 is not installed."; fi
if [ ! -f "config.json" ]; then error_exit "config.json not found."; fi
if [ ! -f "ai-engine/server.py" ]; then error_exit "ai-engine/server.py not found."; fi
if [ ! -f "proxy/proxy.py" ]; then error_exit "proxy/proxy.py not found."; fi
if [ ! -f "requirements.txt" ]; then error_exit "requirements.txt not found in root directory."; fi
echo "   ✅ All files found."

# setup venv
echo "🐍 Setting up Python Virtual Environment..."
if [ ! -d "venv" ]; then
    echo "   Creating new virtual environment..."
    python3 -m venv venv || error_exit "Failed to create virtual environment. You might need to run: sudo apt install python3-venv"
fi

# activate the venv
source venv/bin/activate || error_exit "Failed to activate virtual environment."
echo "   ✅ Virtual environment activated."

# install all the dependencies from requirements.txt
echo "📦 Checking and installing dependencies..."
if [ ! -f "venv/.last_install" ] || [ "requirements.txt" -nt "venv/.last_install" ]; then
    python3 -m pip install -q -r requirements.txt || error_exit "Failed to install requirements."
    touch venv/.last_install
    echo "   ✅ Dependencies updated."
else
    echo "   ✅ Dependencies are already up to date (skipping install)."
fi

echo "⚙️ Loading configuration from config.json..."

# load the workers urls
WORKER_PORTS=$(python3 -c "
import json
try:
    with open('config.json', encoding='utf-8-sig') as f:
        data = json.load(f)
        print(' '.join([url.split(':')[-1] for url in data['ai_workers']]))
except Exception:
    pass
")

# load the proxy port
PROXY_PORT=$(python3 -c "
import json
try:
    with open('config.json', encoding='utf-8-sig') as f:
        print(json.load(f)['proxy_port'])
except Exception:
    pass
")

if [ -z "$WORKER_PORTS" ] || [ -z "$PROXY_PORT" ]; then
    error_exit "Failed to read ports from config.json. Check the JSON syntax."
fi

# run all the ai workers
PIDS=""
echo "🚀 Starting AI Workers..."
for PORT in $WORKER_PORTS; do
    python3 ai-engine/server.py $PORT &
    PID=$!
    PIDS="$PIDS $PID"
    echo "   ✅ Started AI worker on port $PORT (PID: $PID)"
done

# start the proxy
echo "🚀 Starting Proxy Server on port $PROXY_PORT..."
python3 proxy/proxy.py &
PROXY_PID=$!

echo "------------------------------------------------"
echo "✅ Everything is running! You can start playing now."
echo "   (Press Ctrl+C to shut down the system)"
echo "------------------------------------------------"

# if error or interrupt, cleanup all the servers
cleanup() {
    echo ""
    echo "🛑 Shutting down the system..."
    
    # shut down proxy
    echo "   🛑 Shutting down Proxy (PID: $PROXY_PID)"
    kill $PROXY_PID 2>/dev/null

    # shut down workers
    for PID in $PIDS; do
        echo "   🛑 Shutting down AI Worker $PID"
        kill $PID 2>/dev/null
    done
    
    deactivate 2>/dev/null
    echo "   Done."
    exit 0
}
trap cleanup SIGINT SIGTERM

wait $PROXY_PID
