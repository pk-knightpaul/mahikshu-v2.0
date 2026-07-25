#!/usr/bin/env python3
"""
Fetch crypto news from CryptoPanic API.
Requires API key for full access (free tier: 100 requests/day).
"""
import requests
import json
import os
from datetime import datetime, timezone

API_KEY = os.environ.get("CRYPTOPANIC_API_KEY", "")
API_URL = "https://cryptopanic.com/api/v1/posts/"
OUTPUT_FILE = "data/cryptopanic.json"

def fetch_cryptopanic():
    results = []
    now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

    if not API_KEY:
        print("CRYPTOPANIC_API_KEY not set. Skipping CryptoPanic fetch.")
        return []

    try:
        params = {
            "auth_token": API_KEY,
            "kind": "news",
            "filter": "important",
            "regions": "en",
            "limit": 50
        }
        resp = requests.get(API_URL, params=params, timeout=30)
        resp.raise_for_status()
        data = resp.json()

        for post in data.get("results", []):
            title = post.get("title", "")
            url = post.get("url", "")
            published = post.get("published_at", "")
            votes = post.get("votes", {})
            engagement = votes.get("positive", 0) + votes.get("negative", 0) + votes.get("important", 0) * 2

            content_type = "news"
            tags = ["cryptopanic"]

            title_lower = title.lower()
            if any(word in title_lower for word in ["hack", "exploit", "breach"]):
                content_type = "security"
                tags.append("security")
            elif any(word in title_lower for word in ["etf", "sec", "regulation"]):
                content_type = "regulation"
                tags.append("regulation")

            results.append({
                "id": f"cryptopanic_{post.get('id', '')}",
                "title": title,
                "platform": "cryptopanic",
                "content_type": content_type,
                "url": url,
                "published_at": published if published else now,
                "engagement": engagement,
                "summary": title,
                "tags": tags,
                "fetched_at": now
            })
    except Exception as e:
        print(f"Error fetching CryptoPanic: {e}")

    return results

def main():
    data = fetch_cryptopanic()
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(data)} CryptoPanic items to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
