import aiohttp
import asyncio
import os
from dotenv import load_dotenv

async def test_tablet_connection():
    load_dotenv("collector/.env")
    url = os.getenv("OLLAMA_HOST") + "/api/tags"
    print(f"Checking connection to: {url}")
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=10) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    print("✅ Successfully connected to Tablet Ollama!")
                    print("Available models:")
                    for m in data.get("models", []):
                        print(f" - {m['name']}")
                else:
                    print(f"❌ Connection failed with status {resp.status}")
    except Exception as e:
        print(f"❌ Connection error: {e}")

if __name__ == "__main__":
    asyncio.run(test_tablet_connection())
