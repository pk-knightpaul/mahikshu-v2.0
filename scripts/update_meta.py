#!/usr/bin/env python3
"""Update meta.json with timestamp and platform status."""
import json
import os
from datetime import datetime, timezone

DATA_DIR = "data"
OUTPUT_FILE = "data/meta.json"
PLATFORMS = ["binance", "coingecko", "dexscreener", "news", "defillama", "fear_greed", "snapshot"]

def update_meta():
    status = {}
    for p in PLATFORMS:
        fp = os.path.join(DATA_DIR, f"{p}.json")
        if os.path.exists(fp):
            try:
                with open(fp, "r") as f:
                    data = json.load(f)
                status[p] = "ok" if len(data) > 0 else "empty"
            except:
                status[p] = "error"
        else:
            status[p] = "missing"

    meta = {
        "last_updated": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "version": "2.0.0",
        "platforms_status": status,
        "total_opportunities": sum(1 for p in PLATFORMS if status.get(p) == "ok")
    }

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)
    print(f"Updated meta.json: {meta['last_updated']}")

if __name__ == "__main__":
    update_meta()
