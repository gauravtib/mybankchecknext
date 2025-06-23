import React, { useState } from 'react';
import { X, Upload, AlertTriangle, CheckCircle, FileText } from 'lucide-react';

interface ImportAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (csvData: any[], companyName: string) => void;
}

const COMPANY_OPTIONS = [
  'Loot',
  'Bluevine', 
  'OnDeck',
  'Kabbage',
  'Funding Circle',
  'Square Capital',
  'PayPal Working Capital',
  'Amazon Lending',
  'Other'
];

export function ImportAccountsModal({ isOpen, onClose, onImport }: ImportAccountsModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any[] | null>(null);

  if (!isOpen) return null;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        setError('Please select a CSV file');
        return;
      }
      setSelectedFile(file);
      setError(null);
      previewCSV(file);
    }
  };

  const previewCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          setError('CSV file must contain at least a header row and one data row');
          return;
        }

        // Parse CSV (simple implementation)
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        const preview = lines.slice(1, 4).map(line => {
          const values = line.split(',').map(v => v.replace(/"/g, '').trim());
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          return row;
        });

        setPreviewData(preview);
      } catch (err) {
        setError('Error reading CSV file. Please check the file format.');
        console.error('CSV parsing error:', err);
      }
    };
    reader.readAsText(file);
  };

  const parseCSV = (text: string) => {
    try {
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV file must contain at least a header row and one data row');
      }

      // Parse CSV headers
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
      
      // Parse CSV data
      const data = lines.slice(1).map((line, index) => {
        try {
          const values = line.split(',').map(v => v.replace(/"/g, '').trim());
          const row: any = {};
          
          headers.forEach((header, headerIndex) => {
            row[header] = values[headerIndex] || '';
          });
          
          return row;
        } catch (err) {
          console.error(`Error parsing line ${index + 2}:`, line, err);
          return null;
        }
      }).filter(row => row !== null);

      return data;
    } catch (err) {
      console.error('CSV parsing error:', err);
      throw new Error('Error parsing CSV file. Please check the file format.');
    }
  };

  const handleImport = async () => {
    if (!selectedFile || !selectedCompany) {
      setError('Please select both a CSV file and a company name');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const text = e.target?.result as string;
          const csvData = parseCSV(text);
          
          console.log('Parsed CSV data:', csvData);
          console.log('Selected company:', selectedCompany);
          
          // Call the import function
          await onImport(csvData, selectedCompany);
          
          // Reset form
          setSelectedFile(null);
          setSelectedCompany('');
          setPreviewData(null);
          setIsProcessing(false);
          
          // Close modal
          onClose();
        } catch (err: any) {
          console.error('Import error:', err);
          setError(err.message || 'Error importing CSV data');
          setIsProcessing(false);
        }
      };
      
      reader.onerror = () => {
        setError('Error reading file');
        setIsProcessing(false);
      };
      
      reader.readAsText(selectedFile);
    } catch (err: any) {
      console.error('File reading error:', err);
      setError(err.message || 'Error reading file');
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setSelectedFile(null);
      setSelectedCompany('');
      setPreviewData(null);
      setError(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleClose}></div>

        {/* Modal panel */}
        <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Import Bank Accounts</h3>
                <p className="text-gray-600">Upload a CSV file to import bank account data</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isProcessing}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="text-red-800 font-medium">Error</span>
              </div>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Company Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                disabled={isProcessing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                required
              >
                <option value="">Select the company providing this data...</option>
                {COMPANY_OPTIONS.map(company => (
                  <option key={company} value={company}>{company}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Select the company that provided this CSV file. This will be used to attribute the account reports.
              </p>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CSV File *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  disabled={isProcessing}
                  className="hidden"
                  id="csv-file-input"
                />
                <label
                  htmlFor="csv-file-input"
                  className={`cursor-pointer ${isProcessing ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    {selectedFile ? selectedFile.name : 'Choose CSV file'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Click to browse or drag and drop your CSV file here
                  </p>
                </label>
              </div>
            </div>

            {/* CSV Preview */}
            {previewData && previewData.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Preview (first 3 rows)</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto max-h-48">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          {Object.keys(previewData[0]).map(header => (
                            <th key={header} className="px-3 py-2 text-left font-medium text-gray-700 border-b">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.map((row, index) => (
                          <tr key={index} className="border-b border-gray-100">
                            {Object.values(row).map((value: any, cellIndex) => (
                              <td key={cellIndex} className="px-3 py-2 text-gray-900">
                                {String(value).substring(0, 50)}
                                {String(value).length > 50 ? '...' : ''}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Expected Format Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Expected CSV Format</p>
                  <p className="text-xs text-blue-700 mt-1">
                    The CSV should contain columns for: Business Name, Owner Name, Bank Name, Bank Account Name, 
                    Bank Account Routing, Bank Account Number, Bank Account Type, Is Main Account, Is Default Account
                  </p>
                  <p className="text-xs text-blue-700 mt-2">
                    <strong>Important:</strong> Accounts with "Is Default Account" = TRUE will be flagged as risk accounts. 
                    Accounts with "Is Default Account" = FALSE will be marked as associated accounts.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={handleClose}
              disabled={isProcessing}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            
            <button
              onClick={handleImport}
              disabled={isProcessing || !selectedFile || !selectedCompany}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  <span>Import Accounts</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}