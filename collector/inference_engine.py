import asyncio
import aiohttp
import json
import os
import time
from typing import Dict, Any, Optional

class InferenceEngine:
    def __init__(self):
        self.semaphore = asyncio.Semaphore(3) # Max 3 concurrent requests to tablet
        self.local_host = os.getenv("OLLAMA_HOST", "http://192.168.0.15:11434") # Default placeholder
        self.model = os.getenv("OLLAMA_MODEL", "llama3.2:3b")
        self.gemini_keys = [os.getenv("GEMINI_API_KEY"), os.getenv("GEMINI_API_KEY_2")]
        self.gemini_keys = [k for k in self.gemini_keys if k]
        
    async def call_ollama(self, system_prompt: str, user_prompt: str) -> Optional[Dict[str, Any]]:
        url = f"{self.local_host}/api/generate"
        print(f"  [Ollama Debug] Connecting to: {url}")
        payload = {
            "model": self.model,
            "prompt": f"{system_prompt}\n\n{user_prompt}\n\nRespond in JSON format only.",
            "stream": False,
            "format": "json"
        }
        
        start_time = time.time()
        try:
            async with self.semaphore:
                async with aiohttp.ClientSession() as session:
                    async with session.post(url, json=payload, timeout=120) as resp:
                        if resp.status == 200:
                            res_json = await resp.json()
                            latency = time.time() - start_time
                            data = json.loads(res_json.get("response", "{}"))
                            return {**data, "model": f"Local-{self.model}", "latency": latency, "provider": "local"}
                        else:
                            print(f"  [Ollama] Failed with status {resp.status}")
                            return None
        except Exception as e:
            print(f"  [Ollama] Connection Error: {e}")
            return None

    async def call_gemini(self, system_prompt: str, user_prompt: str) -> Optional[Dict[str, Any]]:
        full_prompt = f"{system_prompt}\n\n{user_prompt}"
        start_time = time.time()
        
        for k in self.gemini_keys:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={k}"
            payload = {
                "contents": [{"parts": [{"text": full_prompt}]}],
                "generationConfig": {"response_mime_type": "application/json"}
            }
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.post(url, json=payload, timeout=15) as resp:
                        if resp.status == 200:
                            res_json = await resp.json()
                            text = res_json['candidates'][0]['content']['parts'][0]['text']
                            latency = time.time() - start_time
                            data = json.loads(text)
                            return {**data, "model": "Gemini-2.0-Flash", "latency": latency, "provider": "cloud"}
                        elif resp.status == 429:
                            print(f"  [Gemini] Quota Exceeded (429). Trying next key...")
                            continue
            except Exception as e:
                print(f"  [Gemini] Error: {e}")
                continue
        return None

    async def get_analysis_hybrid(self, system_prompt: str, user_prompt: str) -> Dict[str, Any]:
        # 1. Try Local First (Save Tokens!)
        result = await self.call_ollama(system_prompt, user_prompt)
        if result:
            return result
        
        # 2. Fallback to Cloud (Only if Local fails)
        print("  ⚠️ Local engine failed/offline. Falling back to Cloud...")
        result = await self.call_gemini(system_prompt, user_prompt)
        if result:
            return result
            
        # 3. Last resort
        return {"error": "All engines failed"}
