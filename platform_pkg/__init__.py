"""
DeepScan Platform Subsystems & Data Layer
Forwards Python stdlib platform attributes to avoid shadowing conflicts.
"""
import sys
import importlib.util
from pathlib import Path

# Find and load the Python standard library 'platform' module
_root_dir = Path(__file__).resolve().parent.parent

for _p in sys.path:
    try:
        _p_path = Path(_p).resolve()
        if _p_path == _root_dir:
            continue
        _candidate = _p_path / "platform.py"
        if _candidate.is_file():
            _spec = importlib.util.spec_from_file_location("_stdlib_platform", str(_candidate))
            if _spec and _spec.loader:
                _mod = importlib.util.module_from_spec(_spec)
                _spec.loader.exec_module(_mod)
                for _attr in dir(_mod):
                    if not (_attr.startswith("__") and _attr.endswith("__")):
                        globals()[_attr] = getattr(_mod, _attr)
                break
    except Exception:
        continue
