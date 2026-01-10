#!/bin/bash
# Start both Python backend and Node.js frontend

# Cleanup function
cleanup() {
    echo "Shutting down..."
    kill $PYTHON_PID 2>/dev/null
    exit 0
}

# Set trap before starting processes
trap cleanup SIGINT SIGTERM EXIT

# Start Python backend in the background
echo "Starting Python backend on port 5001..."
python run_python.py &
PYTHON_PID=$!

# Wait for Python backend to be ready
echo "Waiting for Python backend to initialize..."
sleep 3

# Check if Python backend started successfully
if ! kill -0 $PYTHON_PID 2>/dev/null; then
    echo "Error: Python backend failed to start"
    exit 1
fi

echo "Python backend started (PID: $PYTHON_PID)"

# Start Node.js frontend (blocking)
echo "Starting Node.js frontend on port 5000..."
npm run dev
