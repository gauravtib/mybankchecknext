import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Upload, Eye, AlertTriangle, CheckCircle, Calendar, Building, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { ImportAccountsModal } from './ImportAccountsModal';

interface Account {
  id: string;
  businessName: string;
  ownerName: string;
  bankName: string;
  bankAccountName: string;
  routingNumber: string;
  accountNumber: string;
  accountType: string;
  isMainAccount: boolean;
  isDefaultAccount: boolean;
  reportedBy: string;
  reportedDate: string;
  status: 'flagged' | 'associated' | 'clean';
}

interface AccountsPageProps {
  accounts?: Account[];
  onAccountsUpdate?: (accounts: Account[]) => void;
}

const ITEMS_PER_PAGE = 25;

export function AccountsPage({ accounts: propAccounts, onAccountsUpdate }: AccountsPageProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'flagged' | 'associated' | 'clean'>('all');
  const [showImportModal, setShowImportModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Load accounts from props or localStorage
  useEffect(() => {
    const loadAccounts = () => {
      setIsLoading(true);
      
      if (propAccounts && propAccounts.length > 0) {
        setAccounts(propAccounts);
      } else {
        // Load from localStorage or use demo data
        const savedAccounts = localStorage.getItem('admin_accounts_data');
        if (savedAccounts) {
          try {
            const parsed = JSON.parse(savedAccounts);
            setAccounts(parsed);
          } catch (error) {
            console.error('Error parsing saved accounts:', error);
            setAccounts([]);
          }
        } else {
          setAccounts([]);
        }
      }
      
      setIsLoading(false);
    };

    loadAccounts();
  }, [propAccounts]);

  // Filter accounts based on search and status
  useEffect(() => {
    let filtered = accounts;

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(account =>
        account.businessName.toLowerCase().includes(term) ||
        account.ownerName.toLowerCase().includes(term) ||
        account.bankName.toLowerCase().includes(term) ||
        account.routingNumber.includes(term) ||
        account.accountNumber.includes(term) ||
        account.reportedBy.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(account => account.status === statusFilter);
    }

    setFilteredAccounts(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [accounts, searchTerm, statusFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAccounts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentAccounts = filteredAccounts.slice(startIndex, endIndex);

  const handleImportAccounts = async (csvData: any[], companyName: string) => {
    try {
      console.log('Processing CSV import:', { csvData, companyName });
      
      const processedAccounts: Account[] = csvData.map((row, index) => {
        // Determine status based on "Is Default Account" field
        let status: 'flagged' | 'associated' | 'clean' = 'clean';
        
        const isDefaultAccount = String(row['Is Default Account']).toLowerCase() === 'true';
        const isMainAccount = String(row['Is Main Account']).toLowerCase() === 'true';
        
        if (isDefaultAccount) {
          status = 'flagged';
        } else if (!isMainAccount) {
          status = 'associated';
        }

        return {
          id: `import-${Date.now()}-${index}`,
          businessName: row['Business Name'] || '',
          ownerName: row['Owner Name'] || '',
          bankName: row['Bank Name'] || '',
          bankAccountName: row['Bank Account Name'] || '',
          routingNumber: row['Bank Account Routing'] || '',
          accountNumber: row['Bank Account Number'] || '',
          accountType: row['Bank Account Type'] || '',
          isMainAccount: isMainAccount,
          isDefaultAccount: isDefaultAccount,
          reportedBy: companyName,
          reportedDate: new Date().toISOString(),
          status: status
        };
      });

      console.log('Processed accounts:', processedAccounts);

      // Update accounts state
      const updatedAccounts = [...accounts, ...processedAccounts];
      setAccounts(updatedAccounts);

      // Save to localStorage
      localStorage.setItem('admin_accounts_data', JSON.stringify(updatedAccounts));

      // Notify parent component
      if (onAccountsUpdate) {
        onAccountsUpdate(updatedAccounts);
      }

      console.log(`Successfully imported ${processedAccounts.length} accounts from ${companyName}`);
    } catch (error) {
      console.error('Error importing accounts:', error);
      throw new Error('Failed to process CSV data. Please check the file format.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'flagged':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-300">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Flagged
          </span>
        );
      case 'associated':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-300">
            <Eye className="h-3 w-3 mr-1" />
            Associated
          </span>
        );
      case 'clean':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Clean
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300">
            Unknown
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-700">
          Showing {startIndex + 1} to {Math.min(endIndex, filteredAccounts.length)} of {filteredAccounts.length} results
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          {pages.map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                page === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Bank Accounts</h2>
          <p className="text-gray-600">Manage and monitor bank account data</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading accounts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Bank Accounts</h2>
            <p className="text-gray-600">Manage and monitor bank account data</p>
          </div>
          
          <button
            onClick={() => setShowImportModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>Import Accounts</span>
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg border">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{accounts.length}</p>
                <p className="text-gray-600 text-sm">Total Accounts</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-red-600">
                  {accounts.filter(a => a.status === 'flagged').length}
                </p>
                <p className="text-gray-600 text-sm">Flagged</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Eye className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-orange-600">
                  {accounts.filter(a => a.status === 'associated').length}
                </p>
                <p className="text-gray-600 text-sm">Associated</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">
                  {accounts.filter(a => a.status === 'clean').length}
                </p>
                <p className="text-gray-600 text-sm">Clean</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search accounts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="flagged">Flagged</option>
                  <option value="associated">Associated</option>
                  <option value="clean">Clean</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Accounts Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Account Records ({filteredAccounts.length})
            </h3>
          </div>

          {currentAccounts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {accounts.length === 0 ? 'No accounts imported yet' : 'No accounts match your filters'}
              </h3>
              <p className="text-gray-500 mb-6">
                {accounts.length === 0 
                  ? 'Import a CSV file to start managing bank account data.'
                  : 'Try adjusting your search terms or filters.'
                }
              </p>
              {accounts.length === 0 && (
                <button
                  onClick={() => setShowImportModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 mx-auto"
                >
                  <Upload className="h-5 w-5" />
                  <span>Import Accounts</span>
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Business
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Owner
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bank Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Account
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reported By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentAccounts.map((account) => (
                      <tr key={account.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {account.businessName || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <div className="text-sm text-gray-900">
                              {account.ownerName || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {account.bankName || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            Routing: {account.routingNumber || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            ****{account.accountNumber ? account.accountNumber.slice(-4) : 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500 capitalize">
                            {account.accountType || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(account.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {account.reportedBy}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(account.reportedDate)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {renderPagination()}
            </>
          )}
        </div>
      </div>

      {/* Import Modal */}
      <ImportAccountsModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportAccounts}
      />
    </>
  );
}