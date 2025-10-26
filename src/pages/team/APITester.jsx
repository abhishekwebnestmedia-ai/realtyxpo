import React, { useState } from 'react';
import api from '../../api/api';
import { toast } from 'react-hot-toast';

const APITester = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testAPI = async (endpoint, testName) => {
    setLoading(true);
    try {
      console.log(`Testing ${testName}: ${endpoint}`);
      const response = await api.get(endpoint);
      
      const result = {
        success: true,
        status: response.status,
        data: response.data,
        dataLength: Array.isArray(response.data) ? response.data.length : 
                   response.data.users?.length || 
                   response.data.leads?.length || 
                   response.data.inventories?.length || 
                   'N/A'
      };
      
      setTestResults(prev => ({ ...prev, [testName]: result }));
      toast.success(`${testName} API working! Found ${result.dataLength} items`);
      
    } catch (error) {
      const result = {
        success: false,
        status: error.response?.status || 'Network Error',
        error: error.response?.data?.message || error.message
      };
      
      setTestResults(prev => ({ ...prev, [testName]: result }));
      toast.error(`${testName} API failed: ${result.error}`);
      
      console.error(`${testName} API Error:`, error);
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    await testAPI('/auth/teams', 'Teams');
  await testAPI('/realtleads/userbasedlead?name=Abhishek%20Singh', 'User Leads');
  await testAPI('/inventry/userbasedinventry?transferTo=Abhishek', 'User Inventory');
  };

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200 m-4">
      <h2 className="text-xl font-bold mb-4">API Tester</h2>
      
      <div className="space-y-4">
        <button
          onClick={runAllTests}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test All APIs'}
        </button>

        <div className="space-y-2">
          <button
            onClick={() => testAPI('/auth/teams', 'Teams')}
            className="block px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 text-sm"
          >
            Test Teams API
          </button>
          <button
            onClick={() => testAPI('/realtleads/userbasedlead?name=Abhishek%20Singh', 'User Leads')}
            className="block px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 text-sm"
          >
            Test User Leads API
          </button>
          <button
            onClick={() => testAPI('/inventry/userbasedinventry?transferTo=Abhishek', 'User Inventory')}
            className="block px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 text-sm"
          >
            Test User Inventory API
          </button>
        </div>

        {Object.keys(testResults).length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Test Results:</h3>
            {Object.entries(testResults).map(([testName, result]) => (
              <div key={testName} className={`p-3 rounded mb-2 ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="font-medium">
                  {testName}: {result.success ? '✅ Success' : '❌ Failed'}
                </div>
                <div className="text-sm text-gray-600">
                  Status: {result.status}
                </div>
                {result.success ? (
                  <div className="text-sm text-gray-600">
                    Data Length: {result.dataLength}
                  </div>
                ) : (
                  <div className="text-sm text-red-600">
                    Error: {result.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default APITester;