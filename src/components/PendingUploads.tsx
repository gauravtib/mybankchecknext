'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Search, AlertTriangle, Calendar, Building, Tag, CheckCircle, X, ChevronLeft, ChevronRight, Eye, Check } from 'lucide-react';

interface PendingUpload {
  id: string;
  uploadDate: string;
  companyName: string;
  fileName: string;
  recordCount: number;
  status: 'pending' | 'approved' | 'rejected';
  data: any[];
}

export function PendingUploads() {
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUpload, setSelectedUpload] = useState<PendingUpload | null>(null);
  const [showUploadDetails, setShowUploadDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState<'success' | 'error' | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    loadPendingUploads();
  }, []);

  const loadPendingUploads = async () => {
    setIsLoading(true);
    
    try {
      // In a real implementation, this would be an API call to fetch pending uploads
      // For demo purposes, we'll use localStorage
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('admin_pending_uploads');
        if (saved) {
          const parsed = JSON.parse(saved);
          setPendingUploads(parsed);
        } else {
          // Initialize with empty array
          setPendingUploads([]);
        }
      } else {
        setPendingUploads([]);
      }
    } catch (error) {
      console.error('Error loading pending uploads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveUpload = async (uploadId: string) => {
    setProcessingAction(uploadId);
    setActionStatus(null);
    
    try {
      // Find the upload to approve
      const upload = pendingUploads.find(u => u.id === uploadId);
      if (!upload) {
        throw new Error('Upload not found');
      }
      
      // In a real implementation, this would be an API call to approve the upload
      // For demo purposes, we'll simulate the process
      
      // 1. Get the current account database
      const accountDatabase = getAccountDatabase();
      
      // 2. Process the upload data and add to the database
      let processedCount = 0;
      let defaultCount = 0;
      let associatedCount = 0;
      
      // Group accounts by business and owner to link associated accounts
      const businessGroups: { [key: string]: any[] } = {};
      
      upload.data.forEach(record => {
        const groupKey = `${record.businessName}-${record.ownerName}`;
        if (!businessGroups[groupKey]) {
          businessGroups[groupKey] = [];
        }
        businessGroups[groupKey].push(record);
      });
      
      // Process each business group
      Object.entries(businessGroups).forEach(([groupKey, records]) => {
        // Find the default accounts - properly handle different formats of boolean values
        const defaultAccounts = records.filter(r => {
          // Check various formats of boolean values
          const isDefault = r.isDefaultAccount;
          if (typeof isDefault === 'boolean') {
            return isDefault;
          } else if (typeof isDefault === 'string') {
            const lowerValue = isDefault.toLowerCase().trim();
            return lowerValue === 'true' || lowerValue === 'yes' || lowerValue === '1' || lowerValue === 't' || lowerValue === 'y';
          }
          return false;
        });
        
        const associatedAccounts = records.filter(r => {
          // Check various formats of boolean values
          const isDefault = r.isDefaultAccount;
          if (typeof isDefault === 'boolean') {
            return !isDefault;
          } else if (typeof isDefault === 'string') {
            const lowerValue = isDefault.toLowerCase().trim();
            return !(lowerValue === 'true' || lowerValue === 'yes' || lowerValue === '1' || lowerValue === 't' || lowerValue === 'y');
          }
          return true; // If isDefaultAccount is not defined, treat as associated
        });
        
        console.log(`Group ${groupKey}:`, {
          totalRecords: records.length,
          defaultAccounts: defaultAccounts.length,
          associatedAccounts: associatedAccounts.length
        });
        
        // Process default accounts
        defaultAccounts.forEach(defaultAccount => {
          if (defaultAccount.bankAccountRouting && defaultAccount.bankAccountRouting !== '-') {
            const routingNumber = defaultAccount.bankAccountRouting;
            // Get last 4 digits of account number, handling different formats
            let accountLast4;
            if (defaultAccount.bankAccountNumber) {
              if (defaultAccount.bankAccountNumber.startsWith('****')) {
                accountLast4 = defaultAccount.bankAccountNumber.slice(4);
              } else {
                accountLast4 = defaultAccount.bankAccountNumber.slice(-4);
              }
            } else {
              accountLast4 = '0000'; // Fallback
            }
            
            const accountKey = `${routingNumber}-${accountLast4}`;
            const bankName = defaultAccount.bankName || 'Unknown Bank';
            
            // Get fraud tags based on business type
            const fraudTags = ['fraud', 'default'];
            
            // Generate notes
            const notes = `Imported from ${upload.companyName} CSV upload. Business: ${defaultAccount.businessName}. Owner: ${defaultAccount.ownerName}.`;
            
            // Create main fraudulent account submission
            const mainSubmission = {
              submittedBy: `admin@mybankcheck.com`,
              submittedDate: new Date().toISOString(),
              companyName: upload.companyName,
              reporterEmail: `admin@mybankcheck.com`,
              accountHolderName: defaultAccount.bankAccountName || defaultAccount.ownerName,
              tags: fraudTags,
              notes: notes,
            };
            
            // Add or update main account in database
            if (accountDatabase[accountKey]) {
              // Account exists, add this submission
              accountDatabase[accountKey].submissions.push(mainSubmission);
              accountDatabase[accountKey].timesChecked += 1;
            } else {
              // New account
              accountDatabase[accountKey] = {
                routingNumber,
                accountNumberLast4: accountLast4,
                bankName,
                timesChecked: 1,
                submissions: [mainSubmission]
              };
            }
            
            processedCount++;
            defaultCount++;
          }
        });
        
        // Process associated accounts
        associatedAccounts.forEach(assocAccount => {
          if (assocAccount.bankAccountRouting && assocAccount.bankAccountRouting !== '-') {
            const assocRoutingNumber = assocAccount.bankAccountRouting;
            // Get last 4 digits of account number, handling different formats
            let assocAccountLast4;
            if (assocAccount.bankAccountNumber) {
              if (assocAccount.bankAccountNumber.startsWith('****')) {
                assocAccountLast4 = assocAccount.bankAccountNumber.slice(4);
              } else {
                assocAccountLast4 = assocAccount.bankAccountNumber.slice(-4);
              }
            } else {
              assocAccountLast4 = '0000'; // Fallback
            }
            
            const assocAccountKey = `${assocRoutingNumber}-${assocAccountLast4}`;
            const assocBankName = assocAccount.bankName || 'Unknown Bank';
            
            // Find a default account to associate with
            const defaultAccount = defaultAccounts.length > 0 ? defaultAccounts[0] : null;
            let associatedWithKey = '';
            
            if (defaultAccount && defaultAccount.bankAccountRouting && defaultAccount.bankAccountRouting !== '-') {
              const defaultRoutingNumber = defaultAccount.bankAccountRouting;
              let defaultAccountLast4;
              if (defaultAccount.bankAccountNumber) {
                if (defaultAccount.bankAccountNumber.startsWith('****')) {
                  defaultAccountLast4 = defaultAccount.bankAccountNumber.slice(4);
                } else {
                  defaultAccountLast4 = defaultAccount.bankAccountNumber.slice(-4);
                }
              } else {
                defaultAccountLast4 = '0000'; // Fallback
              }
              associatedWithKey = `${defaultRoutingNumber}-${defaultAccountLast4}`;
            }
            
            // Create associated account submission
            const assocSubmission = {
              submittedBy: `admin@mybankcheck.com`,
              submittedDate: new Date().toISOString(),
              companyName: upload.companyName,
              reporterEmail: `admin@mybankcheck.com`,
              accountHolderName: assocAccount.bankAccountName || assocAccount.ownerName,
              tags: ['associated_account'],
              notes: `Associated account linked to ${defaultAccount ? `flagged business: ${defaultAccount.businessName}. Owner: ${defaultAccount.ownerName}` : 'business group'}.`,
              isAssociated: true,
              associatedWith: associatedWithKey
            };
            
            // Add or update associated account in database
            if (accountDatabase[assocAccountKey]) {
              // Account exists, add this submission
              accountDatabase[assocAccountKey].submissions.push(assocSubmission);
              accountDatabase[assocAccountKey].timesChecked += 1;
            } else {
              // New associated account
              accountDatabase[assocAccountKey] = {
                routingNumber: assocRoutingNumber,
                accountNumberLast4: assocAccountLast4,
                bankName: assocBankName,
                timesChecked: 1,
                submissions: [assocSubmission],
                isAssociated: true,
                associatedWith: associatedWithKey
              };
            }
            
            processedCount++;
            associatedCount++;
          }
        });
      });
      
      // 3. Save the updated database
      saveAccountDatabase(accountDatabase);
      
      // 4. Update the upload status
      const updatedUploads = pendingUploads.map(u => 
        u.id === uploadId ? { ...u, status: 'approved' as const } : u
      );
      setPendingUploads(updatedUploads);
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_pending_uploads', JSON.stringify(updatedUploads));
      }
      
      // 5. Show success message
      setActionStatus('success');
      setStatusMessage(`Successfully processed ${processedCount} accounts (${defaultCount} default, ${associatedCount} associated) from ${upload.companyName}`);
      
      // 6. Clear status after 5 seconds
      setTimeout(() => {
        setActionStatus(null);
        setStatusMessage('');
      }, 5000);
      
    } catch (error) {
      console.error('Error approving upload:', error);
      setActionStatus('error');
      setStatusMessage(`Failed to approve upload: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Clear status after 5 seconds
      setTimeout(() => {
        setActionStatus(null);
        setStatusMessage('');
      }, 5000);
    } finally {
      setProcessingAction(null);
    }
  };

  const handleRejectUpload = async (uploadId: string) => {
    setProcessingAction(uploadId);
    setActionStatus(null);
    
    try {
      // In a real implementation, this would be an API call to reject the upload
      // For demo purposes, we'll just update the local state
      
      // Update the upload status
      const updatedUploads = pendingUploads.map(u => 
        u.id === uploadId ? { ...u, status: 'rejected' as const } : u
      );
      setPendingUploads(updatedUploads);
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_pending_uploads', JSON.stringify(updatedUploads));
      }
      
      // Show success message
      setActionStatus('success');
      setStatusMessage('Upload rejected successfully');
      
      // Clear status after 5 seconds
      setTimeout(() => {
        setActionStatus(null);
        setStatusMessage('');
      }, 5000);
      
    } catch (error) {
      console.error('Error rejecting upload:', error);
      setActionStatus('error');
      setStatusMessage(`Failed to reject upload: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Clear status after 5 seconds
      setTimeout(() => {
        setActionStatus(null);
        setStatusMessage('');
      }, 5000);
    } finally {
      setProcessingAction(null);
    }
  };

  const handleViewUploadDetails = (upload: PendingUpload) => {
    setSelectedUpload(upload);
    setShowUploadDetails(true);
  };

  const closeUploadDetails = () => {
    setShowUploadDetails(false);
    setTimeout(() => setSelectedUpload(null), 300);
  };

  // Get account database functions (copied from ManualFraudCheck.tsx)
  const getAccountDatabase = (): Record<string, any> => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('bankcheck_account_database');
        if (saved) {
          const parsed = JSON.parse(saved);
          return parsed.data || parsed || {};
        }
      }
      return {};
    } catch (error) {
      console.error('Error parsing account database:', error);
      return {};
    }
  };

  const saveAccountDatabase = (database: Record<string, any>): void => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('bankcheck_account_database', JSON.stringify({
          timestamp: Date.now(),
          version: '1.0',
          data: database
        }));
      }
    } catch (error) {
      console.error('Error saving account database:', error);
    }
  };

  // Filter and pagination logic
  const filteredUploads = pendingUploads.filter(upload =>
    upload.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    upload.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUploads.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUploads.length / itemsPerPage);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Function to determine if a value is considered "true" in various formats
  const isTrueValue = (value: any): boolean => {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase().trim();
      return lowerValue === 'true' || lowerValue === 'yes' || lowerValue === '1' || lowerValue === 't' || lowerValue === 'y';
    }
    return false;
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pending Uploads</h2>
          <p className="text-gray-600">Review and approve account uploads from customers</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading pending uploads...</p>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Pending Uploads</h2>
            <p className="text-gray-600">Review and approve account uploads from customers</p>
          </div>
        </div>

        {/* Status Message */}
        {actionStatus && (
          <div className={`p-4 rounded-lg border ${
            actionStatus === 'success' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center space-x-2">
              {actionStatus === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              )}
              <span className={`font-medium ${
                actionStatus === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {statusMessage}
              </span>
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
              placeholder="Search by company or filename..."
            />
          </div>
        </div>

        {/* Uploads Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Pending Customer Uploads ({filteredUploads.length})
            </h3>
          </div>

          {filteredUploads.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No uploads found' : 'No pending uploads'}
              </h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? 'Try adjusting your search criteria'
                  : 'Customer uploads will appear here for your review'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      File
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Records
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Default Accounts
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Upload Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.map((upload) => {
                    // Count default accounts
                    const defaultAccountCount = upload.data.filter(record => 
                      isTrueValue(record.isDefaultAccount)
                    ).length;
                    
                    return (
                      <tr key={upload.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Building className="h-4 w-4 text-gray-400 mr-2" />
                            <div className="text-sm font-medium text-gray-900">{upload.companyName}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-gray-400 mr-2" />
                            <div className="text-sm text-gray-900">{upload.fileName}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {upload.recordCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                            <span className="text-sm font-medium text-red-600">{defaultAccountCount}</span>
                            <span className="text-sm text-gray-500 ml-1">/ {upload.recordCount}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(upload.uploadDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {upload.status === 'pending' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-300">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Pending Review
                            </span>
                          ) : upload.status === 'approved' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approved
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-300">
                              <X className="h-3 w-3 mr-1" />
                              Rejected
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleViewUploadDetails(upload)}
                              className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                            >
                              <Eye className="h-4 w-4" />
                              <span>View</span>
                            </button>
                            
                            {upload.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApproveUpload(upload.id)}
                                  disabled={processingAction === upload.id}
                                  className="text-green-600 hover:text-green-900 flex items-center space-x-1 disabled:opacity-50"
                                >
                                  {processingAction === upload.id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                                  ) : (
                                    <Check className="h-4 w-4" />
                                  )}
                                  <span>Approve</span>
                                </button>
                                
                                <button
                                  onClick={() => handleRejectUpload(upload.id)}
                                  disabled={processingAction === upload.id}
                                  className="text-red-600 hover:text-red-900 flex items-center space-x-1 disabled:opacity-50"
                                >
                                  {processingAction === upload.id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                  ) : (
                                    <X className="h-4 w-4" />
                                  )}
                                  <span>Reject</span>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, filteredUploads.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredUploads.length}</span> uploads
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                        onClick={() => setCurrentPage(pageNum)}
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
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upload Details Drawer */}
      <div className={`fixed inset-0 z-50 ${showUploadDetails ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            showUploadDetails ? 'opacity-50' : 'opacity-0'
          }`}
          onClick={closeUploadDetails}
        />
        
        {/* Drawer */}
        <div className={`absolute right-0 top-0 h-full w-full max-w-4xl bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
          showUploadDetails ? 'translate-x-0' : 'translate-x-full'
        }`}>
          {selectedUpload && (
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Upload Details</h2>
                  <p className="text-sm text-gray-600">Review account data before approval</p>
                </div>
                <button
                  onClick={closeUploadDetails}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Upload Info */}
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">Upload Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-blue-700 mb-1">Company</p>
                      <p className="font-medium text-blue-900">{selectedUpload.companyName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-700 mb-1">File Name</p>
                      <p className="font-medium text-blue-900">{selectedUpload.fileName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-700 mb-1">Record Count</p>
                      <p className="font-medium text-blue-900">{selectedUpload.recordCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-700 mb-1">Upload Date</p>
                      <p className="font-medium text-blue-900">{formatDate(selectedUpload.uploadDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-700 mb-1">Status</p>
                      <div>
                        {selectedUpload.status === 'pending' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-300">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Pending Review
                          </span>
                        ) : selectedUpload.status === 'approved' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-300">
                            <X className="h-3 w-3 mr-1" />
                            Rejected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Data Preview */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Account Data Preview</h3>
                    <p className="text-sm text-gray-600">Showing {Math.min(10, selectedUpload.data.length)} of {selectedUpload.data.length} records</p>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          {Object.keys(selectedUpload.data[0]).map(header => (
                            <th key={header} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {header}
                            </th>
                          ))}
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedUpload.data.slice(0, 10).map((record, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            {Object.entries(record).map(([key, value]: [string, any], i) => (
                              <td key={i} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                                {key === 'isDefaultAccount' && (
                                  <span className="ml-2 text-xs">
                                    ({isTrueValue(value) ? 'TRUE' : 'FALSE'})
                                  </span>
                                )}
                              </td>
                            ))}
                            <td className="px-4 py-3 whitespace-nowrap">
                              {isTrueValue(record.isDefaultAccount) ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-300">
                                  Flagged
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-300">
                                  Associated
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {selectedUpload.data.length > 10 && (
                    <div className="p-4 text-center text-sm text-gray-500 border-t border-gray-200">
                      Showing 10 of {selectedUpload.data.length} records. Approve to process all records.
                    </div>
                  )}
                </div>

                {/* Data Quality Analysis */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Quality Analysis</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-gray-900">Valid Routing Numbers</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {selectedUpload.data.filter(d => d.bankAccountRouting && d.bankAccountRouting.length === 9 && d.bankAccountRouting !== '-').length} of {selectedUpload.data.length}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-gray-900">Valid Account Numbers</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {selectedUpload.data.filter(d => d.bankAccountNumber && d.bankAccountNumber.length >= 4 && d.bankAccountNumber !== '-').length} of {selectedUpload.data.length}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                        <span className="text-sm font-medium text-gray-900">Default Accounts</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {selectedUpload.data.filter(d => isTrueValue(d.isDefaultAccount)).length} of {selectedUpload.data.length}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-gray-900">Associated Accounts</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {selectedUpload.data.filter(d => !isTrueValue(d.isDefaultAccount)).length} of {selectedUpload.data.length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Warning */}
                <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Important: Review Before Approval</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Once approved, these accounts will be added to the main database and will be visible to all users during account checks. 
                        Please verify the data quality and ensure it meets our standards before approving.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              {selectedUpload.status === 'pending' && (
                <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between">
                  <button
                    onClick={() => handleRejectUpload(selectedUpload.id)}
                    disabled={processingAction === selectedUpload.id}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    {processingAction === selectedUpload.id ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <X className="h-5 w-5" />
                        <span>Reject Upload</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleApproveUpload(selectedUpload.id)}
                    disabled={processingAction === selectedUpload.id}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    {processingAction === selectedUpload.id ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-5 w-5" />
                        <span>Approve & Process</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}