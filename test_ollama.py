
import asyncio
import json
from openai import AsyncOpenAI

async def test_ollama():
    client = AsyncOpenAI(api_key="ollama", base_url="http://localhost:11434/v1")
    try:
        response = await client.chat.completions.create(
            model="llama3",
            messages=[{"role": "user", "content": "Say hello in JSON"}],
            response_format={"type": "json_object"}
        )
        print(response.choices[0].message.content)
    except Exception as e:
        print(f"Error: {e}")

asyncio.run(test_ollama())
