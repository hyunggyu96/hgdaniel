
import requests
try:
    res = requests.get("http://localhost:11434/api/tags")
    models = res.json().get('models', [])
    for m in models:
        print(m['name'])
except Exception as e:
    print(f"Error: {e}")
