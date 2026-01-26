// API Configuration
// This file centralizes all API endpoint configuration

const API_BASE_URL = ''; // Use relative paths for Vercel serverless functions

export const API_ENDPOINTS = {
    // Company Analysis
    analyze: `${API_BASE_URL}/api/analyze`,
    rankings: `${API_BASE_URL}/api/rankings`,
    stockData: (companyName: string) => `${API_BASE_URL}/api/stock-data/${encodeURIComponent(companyName)}`,
    news: (companyName: string) => `${API_BASE_URL}/api/news/${encodeURIComponent(companyName)}`,

    // Policy
    policyLatest: `${API_BASE_URL}/api/policy/latest`,
    policyAnalyze: `${API_BASE_URL}/api/policy/analyze`,
};

export default API_BASE_URL;
