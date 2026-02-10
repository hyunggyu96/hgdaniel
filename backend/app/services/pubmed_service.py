import time
from typing import List, Dict, Any
from Bio import Entrez
from supabase import Client
from app.core.config import settings

class PubMedService:
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client
        Entrez.email = settings.PUBMED_EMAIL
        Entrez.api_key = settings.PUBMED_API_KEY

    def fetch_pubmed_ids(self, keyword: str, max_results: int = 100) -> List[str]:
        try:
            handle = Entrez.esearch(db="pubmed", term=keyword, retmax=max_results, sort="date")
            record = Entrez.read(handle)
            handle.close()
            return record["IdList"]
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
                handle = Entrez.efetch(db="pubmed", id=",".join(chunk), retmode="xml")
                records = Entrez.read(handle)
                handle.close()

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
                
                time.sleep(0.4) # Rate limit respect

            except Exception as e:
                print(f"Error fetching details for chunk {i}: {e}")
                time.sleep(1)

    def trigger_fetch(self, keywords: List[str], max_results: int = 100):
        # This could be made async or run in background tasks
        results = {}
        for kw in keywords:
            pmids = self.fetch_pubmed_ids(kw, max_results)
            if pmids:
                self.fetch_details_and_save(kw, pmids)
            results[kw] = len(pmids)
        return results
