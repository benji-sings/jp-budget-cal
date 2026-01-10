#!/usr/bin/env python3
"""Entry point for the Python FastAPI backend."""
import uvicorn
import os

if __name__ == "__main__":
    port = int(os.environ.get("PYTHON_PORT", "5001"))
    uvicorn.run(
        "python_app.main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )
