#!/usr/bin/env python3
"""Fetch crypto news from RSS feeds."""
import feedparser
import json
import os
from datetime import datetime, timezone

FEEDS = [
    ("cointelegraph", "https://cointelegraph.com/rss"),
    ("coindesk", "https://coindesk.com/arc/outboundfeeds/rss/"),
    ("decrypt", "https://decrypt.co/feed"),
]
OUTPUT_FILE = "data/news.json"

def fetch_news():
    results = []
    now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

    for source, url in FEEDS:
        try:
            feed = feedparser.parse(url)
            for entry in feed.entries[:15]:
                published = entry.get("published", "")
                try:
                    parsed = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc).isoformat().replace("+00:00", "Z")
                except:
                    parsed = now

                title = entry.get("title", "")
                title_lower = title.lower()
                content_type = "news"
                if any(w in title_lower for w in ["hack", "exploit", "breach", "stolen"]):
                    content_type = "security"
                elif any(w in title_lower for w in ["sec", "regulation", "regulatory", "law", "bill"]):
                    content_type = "regulation"
                elif any(w in title_lower for w in ["list", "listing", "delist"]):
                    content_type = "listing_news"

                results.append({
                    "id": f"news_{source}_{hash(entry.get('id', entry.get('link', ''))) & 0xFFFFFFFF}",
                    "title": title,
                    "platform": "news",
                    "content_type": content_type,
                    "url": entry.get("link", ""),
                    "published_at": parsed,
                    "engagement": 0,
                    "summary": entry.get("summary", "")[:200] + "..." if len(entry.get("summary", "")) > 200 else entry.get("summary", ""),
                    "tags": [source, "news", content_type],
                    "fetched_at": now
                })
        except Exception as e:
            print(f"Error fetching {source}: {e}")

    return results

def main():
    data = fetch_news()
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(data)} news items to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
