import asyncio
import aiohttp
import json
import os
import time
import datetime
from typing import Dict, Any, Optional

def _ts():
    """Current timestamp string for logging."""
    return datetime.datetime.now().strftime('%H:%M:%S')

class InferenceEngine:
    def __init__(self):
        self.semaphore = asyncio.Semaphore(1)
        self.local_host = os.getenv("OLLAMA_HOST", "http://127.0.0.1:8080")
        self.model = os.getenv("OLLAMA_MODEL", "qwen-3b")
        self.gemini_keys = [k for k in [os.getenv("GEMINI_API_KEY"), os.getenv("GEMINI_API_KEY_2")] if k]
        
    async def call_local_llm(self, system_prompt: str, user_prompt: str) -> Optional[Dict[str, Any]]:
        # Try OpenAI compatible endpoint (llama-server)
        url = f"{self.local_host}/v1/chat/completions"
        print(f"  [{_ts()}][Local LLM] Connecting to: {url}")
        
        payload = {
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.1,
            "max_tokens": 512,
            "response_format": {"type": "json_object"}
        }
        
        start_time = time.time()
        try:
            async with self.semaphore:
                async with aiohttp.ClientSession() as session:
                    async with session.post(url, json=payload, timeout=180) as resp:
                        if resp.status == 200:
                            res_json = await resp.json()
                            latency = time.time() - start_time
                            # Handle OpenAI format response
                            content = res_json['choices'][0]['message']['content']
                            data = json.loads(content)
                            return {**data, "model": f"Local-{self.model}", "latency": latency, "provider": "local"}
                        else:
                            print(f"  [{_ts()}][Local LLM] Failed with status {resp.status}")
                            text = await resp.text()
                            print(f"  [{_ts()}][Local LLM] Error detail: {text}")
                            return None
        except Exception as e:
            if "Connection refused" in str(e) or "404" in str(e):
                 return await self.call_ollama_fallback(system_prompt, user_prompt)
            print(f"  [{_ts()}][Local LLM] Connection Error: {e}")
            return None

    async def call_ollama_fallback(self, system_prompt: str, user_prompt: str) -> Optional[Dict[str, Any]]:
        # Backup: Ollama-compatible API on llama-server (port 8080)
        url = "http://127.0.0.1:8080/api/generate"
        print(f"  [{_ts()}][Ollama Fallback] Connecting to: {url}")
        payload = {
            "model": "qwen2.5:3b", # Assumes Ollama model name
            "prompt": f"{system_prompt}\n\n{user_prompt}\n\nRespond in JSON format only.",
            "stream": False,
            "format": "json"
        }
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload, timeout=90) as resp:
                    if resp.status == 200:
                        res_json = await resp.json()
                        data = json.loads(res_json.get("response", "{}"))
                        return {**data, "model": "Ollama-Fallback", "provider": "local"}
        except Exception:
            return None

    async def get_analysis_hybrid(self, system_prompt: str, user_prompt: str) -> Dict[str, Any]:
        # [V5.0] 로컬 AI(태블릿) 전용 모드 (외부 API 미사용)
        result = await self.call_local_llm(system_prompt, user_prompt)
        if result:
            return result
        
        # 로컬 AI 실패 시 즉시 에러 반환 (외부 API Fallback 제거)
        print(f"  [{_ts()}] ❌ Local engine failed/offline. (Cloud Fallback Disabled by User)")
        return {"error": "Local engine failed"}
