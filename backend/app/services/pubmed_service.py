import time
from typing import List, Dict, Any
from Bio import Entrez
from supabase import Client
from app.core.config import settings
from urllib.error import HTTPError

class PubMedService:
    MAX_RETRIES = 3

    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client
        Entrez.email = settings.PUBMED_EMAIL
        Entrez.api_key = settings.PUBMED_API_KEY
        Entrez.tool = "AestheticIntelligence"
        # NCBI E-utilities limit: up to 10 req/sec with key, 3 req/sec without key.
        self.request_interval = 0.12 if settings.PUBMED_API_KEY else 0.34

    def _safe_api_call(self, func, **kwargs):
        for attempt in range(self.MAX_RETRIES):
            try:
                time.sleep(self.request_interval)
                handle = func(**kwargs)
                result = Entrez.read(handle)
                handle.close()
                return result
            except HTTPError as e:
                if e.code in (429, 503):
                    wait = self.request_interval * (2 ** (attempt + 1))
                    print(
                        f"Rate limited on PubMed API (HTTP {e.code}). "
                        f"Retrying in {wait:.2f}s ({attempt + 1}/{self.MAX_RETRIES})"
                    )
                    time.sleep(wait)
                    continue
                print(f"PubMed API HTTP error {e.code}: {e}")
                return None
            except Exception as e:
                wait = self.request_interval * (2 ** (attempt + 1))
                print(
                    f"PubMed API error: {e}. "
                    f"Retrying in {wait:.2f}s ({attempt + 1}/{self.MAX_RETRIES})"
                )
                time.sleep(wait)
        return None

    def fetch_pubmed_ids(self, keyword: str, max_results: int = 100) -> List[str]:
        try:
            record = self._safe_api_call(
                Entrez.esearch, db="pubmed", term=keyword, retmax=max_results, sort="date"
            )
            if not record:
                return []
            return record.get("IdList", [])
        except Exception as e:
            print(f"Error searching '{keyword}': {e}")
            return []

    def fetch_details_and_save(self, keyword: str, pmids: List[str]):
        if not pmids:
            return

        chunk_size = 100 
        total = len(pmids)
        
        for i in range(0, total, chunk_size):
            chunk = pmids[i:i+chunk_size]
            try:
                records = self._safe_api_call(
                    Entrez.efetch, db="pubmed", id=",".join(chunk), retmode="xml"
                )
                if not records:
                    continue

                papers_to_upsert = []
                # Entrez returns a list of PubmedArticle or PubmedBookArticle
                articles = records.get('PubmedArticle', [])
                
                for article in articles:
                    try:
                        medline = article['MedlineCitation']
                        article_data = article['PubmedData']
                        pmid = str(medline['PMID'])
                        
                        # Title
                        title = medline['Article']['ArticleTitle']
                        
                        # Abstract
                        abstract_text = ""
                        if 'Abstract' in medline['Article'] and 'AbstractText' in medline['Article']['Abstract']:
                            abs_list = medline['Article']['Abstract']['AbstractText']
                            parts = []
                            for item in abs_list:
                                if hasattr(item, 'title'): 
                                    text = str(item)
                                    parts.append(text)
                                else:
                                    parts.append(str(item))
                            abstract_text = "\n".join(parts)

                        # Authors
                        authors_list = []
                        if 'AuthorList' in medline['Article']:
                            for au in medline['Article']['AuthorList']:
                                last = au.get('LastName', '')
                                initials = au.get('Initials', '')
                                authors_list.append(f"{last} {initials}".strip())

                        # Journal
                        journal = medline['Article']['Journal'].get('Title', '')
                        
                        # PubDate
                        pub_date_str = ""
                        pub_date = medline['Article']['Journal']['JournalIssue']['PubDate']
                        if 'Year' in pub_date:
                            pub_date_str = pub_date['Year']
                            if 'Month' in pub_date:
                                pub_date_str += f"-{pub_date['Month']}"
                        
                        # Link
                        link = f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/"

                        paper = {
                            "id": pmid,
                            "title": title,
                            "abstract": abstract_text,
                            "authors": authors_list,
                            "publication_date": pub_date_str,
                            "journal": journal,
                            "link": link,
                            "keywords": [keyword] 
                        }
                        papers_to_upsert.append(paper)
                    except Exception as e:
                        # Skip malformed articles
                        continue

                # Upsert to Supabase
                for p in papers_to_upsert:
                    try:
                         self.supabase.table("pubmed_papers").upsert(p).execute()
                    except Exception as e:
                        print(f"Error upserting {p['id']}: {e}")

            except Exception as e:
                print(f"Error fetching details for chunk {i}: {e}")
                time.sleep(max(1, self.request_interval * 4))

    def trigger_fetch(self, keywords: List[str], max_results: int = 100):
        # This could be made async or run in background tasks
        results = {}
        for kw in keywords:
            pmids = self.fetch_pubmed_ids(kw, max_results)
            if pmids:
                self.fetch_details_and_save(kw, pmids)
            results[kw] = len(pmids)
        return results
