# platform/mission_fsm.py

import time
from enum import Enum

class Phase(str, Enum):
    SURFACE      = "SURFACE"
    DESCENDING   = "DESCENDING"
    OBSERVING    = "OBSERVING"
    SONAR_SCAN   = "SONAR_SCAN"
    ASCENDING    = "ASCENDING"
    REPORTING    = "REPORTING"

MISSION_PROFILE = [
    (Phase.SURFACE,    0,   30),   # phase, target_depth_m, duration_s
    (Phase.DESCENDING, 500, 120),
    (Phase.OBSERVING,  500, 60),
    (Phase.SONAR_SCAN, 200, 45),
    (Phase.ASCENDING,  0,   90),
    (Phase.REPORTING,  0,   30),
]


class MissionFSM:
    def __init__(self):
        self.phase_idx   = 0
        self.phase_start = time.time()
        self.depth       = 0.0

    def _current_spec(self):
        return MISSION_PROFILE[self.phase_idx % len(MISSION_PROFILE)]

    def step(self):
        phase, target_depth, duration = self._current_spec()
        elapsed = time.time() - self.phase_start

        # Update depth (linear interpolation toward target)
        if self.depth != target_depth:
            prev_phase, prev_depth, _ = MISSION_PROFILE[
                (self.phase_idx - 1) % len(MISSION_PROFILE)
            ]
            progress = min(elapsed / duration, 1.0)
            self.depth = prev_depth + (target_depth - prev_depth) * progress

        if elapsed >= duration:
            self.phase_idx += 1
            self.phase_start = time.time()

    def current_depth(self) -> float:
        return round(self.depth, 1)

    def current_phase(self) -> str:
        return self._current_spec()[0].value

    def is_sonar_active(self) -> bool:
        return self._current_spec()[0] == Phase.SONAR_SCAN
