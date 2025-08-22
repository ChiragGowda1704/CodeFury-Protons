import React, { useState } from 'react';
import { authAPI } from '../services/api';

const ApiTest = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testSignup = async () => {
    setLoading(true);
    setResult('Testing...');
    
    try {
      const response = await authAPI.signup({
        username: 'testuser_' + Date.now(),
        email: 'test_' + Date.now() + '@example.com',
        password: 'testpass123'
      });
      
      setResult(`✅ Success: ${JSON.stringify(response, null, 2)}`);
    } catch (error) {
      setResult(`❌ Error: ${error.message}\n\nDetails: ${JSON.stringify(error.response?.data || error, null, 2)}`);
      console.error('API Test Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testHealth = async () => {
    setLoading(true);
    setResult('Testing health...');
    
    try {
      const response = await fetch('http://localhost:8000/health');
      const data = await response.json();
      setResult(`✅ Health Check: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`❌ Health Check Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>API Connection Test</h2>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={testHealth} disabled={loading} style={{ marginRight: '10px' }}>
          Test Health Endpoint
        </button>
        <button onClick={testSignup} disabled={loading}>
          Test Signup API
        </button>
      </div>
      <div style={{ 
        background: '#f5f5f5', 
        padding: '15px', 
        borderRadius: '5px',
        whiteSpace: 'pre-wrap',
        minHeight: '100px'
      }}>
        <strong>Result:</strong><br />
        {result || 'Click a button to test the API connection'}
      </div>
    </div>
  );
};

export default ApiTest;
