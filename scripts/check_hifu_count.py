import os
from Bio import Entrez
from dotenv import load_dotenv

load_dotenv('web/.env.local')

PUBMED_EMAIL = os.getenv("PUBMED_EMAIL", "test@example.com")
PUBMED_API_KEY = os.getenv("PUBMED_API_KEY", "")

Entrez.email = PUBMED_EMAIL
Entrez.api_key = PUBMED_API_KEY
Entrez.tool = "AestheticIntelligence"

handle = Entrez.esearch(db="pubmed", term="HIFU", retmax=1, sort="date")
record = Entrez.read(handle)
print(f"Total count for 'HIFU': {record['Count']}")
