import requests
import json
from typing import Dict, Any

class GeminiClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        # Using 1.5 Flash for speed and efficiency
        self.url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"

    def generate_comparison_analysis(self, company_name: str, current_data: Dict, prior_data: Dict) -> Dict[str, str]:
        """
        Generates a comparative analysis between two reports using Gemini.
        """
        if not self.api_key:
             return {"ko": "API Key Missing", "en": "API Key Missing", "summary": "API Config Error"}
            
        # Construct the prompt
        prompt = f"""
        You are a financial analyst. Analyze the following data for company '{company_name}'.
        
        [Current Report]
        Title: {current_data.get('title')}
        Date: {current_data.get('date')}
        data: {current_data.get('financials', {})}
        
        [Prior Report]
        Title: {prior_data.get('title')}
        Date: {prior_data.get('date')}
        data: {prior_data.get('financials', {})}
        
        [Task]
        1. Compare the Revenue and Operating Profit between the two periods. State the direction of change (Increased/Decreased) and the amount/percentage if possible.
        2. Infer the focus on R&D based on the available data.
        3. Provide a concise summary (3-4 sentences total) in Korean.
        4. Then provide the SAME summary in English.
        5. Provide a 1-sentence "Company Summary" (What does this company do?) in Korean.
        
        Output format (STRICT):
        [SUMMARY]
        [1-sentence company description in Korean]
        
        [KOREAN]
        [Summary of financials in Korean]
        
        [ENGLISH]
        [Summary of financials in English]
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
            
            # Simple parsing strategy
            company_summary = ""
            korean_text = full_text
            english_text = ""
            
            try:
                if "[SUMMARY]" in full_text:
                    parts1 = full_text.split("[SUMMARY]")
                    remaining = parts1[1] if len(parts1) > 1 else parts1[0]
                    
                    if "[KOREAN]" in remaining:
                        parts2 = remaining.split("[KOREAN]")
                        company_summary = parts2[0].strip()
                        remaining2 = parts2[1] if len(parts2) > 1 else ""
                        
                        if "[ENGLISH]" in remaining2:
                            parts3 = remaining2.split("[ENGLISH]")
                            korean_text = parts3[0].strip()
                            english_text = parts3[1].strip()
                        else:
                            korean_text = remaining2.strip()
            except:
                pass

            return {"ko": korean_text, "en": english_text, "summary": company_summary}
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 429:
                return {"ko": "분석 생성 실패 (API 사용량 초과)", "en": "Analysis failed (API rate limit)", "summary": ""}
            else:
                return {"ko": "분석 생성 실패", "en": "Analysis failed", "summary": ""}
        except Exception as e:
            return {"ko": f"분석 오류: {str(e)}", "en": "Analysis Error", "summary": ""}
