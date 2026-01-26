import requests
import json
import os
from typing import Dict, Any

class GeminiClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        # Using 1.5 Flash for speed and efficiency
        self.url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={self.api_key}"

    def generate_comparison_analysis(self, company_name: str, current_data: Dict, prior_data: Dict) -> str:
        """
        Generates a comparative analysis between two reports using Gemini.
        """
        
        # Construct the prompt
        prompt = f"""
        You are a generic stock analyst. Analyze the following data for company '{company_name}'.
        
        [Current Report]
        Title: {current_data.get('title')}
        Date: {current_data.get('date')}
        Revenue: {current_data.get('revenue', 'N/A')}
        Operating Profit: {current_data.get('profit', 'N/A')}
        
        [Prior Report]
        Title: {prior_data.get('title')}
        Date: {prior_data.get('date')}
        Revenue: {prior_data.get('revenue', 'N/A')}
        Operating Profit: {prior_data.get('profit', 'N/A')}
        
        [Task]
        1. Compare the Revenue and Operating Profit between the two periods. State the direction of change (Increased/Decreased) and the amount/percentage if possible.
        2. Infer the focus on R&D based on the fact that this is a Bio/Pharma company. (If no specific R&D numbers are provided here, assume typical sector behavior or mention that text analysis suggests sustained R&D).
        3. Provide a concise summary (3-4 sentences total) in Korean.
        4. Then provide the SAME summary in English.
        5. Provide a 1-sentence "Company Summary" (What does this company do?) in Korean.
        
        Output format (STRICT):
        [SUMMARY]
        [1-sentence company description in Korean]
        
        [KOREAN]
        [Summary of financials in Korean]
        
        [Inference on R&D in Korean]
        
        [ENGLISH]
        [Summary of financials in English]
        
        [Inference on R&D in English]
        """

        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }]
        }
        
        try:
            response = requests.post(self.url, headers={'Content-Type': 'application/json'}, json=payload)
            response.raise_for_status()
            result = response.json()
            # Extract text from response
            full_text = result['candidates'][0]['content']['parts'][0]['text']
            
            # Split sections
            company_summary = ""
            korean_text = ""
            english_text = ""
            
            # Simple parsing strategy
            try:
                if "[SUMMARY]" in full_text:
                    parts1 = full_text.split("[SUMMARY]")
                    # content before summary is likely empty or garbage
                    remaining = parts1[1]
                    
                    if "[KOREAN]" in remaining:
                        parts2 = remaining.split("[KOREAN]")
                        company_summary = parts2[0].strip()
                        remaining2 = parts2[1]
                        
                        if "[ENGLISH]" in remaining2:
                            parts3 = remaining2.split("[ENGLISH]")
                            korean_text = parts3[0].strip()
                            english_text = parts3[1].strip()
                        else:
                            korean_text = remaining2.strip()
            except:
                # Fallback: Just return full text in Ko
                korean_text = full_text

            return {"ko": korean_text, "en": english_text, "summary": company_summary}
        except requests.exceptions.HTTPError as e:
            # Handle specific HTTP errors (like 429 rate limit)
            if e.response.status_code == 429:
                print(f"Gemini API Rate Limit: {e}")
                return {"ko": "분석 생성 실패 (API 사용량 초과)", "en": "Analysis failed (API rate limit)", "summary": ""}
            else:
                print(f"Gemini API HTTP Error: {e}")
                return {"ko": "분석 생성 실패", "en": "Analysis failed", "summary": ""}
        except Exception as e:
            print(f"Gemini API Error: {e}")
            return {"ko": "분석 생성 실패", "en": "Analysis failed", "summary": ""}
