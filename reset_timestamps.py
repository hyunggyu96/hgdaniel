"""Reset last_update.json to re-collect today's news"""
import json

# Reset to yesterday to trigger re-collection
reset_time = "2026-01-02T00:00:00"

with open('last_update.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Reset all keyword timestamps
for keyword in data.get('keyword_last_collected_at', {}):
    data['keyword_last_collected_at'][keyword] = reset_time

data['last_collected_at'] = reset_time

with open('last_update.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"✅ Reset all timestamps to {reset_time}")
print(f"   {len(data.get('keyword_last_collected_at', {}))} keywords updated")
