#!/usr/bin/env python3
"""
Fetch Crypto Fear & Greed Index from Alternative.me API.
"""
import requests
import json
import os
from datetime import datetime, timezone

API_URL = "https://api.alternative.me/fng/?limit=1"
OUTPUT_FILE = "data/fear_greed.json"

def fetch_fear_greed():
    results = []
    now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

    try:
        resp = requests.get(API_URL, timeout=30)
        resp.raise_for_status()
        data = resp.json()

        for item in data.get("data", []):
            value = int(item.get("value", 0))
            classification = item.get("value_classification", "Unknown")
            timestamp = item.get("timestamp", "")

            emoji = "😱" if value <= 20 else "😨" if value <= 40 else "😐" if value <= 60 else "😊" if value <= 80 else "🚀"

            results.append({
                "id": f"feargreed_{timestamp}",
                "title": f"{emoji} Fear & Greed Index: {value}/100 ({classification})",
                "platform": "alternative_me",
                "content_type": "sentiment",
                "url": "https://alternative.me/crypto/fear-and-greed-index/",
                "published_at": now,
                "engagement": value,
                "summary": f"Crypto market sentiment is {classification.lower()} at {value}/100. {'Extreme fear may signal buying opportunity.' if value <= 20 else 'Extreme greed may signal overheated market.' if value >= 80 else 'Market sentiment is neutral.'}",
                "tags": ["sentiment", "fear-greed", "market-mood"],
                "fetched_at": now
            })
    except Exception as e:
        print(f"Error fetching Fear & Greed: {e}")

    return results

def main():
    data = fetch_fear_greed()
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(data)} Fear & Greed items to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
