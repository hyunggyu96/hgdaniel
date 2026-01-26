from flask import Flask, request, jsonify
from src.analyzer import StockAnalyzer
from src.api.ranking import RankingManager
from flask_cors import CORS
import logging

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/')
def home():
    return jsonify({"status": "ok", "service": "Company Analyzer Backend (Flask)"})

@app.route('/api/analyze', methods=['POST'])
def analyze_company():
    data = request.get_json()
    if not data or 'company_name' not in data:
        return jsonify({"error": "Missing company_name"}), 400
    
    company_name = data['company_name']
    analyzer = StockAnalyzer()
    try:
        result = analyzer.analyze_company(company_name)
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error analyzing {company_name}: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        analyzer.close()

@app.route('/api/rankings', methods=['GET'])
def get_rankings():
    """Get company rankings by revenue"""
    try:
        ranking_manager = RankingManager()
        rankings = ranking_manager.get_rankings()
        return jsonify(rankings)
    except Exception as e:
        logger.error(f"Error fetching rankings: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
