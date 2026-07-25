#!/usr/bin/env python3
"""Fetch Fear & Greed index."""
import requests
import json
import os
from datetime import datetime, timezone

API_URL = "https://api.alternative.me/fng/?limit=1"
OUTPUT_FILE = "data/fear_greed.json"

def fetch_fear_greed():
    try:
        response = requests.get(API_URL, timeout=30)
        response.raise_for_status()
        data = response.json()

        results = []
        now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

        for item in data.get("data", [])[:1]:
            value = item.get("value", 50)
            classification = item.get("value_classification", "Neutral")
            emoji = "😱" if int(value) < 25 else "😰" if int(value) < 45 else "😐" if int(value) < 55 else "😊" if int(value) < 75 else "🤑"

            results.append({
                "id": "fear_greed_latest",
                "title": f"{emoji} Crypto Fear & Greed: {value}/100 ({classification})",
                "platform": "alternative_me",
                "content_type": "sentiment",
                "url": "https://alternative.me/crypto/fear-and-greed-index/",
                "published_at": now,
                "engagement": int(value),
                "summary": f"The Crypto Fear & Greed Index is at {value} ({classification}). {'Extreme fear suggests a buying opportunity.' if int(value) < 25 else 'Extreme greed suggests caution.' if int(value) > 75 else 'Market sentiment is neutral.'}",
                "tags": ["sentiment", "fear-greed", "market-mood"],
                "fetched_at": now
            })

        return results
    except Exception as e:
        print(f"Error fetching Fear & Greed: {e}")
        return []

def main():
    data = fetch_fear_greed()
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(data)} Fear & Greed items to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
