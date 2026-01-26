import requests
import xml.etree.ElementTree as ET
from typing import List, Dict, Any
import logging

class LawAPI:
    """
    Client for National Law Information Center API.
    Currently uses MOCK DATA for development.
    """
    def __init__(self, api_key: str = None):
        self.api_key = api_key
        self.base_url = "http://www.law.go.kr/DRF/lawSearch.do"
        self.logger = logging.getLogger(__name__)

    def search_laws(self, query: str) -> List[Dict[str, Any]]:
        """
        Search for laws (Acts).
        Returns mock data relevant to the query if no API key is present.
        """
        # MOCK DATA for Aesthetic/Medical domain
        mock_data = [
            {
                "id": "2024-001",
                "name": "의료기기법 (Medical Device Act)",
                "type": "법률",
                "date": "2024-01-20",
                "summary": "의료기기의 제조, 수입, 판매 및 사용에 관한 사항을 규정함.",
                "link": "https://www.law.go.kr/법령/의료기기법"
            },
            {
                "id": "2024-002",
                "name": "체외진단의료기기법",
                "type": "법률",
                "date": "2023-12-15",
                "summary": "체외진단의료기기의 안전성 확보 및 품질 향상을 위한 법률.",
                "link": "https://www.law.go.kr/법령/체외진단의료기기법"
            },
             {
                "id": "2024-003",
                "name": "화장품법 (Cosmetics Act)",
                "type": "법률",
                "date": "2024-02-05",
                "summary": "화장품의 제조, 유통, 판매에 관한 규제.",
                "link": "https://www.law.go.kr/법령/화장품법"
            }
        ]
        
        # Simple filter for mock purposes
        if query:
            return [law for law in mock_data if query in law['name'] or query in law['summary']]
        return mock_data

    def search_admin_rules(self, query: str) -> List[Dict[str, Any]]:
        """
        Search for Administrative Rules (Notices, Guidelines).
        """
        mock_data = [
            {
                "id": "ADM-001",
                "name": "의료기기 기준규격",
                "type": "식약처 고시",
                "date": "2024-01-10",
                "summary": "의료기기의 전기 기계적 안전성 및 전자파 안전성에 관한 공통 기준 규격 개정.",
                "link": "https://www.law.go.kr/행정규칙/의료기기기준규격"
            },
            {
                "id": "ADM-002",
                "name": "의료기기 허가·신고·심사 등에 관한 규정",
                "type": "식약처 고시",
                "date": "2024-01-05",
                "summary": "미용 목적 고출력 레이저 장비의 허가 심사 요건 강화.",
                "link": "https://www.law.go.kr/행정규칙/의료기기허가신고심사등에관한규정"
            }
        ]
        
        if query:
            return [rule for rule in mock_data if query in rule['name'] or query in rule['summary']]
        return mock_data

    def get_law_detail(self, law_name: str) -> str:
        """
        Get simplified full text (Mock).
        """
        if "의료기기법" in law_name:
            return """
            제1조(목적) 이 법은 의료기기의 제조ㆍ수입ㆍ판매 및 사용 등에 필요한 사항을 규정함으로써 의료기기의 효율적인 관리를 도모하고 국민보건 향상에 이바지함을 목적으로 한다.
            제2조(정의) 1. "의료기기"란 사람이나 동물에게 단독 또는 조합하여 사용되는 기구ㆍ기계ㆍ장치ㆍ재료ㆍ소프트웨어 또는 이와 유사한 제품으로서 다음 각 목의 어느 하나에 해당하는 제품을 말한다.
            가. 질병을 진단ㆍ치료ㆍ경감ㆍ처치 또는 예방할 목적으로 사용되는 제품
            나. 상해(傷害) 또는 장애를 진단ㆍ치료ㆍ경감 또는 보정할 목적으로 사용되는 제품
            다. 구조 또는 기능을 검사ㆍ대체 또는 변형할 목적으로 사용되는 제품
            라. 임신을 조절할 목적으로 사용되는 제품
            ... (중략) ...
            [최신 개정 사항]
            최근 미용 목적의 의료기기 사용이 증가함에 따라, 사용자 안전을 위한 표시 기재 의무가 강화되었습니다. 특히 레이저 등 고위험 기기에 대한 부작용 경고 문구를 의무화합니다.
            """
        return "법령 상세 내역을 찾을 수 없습니다."
