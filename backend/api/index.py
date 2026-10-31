import os
import sys

# Ensure backend and repo root are in sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.abspath(os.path.join(current_dir, ".."))
repo_root = os.path.abspath(os.path.join(backend_dir, ".."))
for path in [backend_dir, repo_root]:
    if path not in sys.path:
        sys.path.insert(0, path)

from backend.app.main import app

__all__ = ["app"]

