#!/bin/bash

# print error and exit
error_exit() {
    echo "❌ Error: $1" >&2
    exit 1
}

# check that all the files exist
echo "🔍 Running files checks..."
if ! command -v python &> /dev/null; then error_exit "python is not installed."; fi
if [ ! -f "config.json" ]; then error_exit "config.json not found."; fi
if [ ! -f "ai-engine/server.py" ]; then error_exit "ai-engine/server.py not found."; fi
if [ ! -f "proxy/proxy.py" ]; then error_exit "proxy/proxy.py not found."; fi
if [ ! -f "ai-engine/analysis/worker.py" ]; then error_exit "ai-engine/analysis/worker.py not found."; fi
if [ ! -f "requirements.txt" ]; then error_exit "requirements.txt not found in root directory."; fi
echo "   ✅ All files found."

# setup venv
echo "🐍 Setting up Python Virtual Environment..."
if [ ! -d "venv" ]; then
    echo "   Creating new virtual environment..."
    python -m venv venv || error_exit "Failed to create virtual environment. You might need to run: sudo apt install python3-venv"
fi

# activate the venv
source venv/Scripts/activate || error_exit "Failed to activate virtual environment."
echo "   ✅ Virtual environment activated."

# install all the dependencies from requirements.txt
echo "📦 Checking and installing dependencies..."
if [ ! -f "venv/.last_install" ] || [ "requirements.txt" -nt "venv/.last_install" ]; then
    python -m pip install -q -r requirements.txt || error_exit "Failed to install requirements."
    touch venv/.last_install
    echo "   ✅ Dependencies updated."
else
    echo "   ✅ Dependencies are already up to date (skipping install)."
fi

echo "⚙️ Loading configuration from config.json..."

# load the workers urls
WORKER_PORTS=$(python -c "
import json
try:
    with open('config.json', encoding='utf-8-sig') as f:
        data = json.load(f)
        print(' '.join([url.split(':')[-1] for url in data['ai_workers']]))
except Exception:
    pass
")

# load the proxy port
PROXY_PORT=$(python -c "
import json
try:
    with open('config.json', encoding='utf-8-sig') as f:
        print(json.load(f)['proxy_port'])
except Exception:
    pass
")

# load the analysis workers count (defaults to 1 if not found)
ANALYSIS_WORKERS_COUNT=$(python -c "
import json
try:
    with open('config.json', encoding='utf-8-sig') as f:
        print(json.load(f).get('analysis_workers_count', 1))
except Exception:
    print('1')
")

if [ -z "$WORKER_PORTS" ] || [ -z "$PROXY_PORT" ]; then
    error_exit "Failed to read ports from config.json. Check the JSON syntax."
fi

# run all the ai workers
PIDS=""
echo "🚀 Starting AI Workers..."
for PORT in $WORKER_PORTS; do
    python ai-engine/server.py $PORT &
    PID=$!
    PIDS="$PIDS $PID"
    echo "   ✅ Started AI worker on port $PORT (PID: $PID)"
done

# run the analysis background workers
echo "🚀 Starting Analysis Workers..."
for i in $(seq 1 $ANALYSIS_WORKERS_COUNT); do
    python ai-engine/analysis/worker.py &
    PID=$!
    PIDS="$PIDS $PID"
    echo "   ✅ Started Analysis Worker #$i (PID: $PID)"
done

# start the proxy
echo "🚀 Starting Proxy Server on port $PROXY_PORT..."
python proxy/proxy.py &
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
        echo "   🛑 Shutting down Worker $PID"
        kill $PID 2>/dev/null
    done
    
    deactivate 2>/dev/null
    echo "   Done."
    exit 0
}
trap cleanup SIGINT SIGTERM

wait $PROXY_PID