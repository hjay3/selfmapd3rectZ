import React, { useState } from 'react';
import { AlertCircle, FileJson } from 'lucide-react';
import { SelfMapVisualization } from './components/SelfMapVisualization';
import { extractDataPoints, formatJSON } from './utils/dataProcessing';

function App() {
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Record<string, any> | null>(null);

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(e.target.value);
    setError(null);
    
    try {
      if (e.target.value.trim()) {
        const parsedData = JSON.parse(e.target.value);
        setData(formatJSON(parsedData));
      } else {
        setData(null);
      }
    } catch (err) {
      setError('Invalid JSON format');
      setData(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileJson className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Input JSON Data</h2>
          </div>
          
          <textarea
            value={jsonInput}
            onChange={handleJsonChange}
            className="w-full h-48 p-4 border border-gray-200 rounded-lg font-mono text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Paste your JSON data here..."
          />

          {error && (
            <div className="mt-2 flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>

        {data && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Self Map Visualization</h2>
            <SelfMapVisualization data={extractDataPoints(data)} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;