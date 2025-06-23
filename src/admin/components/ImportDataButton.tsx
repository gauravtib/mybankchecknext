import React, { useState } from 'react';
import { Upload, Download, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { importBankAccountData, clearImportedData } from '../../data/importBankAccounts';

export function ImportDataButton() {
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleImport = async () => {
    setIsImporting(true);
    setImportStatus('idle');
    
    try {
      // Simulate import delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      importBankAccountData();
      
      setImportStatus('success');
      setStatusMessage('Successfully imported bank account data');
      
      // Clear status after 5 seconds
      setTimeout(() => {
        setImportStatus('idle');
        setStatusMessage('');
      }, 5000);
      
    } catch (error) {
      console.error('Import error:', error);
      setImportStatus('error');
      setStatusMessage('Failed to import bank account data');
      
      // Clear status after 5 seconds
      setTimeout(() => {
        setImportStatus('idle');
        setStatusMessage('');
      }, 5000);
    } finally {
      setIsImporting(false);
    }
  };

  const handleClear = async () => {
    if (confirm('Are you sure you want to clear all imported bank account data? This cannot be undone.')) {
      try {
        clearImportedData();
        setImportStatus('success');
        setStatusMessage('Imported data cleared successfully');
        
        // Clear status after 3 seconds
        setTimeout(() => {
          setImportStatus('idle');
          setStatusMessage('');
        }, 3000);
      } catch (error) {
        console.error('Clear error:', error);
        setImportStatus('error');
        setStatusMessage('Failed to clear imported data');
        
        // Clear status after 3 seconds
        setTimeout(() => {
          setImportStatus('idle');
          setStatusMessage('');
        }, 3000);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Upload className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Import Bank Account Data</h3>
          <p className="text-sm text-gray-600">Import fraudulent bank accounts from CSV data</p>
        </div>
      </div>

      {/* Status Message */}
      {importStatus !== 'idle' && (
        <div className={`mb-4 p-3 rounded-lg border ${
          importStatus === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center space-x-2">
            {importStatus === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <span className="text-sm font-medium">{statusMessage}</span>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Import Information</p>
              <p className="text-xs text-yellow-700 mt-1">
                This will import 400+ bank accounts from the provided CSV data. Accounts marked as "Is Default Account = TRUE" 
                will be flagged as fraudulent, while others will be marked as associated accounts.
              </p>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleImport}
            disabled={isImporting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            {isImporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Importing...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Import Data</span>
              </>
            )}
          </button>

          <button
            onClick={handleClear}
            disabled={isImporting}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear</span>
          </button>
        </div>

        <div className="text-xs text-gray-500">
          <p><strong>Data Structure:</strong></p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Default accounts (Is Default Account = TRUE) → Flagged as fraudulent</li>
            <li>Associated accounts (Is Default Account = FALSE) → Linked to main account</li>
            <li>Company and owner information preserved</li>
            <li>Only last 4 digits of account numbers stored (compliance)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}