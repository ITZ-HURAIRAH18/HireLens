import time
from collections import defaultdict
from typing import Dict, Tuple


class InMemoryRateLimiter:
    def __init__(self):
        self.usage: Dict[str, list] = defaultdict(list)

    def check(self, key: str, max_requests: int, window_seconds: int = 60) -> Tuple[bool, int]:
        now = time.time()
        window_start = now - window_seconds
        self.usage[key] = [t for t in self.usage[key] if t > window_start]
        if len(self.usage[key]) >= max_requests:
            return False, int(window_start + window_seconds - self.usage[key][0])
        self.usage[key].append(now)
        return True, 0


rate_limiter = InMemoryRateLimiter()
