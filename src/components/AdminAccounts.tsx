import React, { useState, useEffect, useRef } from 'react';
import { FileText, Search, AlertTriangle, Calendar, Building, Tag, Upload, Download, Trash2, CheckCircle, X, ChevronLeft, ChevronRight, FileUp } from 'lucide-react';
import { importBankAccountData, clearImportedData } from '../data/importBankAccounts';
import { ImportAccountsModal } from './ImportAccountsModal';

interface AccountRecord {
  id: string;
  routingNumber: string;
  accountNumberLast4: string;
  bankName: string;
  timesChecked: number;
  submissions: Array<{
    submittedBy: string;
    submittedDate: string;
    companyName: string;
    tags: string[];
    notes?: string;
  }>;
}

export function AdminAccounts() {
  const [accounts, setAccounts] = useState<AccountRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [accountsPerPage] = useState(10);

  // List of companies for the dropdown
  const companies = [
    'Loot',
    'Kabbage',
    'OnDeck',
    'Bluevine',
    'Fundbox',
    'Square Capital',
    'PayPal Working Capital',
    'Stripe Capital',
    'Funding Circle',
    'MyBankCheck'
  ];

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setIsLoading(true);
    
    try {
      // Load from localStorage (this is where the fraud accounts are stored)
      const saved = localStorage.getItem('bankcheck_account_database');
      if (saved) {
        const parsed = JSON.parse(saved);
        const accountsData = parsed.data || parsed; // Handle both formats
        if (accountsData) {
          const accountsArray = Object.entries(accountsData).map(([key, data]: [string, any]) => ({
            id: key,
            ...data,
          }));
          setAccounts(accountsArray);
        } else {
          setAccounts([]);
        }
      } else {
        setAccounts([]);
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
      setAccounts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImport = async (csvData: any[], companyName: string) => {
    try {
      console.log('Processing CSV import:', { csvData, companyName });
      
      // Instead of immediately importing, save to pending uploads
      saveToPendingUploads(csvData, companyName);
      
      setImportStatus('success');
      setStatusMessage(`Successfully submitted ${csvData.length} accounts for admin review from ${companyName}`);
      
      // Clear status after 5 seconds
      setTimeout(() => {
        setImportStatus('idle');
        setStatusMessage('');
        setShowImportModal(false);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 5000);
      
    } catch (error) {
      console.error('Import error:', error);
      setImportStatus('error');
      setStatusMessage('Failed to submit bank account data for review');
      
      // Clear status after 5 seconds
      setTimeout(() => {
        setImportStatus('idle');
        setStatusMessage('');
      }, 5000);
    } finally {
      setIsImporting(false);
    }
  };

  const saveToPendingUploads = (data: any[], companyName: string) => {
    try {
      // Get existing pending uploads
      const saved = localStorage.getItem('admin_pending_uploads');
      let pendingUploads = [];
      
      if (saved) {
        pendingUploads = JSON.parse(saved);
      }
      
      // Add new upload
      const newUpload = {
        id: 'upload_' + Date.now(),
        uploadDate: new Date().toISOString(),
        companyName: companyName,
        fileName: selectedFile?.name || 'accounts_import.csv',
        recordCount: data.length,
        status: 'pending',
        data: data
      };
      
      pendingUploads.push(newUpload);
      
      // Save back to localStorage
      localStorage.setItem('admin_pending_uploads', JSON.stringify(pendingUploads));
      
      console.log('Saved to pending uploads:', newUpload);
      
    } catch (error) {
      console.error('Error saving to pending uploads:', error);
      throw new Error('Failed to save upload for admin review');
    }
  };

  const handleClear = async () => {
    if (confirm('Are you sure you want to clear all imported bank account data? This cannot be undone.')) {
      try {
        clearImportedData();
        setImportStatus('success');
        setStatusMessage('Imported data cleared successfully');
        
        // Reload accounts to reflect the changes
        loadAccounts();
        
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

  const filteredAccounts = accounts.filter(account =>
    (account.routingNumber && typeof account.routingNumber === 'string' && account.routingNumber.includes(searchTerm)) ||
    (account.accountNumberLast4 && typeof account.accountNumberLast4 === 'string' && account.accountNumberLast4.includes(searchTerm)) ||
    (account.bankName && typeof account.bankName === 'string' && account.bankName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (account.submissions && Array.isArray(account.submissions) && account.submissions.some(sub => 
      sub.companyName && typeof sub.companyName === 'string' && sub.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

  // Pagination logic
  const indexOfLastAccount = currentPage * accountsPerPage;
  const indexOfFirstAccount = indexOfLastAccount - accountsPerPage;
  const currentAccounts = filteredAccounts.slice(indexOfFirstAccount, indexOfLastAccount);
  const totalPages = Math.ceil(filteredAccounts.length / accountsPerPage);

  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTagColor = (tag: string) => {
    const colors: Record<string, string> = {
      fraud: 'bg-red-100 text-red-800',
      default: 'bg-gray-100 text-gray-800',
      stacking: 'bg-orange-100 text-orange-800',
      fake_deposits: 'bg-pink-100 text-pink-800',
      associated_account: 'bg-blue-100 text-blue-800',
    };
    return colors[tag] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Reports</h2>
          <p className="text-gray-600">Manage reported accounts and fraud data</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading account reports...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Reports</h2>
          <p className="text-gray-600">Manage reported accounts and fraud data</p>
        </div>
        
        <button
          onClick={() => setShowImportModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <Upload className="h-4 w-4" />
          <span>Import Accounts</span>
        </button>
      </div>

      {/* Status Message */}
      {importStatus !== 'idle' && (
        <div className={`p-3 rounded-lg border ${
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

      {/* Search */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Search by routing number, account, bank, or reporting company..."
          />
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Reported Accounts ({filteredAccounts.length})
          </h3>
        </div>

        {filteredAccounts.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No accounts found' : 'No reported accounts yet'}
            </h3>
            <p className="text-gray-500">
              {searchTerm 
                ? 'Try adjusting your search criteria'
                : 'Reported accounts will appear here as users submit fraud reports'
              }
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reports
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Times Checked
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tags
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Report
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentAccounts.map((account) => {
                    const latestSubmission = account.submissions && account.submissions.length > 0 
                      ? account.submissions[account.submissions.length - 1] 
                      : null;
                    const allTags = account.submissions && Array.isArray(account.submissions)
                      ? [...new Set(account.submissions.flatMap(sub => sub.tags || []))]
                      : [];
                    
                    return (
                      <tr key={account.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ****{account.accountNumberLast4 || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            Routing: {account.routingNumber || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Building className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">{account.bankName || 'Unknown Bank'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {account.submissions?.length || 0} {(account.submissions?.length || 0) === 1 ? 'report' : 'reports'}
                          </div>
                          <div className="text-xs text-gray-500">
                            By: {account.submissions && Array.isArray(account.submissions)
                              ? [...new Set(account.submissions.map(sub => sub.companyName).filter(Boolean))].join(', ') || 'Unknown'
                              : 'Unknown'
                            }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {account.timesChecked || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {allTags.slice(0, 2).map((tag, index) => (
                              <span
                                key={index}
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTagColor(tag)}`}
                              >
                                <Tag className="h-3 w-3 mr-1" />
                                {tag.replace('_', ' ')}
                              </span>
                            ))}
                            {allTags.length > 2 && (
                              <span className="text-xs text-gray-500">+{allTags.length - 2} more</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            {latestSubmission?.submittedDate ? formatDate(latestSubmission.submittedDate) : 'N/A'}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstAccount + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastAccount, filteredAccounts.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredAccounts.length}</span> accounts
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show pages around current page
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => paginate(pageNum)}
                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Summary Stats */}
      {filteredAccounts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg border">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{filteredAccounts.length}</p>
                <p className="text-gray-600 text-sm">Total Reports</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {filteredAccounts.reduce((sum, acc) => sum + (acc.timesChecked || 0), 0)}
                </p>
                <p className="text-gray-600 text-sm">Total Checks</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-green-100 rounded-lg">
                <Building className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {[...new Set(filteredAccounts.map(acc => acc.bankName).filter(Boolean))].length}
                </p>
                <p className="text-gray-600 text-sm">Banks Involved</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Tag className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {[...new Set(filteredAccounts.flatMap(acc => 
                    acc.submissions && Array.isArray(acc.submissions) 
                      ? acc.submissions.flatMap(sub => sub.tags || [])
                      : []
                  ))].length}
                </p>
                <p className="text-gray-600 text-sm">Unique Tags</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      <ImportAccountsModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
      />
    </div>
  );
}