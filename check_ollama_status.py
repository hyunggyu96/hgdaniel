
import aiohttp
import asyncio

async def check_ollama_models():
    url = "http://localhost:11434/api/tags"
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=5) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    print(f"✅ Ollama Connected! Found models:")
                    for m in data.get('models', []):
                        print(f" - {m['name']}")
                else:
                    print(f"❌ Ollama Error: HTTP {resp.status}")
    except Exception as e:
        print(f"❌ Connection Failed: {e}")

if __name__ == "__main__":
    asyncio.run(check_ollama_models())
