#!/usr/bin/env node

/**
 * Education Statistics API Client
 * Interacts with the DfE Education Statistics API
 */

const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

// Configuration - Update these with your credentials
const API_BASE_URL = process.env.EDUCATION_API_BASE_URL || 'https://api.education.gov.uk/statistics';
const API_KEY = process.env.EDUCATION_API_KEY || '';
const API_VERSION = 'v1';

// Utility functions
function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}`;
  console.log(logMessage);
}

class EducationAPI {
  constructor(apiKey = API_KEY, baseUrl = API_BASE_URL) {
    this.baseURL = `${baseUrl}/${API_VERSION}`;
    this.apiKey = apiKey;
  }

  getHeaders() {
    const headers = {
      'User-Agent': 'School-Checker-API-Client/1.0',
      'Accept': 'application/json'
    };
    
    // Add API key if provided
    if (this.apiKey) {
      headers['Ocp-Apim-Subscription-Key'] = this.apiKey;
      headers['X-API-Key'] = this.apiKey;
    }
    
    return headers;
  }

  async testConnection() {
    log('🔍 Testing Education Statistics API connection...');
    
    try {
      // Try different endpoints to find the correct one
      const endpoints = [
        '/',
        '/data-sets',
        '/meta',
        '/health',
        '/docs'
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await axios.get(`${this.baseURL}${endpoint}`, {
            timeout: 5000,
            headers: this.getHeaders()
          });
          
          log(`✅ Endpoint ${endpoint} works: ${response.status}`);
          return { success: true, endpoint, data: response.data };
        } catch (error) {
          log(`❌ Endpoint ${endpoint} failed: ${error.response?.status || error.message}`);
        }
      }
      
      log('❌ No working endpoints found');
      return { success: false };
      
    } catch (error) {
      log(`Error testing API: ${error.message}`, 'ERROR');
      return { success: false, error: error.message };
    }
  }

  async getDataSets() {
    log('📊 Fetching available datasets...');
    
    try {
      const response = await axios.get(`${this.baseURL}/data-sets`, {
        timeout: 10000,
        headers: this.getHeaders()
      });
      
      log(`✅ Found ${response.data?.length || 0} datasets`);
      return { success: true, data: response.data };
      
    } catch (error) {
      log(`Error fetching datasets: ${error.response?.status || error.message}`, 'ERROR');
      return { success: false, error: error.message };
    }
  }

  async getDataSet(dataSetId, format = 'csv') {
    log(`📊 Fetching dataset ${dataSetId} in ${format} format...`);
    
    try {
      const url = `${this.baseURL}/data-sets/${dataSetId}/${format}`;
      const response = await axios.get(url, {
        timeout: 30000,
        headers: {
          ...this.getHeaders(),
          'Accept': format === 'csv' ? 'text/csv' : 'application/json'
        }
      });
      
      log(`✅ Dataset ${dataSetId} fetched successfully`);
      return { success: true, data: response.data };
      
    } catch (error) {
      log(`Error fetching dataset ${dataSetId}: ${error.response?.status || error.message}`, 'ERROR');
      return { success: false, error: error.message };
    }
  }

  async queryDataSet(dataSetId, filters = {}) {
    log(`🔍 Querying dataset ${dataSetId} with filters...`);
    
    try {
      const url = `${this.baseURL}/data-sets/${dataSetId}`;
      const response = await axios.get(url, {
        timeout: 30000,
        headers: this.getHeaders(),
        params: filters
      });
      
      log(`✅ Dataset ${dataSetId} queried successfully`);
      return { success: true, data: response.data };
      
    } catch (error) {
      log(`Error querying dataset ${dataSetId}: ${error.response?.status || error.message}`, 'ERROR');
      return { success: false, error: error.message };
    }
  }

  async searchOfstedData() {
    log('🔍 Searching for Ofsted-related datasets...');
    
    try {
      const dataSets = await this.getDataSets();
      if (!dataSets.success) {
        return dataSets;
      }
      
      const ofstedDataSets = dataSets.data?.filter(dataset => 
        dataset.name?.toLowerCase().includes('ofsted') ||
        dataset.description?.toLowerCase().includes('ofsted') ||
        dataset.name?.toLowerCase().includes('inspection')
      ) || [];
      
      log(`✅ Found ${ofstedDataSets.length} Ofsted-related datasets`);
      return { success: true, data: ofstedDataSets };
      
    } catch (error) {
      log(`Error searching Ofsted data: ${error.message}`, 'ERROR');
      return { success: false, error: error.message };
    }
  }
}

// CLI interface
async function main() {
  const api = new EducationAPI();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'test':
      await api.testConnection();
      break;
      
    case 'datasets':
      await api.getDataSets();
      break;
      
    case 'ofsted':
      await api.searchOfstedData();
      break;
      
    case 'dataset':
      const dataSetId = process.argv[3];
      const format = process.argv[4] || 'csv';
      if (dataSetId) {
        await api.getDataSet(dataSetId, format);
      } else {
        log('Usage: node education-api-client.js dataset <dataSetId> [format]', 'ERROR');
      }
      break;
      
    case 'query':
      const queryDataSetId = process.argv[3];
      if (queryDataSetId) {
        // Example filters for Ofsted data
        const filters = {
          geographicLevels: ['SCH'], // School level
          timePeriods: ['2024|AY'], // 2024/25 academic year
          // Add more filters as needed
        };
        await api.queryDataSet(queryDataSetId, filters);
      } else {
        log('Usage: node education-api-client.js query <dataSetId>', 'ERROR');
      }
      break;
      
    default:
      console.log(`
Education Statistics API Client

Usage:
  node education-api-client.js test                    # Test API connection
  node education-api-client.js datasets               # List available datasets
  node education-api-client.js ofsted                 # Search for Ofsted datasets
  node education-api-client.js dataset <id> [format]  # Get specific dataset
  node education-api-client.js query <id>            # Query dataset with filters

Environment Variables:
  EDUCATION_API_BASE_URL - Base URL for the API
  EDUCATION_API_KEY - Your API key/subscription key
      `);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = EducationAPI;
