'use client';

import React, { useState, useEffect } from 'react';
import { Search, Calendar, AlertTriangle, CheckCircle, Clock, Eye, EyeOff, X, User, Building, CreditCard, Flag, Tag, Link, FileText, DollarSign } from 'lucide-react';
import { CheckResult } from '@/types';
import { mockCheckHistory } from '@/data/mockData';

interface CheckResultsProps {
  checkHistory?: CheckResult[];
}

// Available risk tags with colors - reordered as requested
const RISK_TAGS = [
  { id: 'fraud', label: 'Fraud', color: 'bg-red-100 text-red-800 border-red-300' },
  { id: 'default', label: 'Default', color: 'bg-gray-100 text-gray-800 border-gray-300' },
  { id: 'stacking', label: 'Stacking', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  { id: 'fake_deposits', label: 'Fake Deposits', color: 'bg-pink-100 text-pink-800 border-pink-300' },
  { id: 'bank_disconnected', label: 'Bank Disconnected', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { id: 'blocked_payments', label: 'Blocked Payments', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  { id: 'excessive_nsfs', label: 'Excessive NSFs', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  { id: 'associated_account', label: 'Associated Account', color: 'bg-orange-100 text-orange-800 border-orange-300' },
];

const getTagById = (tagId: string) => {
  return RISK_TAGS.find(tag => tag.id === tagId);
};

// More robust localStorage operations with error handling
const saveCheckHistory = (history: CheckResult[]) => {
  try {
    const dataToSave = {
      timestamp: Date.now(),
      version: '1.0',
      data: history
    };
    localStorage.setItem('bankcheck_check_history', JSON.stringify(dataToSave));
    console.log('Check history saved successfully:', history.length, 'items');
  } catch (error) {
    console.error('Failed to save check history:', error);
  }
};

const loadCheckHistory = (): CheckResult[] => {
  try {
    const saved = localStorage.getItem('bankcheck_check_history');
    if (!saved) {
      console.log('No saved check history found');
      return [];
    }

    const parsed = JSON.parse(saved);
    
    // Handle both old format (direct array) and new format (with metadata)
    if (Array.isArray(parsed)) {
      console.log('Loading check history (old format):', parsed.length, 'items');
      return parsed;
    } else if (parsed.data && Array.isArray(parsed.data)) {
      console.log('Loading check history (new format):', parsed.data.length, 'items');
      return parsed.data;
    } else {
      console.warn('Invalid check history format, returning empty array');
      return [];
    }
  } catch (error) {
    console.error('Failed to load check history:', error);
    return [];
  }
};

export function CheckResults({ checkHistory: propCheckHistory }: CheckResultsProps) {
  const [selectedCheck, setSelectedCheck] = useState<CheckResult | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [checkHistory, setCheckHistory] = useState<CheckResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load check history from props or localStorage for persistence
    const loadData = async () => {
      setIsLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let historyToUse: CheckResult[] = [];
      
      // Use prop data if provided, otherwise check localStorage
      if (propCheckHistory && propCheckHistory.length > 0) {
        console.log('Using prop check history:', propCheckHistory.length, 'items');
        historyToUse = propCheckHistory;
      } else {
        console.log('Loading check history from localStorage');
        const storedHistory = loadCheckHistory();
        if (storedHistory.length > 0) {
          historyToUse = storedHistory;
        } else {
          // Use mock data if nothing is available
          historyToUse = mockCheckHistory;
        }
      }
      
      setCheckHistory(historyToUse);
      setIsLoading(false);
    };

    loadData();
  }, [propCheckHistory]);

  // Save to localStorage whenever checkHistory changes (but only if it has data)
  useEffect(() => {
    if (checkHistory.length > 0) {
      console.log('Saving check history to localStorage:', checkHistory.length, 'items');
      saveCheckHistory(checkHistory);
    }
  }, [checkHistory]);

  // Add a method to manually refresh from localStorage
  const refreshFromStorage = () => {
    const stored = loadCheckHistory();
    console.log('Manual refresh from storage:', stored.length, 'items');
    setCheckHistory(stored);
  };

  // Expose refresh function for debugging
  useEffect(() => {
    (window as any).refreshCheckHistory = refreshFromStorage;
    return () => {
      delete (window as any).refreshCheckHistory;
    };
  }, []);

  const handleViewDetails = (check: CheckResult) => {
    setSelectedCheck(check);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedCheck(null), 300);
  };

  const getStatusColor = (status: string) => {
    if (status === 'Flagged') return 'text-red-700 bg-red-100 border-red-300';
    if (status === 'Associated') return 'text-orange-700 bg-orange-100 border-orange-300';
    return 'text-green-700 bg-green-100 border-green-300';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'Flagged') return <AlertTriangle className="h-4 w-4" />;
    if (status === 'Associated') return <Link className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrencyDisplay = (value: string) => {
    if (!value) return '';
    
    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) return value;
    
    return numericValue.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };

  const totalChecks = checkHistory.length;
  const flaggedCount = checkHistory.filter(check => check.fraudStatus === 'Flagged').length;
  const associatedCount = checkHistory.filter(check => check.fraudStatus === 'Associated').length;
  const cleanCount = totalChecks - flaggedCount - associatedCount;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check History</h2>
          <p className="text-gray-600">View all your previous account check results and history</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your check history...</p>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Check History</h2>
            <p className="text-gray-600">View all your previous account check results and history</p>
          </div>
          
          {/* Debug info and refresh button - only show in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-right">
              <button
                onClick={refreshFromStorage}
                className="text-xs text-gray-500 hover:text-gray-700 underline mb-1 block"
              >
                Refresh from Storage
              </button>
              <p className="text-xs text-gray-400">
                Items in memory: {checkHistory.length}
              </p>
              <p className="text-xs text-gray-400">
                Items in storage: {loadCheckHistory().length}
              </p>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {checkHistory.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg border">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Search className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{totalChecks}</p>
                  <p className="text-gray-600 text-sm">Total Checks</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-red-600">{flaggedCount}</p>
                  <p className="text-gray-600 text-sm">Flagged</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Link className="h-6 w-6 text-orange-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-orange-600">{associatedCount}</p>
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
                  <p className="text-2xl font-bold text-green-600">{cleanCount}</p>
                  <p className="text-gray-600 text-sm">Clean</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {checkHistory.length > 0 ? 'Recent Check History' : 'Account Check History'}
            </h3>
          </div>

          {checkHistory.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No account checks yet</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Start by performing your first account check from the Bank Check tab. Your results will appear here for easy tracking and review.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-blue-800">Getting Started</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Go to the Bank Check tab and enter a routing number and the last 4 digits of an account number to perform your first account check.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reports
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Times Checked
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {checkHistory.map((check) => (
                    <tr key={check.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {check.accountNumber}
                        </div>
                        <div className="text-xs text-gray-500">
                          Routing: {check.routingNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(check.fraudStatus)}`}>
                          {getStatusIcon(check.fraudStatus)}
                          <span className="ml-1">
                            {check.fraudStatus === 'Associated' ? 'Associated Account' : check.fraudStatus}
                          </span>
                        </span>
                        {/* Show tags if flagged or associated */}
                        {(check.fraudStatus === 'Flagged' || check.fraudStatus === 'Associated') && check.tags && check.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {check.tags.slice(0, 2).map((tagId, index) => {
                              const tag = getTagById(tagId);
                              if (!tag) return null;
                              return (
                                <span
                                  key={index}
                                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${tag.color}`}
                                >
                                  {tag.label}
                                </span>
                              );
                            })}
                            {check.tags.length > 2 && (
                              <span className="text-xs text-gray-500">+{check.tags.length - 2} more</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {check.fraudStatus === 'Associated' ? 'Associated' : 
                         check.flaggedCount ? `${check.flaggedCount} ${check.flaggedCount === 1 ? 'report' : 'reports'}` : 'None'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {check.timesChecked || 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(check.checkDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => handleViewDetails(check)}
                          className="text-blue-600 hover:text-blue-900 flex items-center space-x-1 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Side Drawer */}
      <div className={`fixed inset-0 z-50 ${isDrawerOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            isDrawerOpen ? 'opacity-50' : 'opacity-0'
          }`}
          onClick={closeDrawer}
        />
        
        {/* Drawer */}
        <div className={`absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          {selectedCheck && (
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Check Details</h2>
                  <p className="text-sm text-gray-600">Complete account check information</p>
                </div>
                <button
                  onClick={closeDrawer}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Status Overview */}
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Overview</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Status</p>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedCheck.fraudStatus)}`}>
                        {getStatusIcon(selectedCheck.fraudStatus)}
                        <span className="ml-1">
                          {selectedCheck.fraudStatus === 'Associated' ? 'Associated Account' : selectedCheck.fraudStatus}
                        </span>
                      </span>
                    </div>
                    {selectedCheck.flaggedCount && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Times Reported</p>
                        <p className="text-lg font-semibold text-red-600">{selectedCheck.flaggedCount}</p>
                      </div>
                    )}
                    {selectedCheck.timesChecked && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Times Checked</p>
                        <p className="text-lg font-semibold text-blue-600">{selectedCheck.timesChecked}</p>
                      </div>
                    )}
                    {selectedCheck.lastFlaggedDate && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Last Reported</p>
                        <p className="text-sm font-medium text-gray-900">{formatFullDate(selectedCheck.lastFlaggedDate)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Default Balance */}
                {selectedCheck.defaultBalance && (
                  <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                    <div className="flex items-center space-x-2 mb-4">
                      <DollarSign className="h-5 w-5 text-red-600" />
                      <h3 className="text-lg font-semibold text-red-800">Default Balance Information</h3>
                    </div>
                    <div className="bg-red-100 border border-red-300 rounded-lg p-4">
                      <p className="text-red-800 font-semibold text-lg">
                        Default Amount: ${formatCurrencyDisplay(selectedCheck.defaultBalance)}
                      </p>
                      <p className="text-red-700 text-sm mt-2">
                        This is the amount that was defaulted on by the account holder. This information helps assess the financial risk associated with this account.
                      </p>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedCheck.notes && (
                  <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                    <div className="flex items-center space-x-2 mb-4">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-blue-800">Additional Notes</h3>
                    </div>
                    <div className="bg-blue-100 border border-blue-300 rounded-lg p-4">
                      <p className="text-blue-800 text-sm leading-relaxed">
                        {selectedCheck.notes}
                      </p>
                    </div>
                    <p className="text-blue-700 text-xs mt-2">
                      These notes were provided by the reporting institutions to give additional context about this account.
                    </p>
                  </div>
                )}

                {/* Associated Account Warning */}
                {selectedCheck.fraudStatus === 'Associated' && selectedCheck.associatedFraudAccount && (
                  <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
                    <div className="flex items-center space-x-2 mb-4">
                      <Link className="h-5 w-5 text-orange-600" />
                      <h3 className="text-lg font-semibold text-orange-800">⚠️ Associated Account Warning</h3>
                    </div>
                    <p className="text-orange-700 mb-4">
                      This account is associated with a flagged account that has been reported to our database.
                    </p>
                    <div className="bg-orange-100 border border-orange-300 rounded-lg p-4">
                      <h4 className="font-medium text-orange-800 mb-2">Associated Flagged Account:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-orange-700">Bank:</span>
                          <span className="font-medium text-orange-900 ml-2">{selectedCheck.associatedFraudAccount.bankName}</span>
                        </div>
                        <div>
                          <span className="text-orange-700">Account:</span>
                          <span className="font-medium text-orange-900 ml-2">****{selectedCheck.associatedFraudAccount.accountNumberLast4}</span>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-orange-700">Reported by:</span>
                          <span className="font-medium text-orange-900 ml-2">{selectedCheck.associatedFraudAccount.reportedBy.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Risk Tags */}
                {(selectedCheck.fraudStatus === 'Flagged' || selectedCheck.fraudStatus === 'Associated') && selectedCheck.tags && selectedCheck.tags.length > 0 && (
                  <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
                    <div className="flex items-center space-x-2 mb-4">
                      <Tag className="h-5 w-5 text-orange-600" />
                      <h3 className="text-lg font-semibold text-orange-800">
                        {selectedCheck.fraudStatus === 'Associated' ? 'Account Type' : 'Risk Tags'}
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedCheck.tags.map((tagId, index) => {
                        const tag = getTagById(tagId);
                        if (!tag) return null;
                        return (
                          <span
                            key={index}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${tag.color}`}
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag.label}
                          </span>
                        );
                      })}
                    </div>
                    <p className="text-sm text-orange-700 mt-3">
                      {selectedCheck.fraudStatus === 'Associated' 
                        ? 'This account is marked as associated with a flagged account.'
                        : 'These tags indicate the specific types of risks associated with this account.'
                      }
                    </p>
                  </div>
                )}

                {/* Flagged By Companies */}
                {selectedCheck.fraudStatus === 'Flagged' && selectedCheck.flaggedBy && (
                  <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <div className="flex items-center space-x-2 mb-4">
                      <Flag className="h-5 w-5 text-gray-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Reported By</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedCheck.flaggedBy.map((company, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200"
                        >
                          {company}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 mt-3">
                      This account has been reported {selectedCheck.flaggedBy.length} {selectedCheck.flaggedBy.length === 1 ? 'time' : 'times'} by financial institutions for risky activity.
                    </p>
                  </div>
                )}

                {/* Basic Check Information */}
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <div className="flex items-center space-x-2 mb-4">
                    <CreditCard className="h-5 w-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Check Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Routing Number</p>
                      <p className="font-medium text-gray-900">{selectedCheck.routingNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Account Number</p>
                      <p className="font-medium text-gray-900">{selectedCheck.accountNumber}</p>
                      <p className="text-xs text-gray-500 mt-1">Last 4 digits only (compliance)</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Bank Name</p>
                      <p className="font-medium text-gray-900">{selectedCheck.bankName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Check Date</p>
                      <p className="font-medium text-gray-900">{formatDate(selectedCheck.checkDate)}</p>
                    </div>
                  </div>
                </div>

                {/* Customer Details - Simplified without phone/email */}
                {selectedCheck.customerDetails && (
                  <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <div className="flex items-center space-x-2 mb-4">
                      <User className="h-5 w-5 text-gray-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Customer Details</h3>
                    </div>
                    
                    {/* Personal Information */}
                    <div className="mb-6">
                      <h4 className="text-md font-medium text-gray-800 mb-3">Personal Information</h4>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Full Name</p>
                          <p className="font-medium text-gray-900">{selectedCheck.customerDetails.personName}</p>
                        </div>
                      </div>
                    </div>

                    {/* Business Information */}
                    {(selectedCheck.customerDetails.businessName || 
                      selectedCheck.customerDetails.businessAddress) && (
                      <div>
                        <h4 className="text-md font-medium text-gray-800 mb-3">Business Information</h4>
                        <div className="grid grid-cols-1 gap-4">
                          {selectedCheck.customerDetails.businessName && (
                            <div>
                              <p className="text-sm text-gray-600">Business Name</p>
                              <p className="font-medium text-gray-900">{selectedCheck.customerDetails.businessName}</p>
                            </div>
                          )}
                          {selectedCheck.customerDetails.businessAddress && (
                            <div>
                              <p className="text-sm text-gray-600">Business Address</p>
                              <p className="font-medium text-gray-900">{selectedCheck.customerDetails.businessAddress}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Recommendation */}
                <div className={`p-6 rounded-lg border-l-4 ${
                  selectedCheck.fraudStatus === 'Flagged'
                    ? 'bg-red-50 border-red-400' 
                    : selectedCheck.fraudStatus === 'Associated'
                    ? 'bg-orange-50 border-orange-400'
                    : 'bg-green-50 border-green-400'
                }`}>
                  <h4 className={`font-semibold mb-2 ${
                    selectedCheck.fraudStatus === 'Flagged' ? 'text-red-800' : 
                    selectedCheck.fraudStatus === 'Associated' ? 'text-orange-800' : 'text-green-800'
                  }`}>
                    Recommendation
                  </h4>
                  <p className={`text-sm ${
                    selectedCheck.fraudStatus === 'Flagged' ? 'text-red-700' : 
                    selectedCheck.fraudStatus === 'Associated' ? 'text-orange-700' : 'text-green-700'
                  }`}>
                    {selectedCheck.fraudStatus === 'Flagged'
                      ? `⚠️ HIGH RISK: Exercise extreme caution with this account. It has been reported ${selectedCheck.flaggedCount} ${selectedCheck.flaggedCount === 1 ? 'time' : 'times'} for risky activity${selectedCheck.timesChecked ? ` and has been checked ${selectedCheck.timesChecked} times by various institutions` : ''}. ${selectedCheck.defaultBalance ? `Previous default amount: $${formatCurrencyDisplay(selectedCheck.defaultBalance)}.` : ''} Immediate investigation and verification required before proceeding.`
                      : selectedCheck.fraudStatus === 'Associated'
                      ? `⚠️ CAUTION: This account is associated with a flagged account. While not directly reported as risky, exercise additional caution and consider enhanced verification procedures${selectedCheck.timesChecked ? `. This account has been checked ${selectedCheck.timesChecked} times` : ''}.`
                      : `✅ LOW RISK: Account appears legitimate and safe to process. No risk indicators detected in our database${selectedCheck.timesChecked ? `. This account has been checked ${selectedCheck.timesChecked} times with no issues reported` : ''}.`
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}