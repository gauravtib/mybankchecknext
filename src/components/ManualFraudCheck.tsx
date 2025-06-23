import React, { useState } from 'react';
import { Search, AlertTriangle, CheckCircle, CreditCard, Building, Calendar, Flag, Users, Lock, Tag, Link, FileText, DollarSign } from 'lucide-react';
import { BankSelector } from './BankSelector';
import { getBankByName, getBankByRoutingNumber } from '../data/usBanks';

interface FraudResult {
  fraudStatus: 'Flagged' | 'Not Reported' | 'Associated';
  flaggedCount?: number;
  flaggedBy?: string[];
  lastFlaggedDate?: string;
  bankName?: string;
  timesChecked?: number;
  tags?: string[];
  associatedWith?: string;
  notes?: string;
  defaultBalance?: string;
  associatedFraudAccount?: {
    routingNumber: string;
    accountNumberLast4: string;
    bankName: string;
    reportedBy: string[];
  };
}

interface ManualFraudCheckProps {
  userAccount?: {
    checksUsed: number;
    checksLimit: number;
    plan: {
      id: string;
    };
  };
  onUpgrade?: () => void;
  onCheckPerformed?: () => void;
  onCheckResult?: (result: any) => void;
}

// Production account database - starts empty and gets populated when accounts are submitted
const getAccountDatabase = (): Record<string, {
  routingNumber: string;
  accountNumberLast4: string;
  submissions: Array<{
    submittedBy: string;
    submittedDate: string;
    companyName: string;
    reporterEmail: string;
    accountHolderName: string;
    tags: string[];
    notes?: string;
    defaultBalance?: string;
    isAssociated?: boolean;
    associatedWith?: string;
  }>;
  bankName: string;
  timesChecked: number;
  isAssociated?: boolean;
  associatedWith?: string;
}> => {
  // Load from localStorage to persist across sessions
  const saved = localStorage.getItem('bankcheck_account_database');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Return the data directly - no demo data in production
      return parsed.data || parsed || {};
    } catch (error) {
      console.error('Error parsing account database:', error);
    }
  }
  
  // Return empty database for production - no dummy data
  return {};
};

const saveAccountDatabase = (database: any) => {
  localStorage.setItem('bankcheck_account_database', JSON.stringify(database));
};

export function ManualFraudCheck({ userAccount, onUpgrade, onCheckPerformed, onCheckResult }: ManualFraudCheckProps) {
  const [activeTab, setActiveTab] = useState<'bank' | 'account' | 'name'>('bank');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<FraudResult | null>(null);
  
  // Account search form
  const [accountForm, setAccountForm] = useState({
    routingNumber: '',
    accountNumberLast4: '',
  });

  // Bank search form
  const [bankForm, setBankForm] = useState({
    bankName: '',
    routingNumber: '',
    accountNumberLast4: '',
  });

  // Name search form
  const [nameForm, setNameForm] = useState({
    accountHolderName: '',
  });

  // Default user account
  const defaultAccount = {
    checksUsed: 0,
    checksLimit: 10,
    plan: { id: 'free' }
  };

  const account = userAccount || defaultAccount;

  const isAtLimit = () => {
    return account.checksLimit !== -1 && account.checksUsed >= account.checksLimit;
  };

  const handleAccountFormChange = (field: string, value: string) => {
    setAccountForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBankFormChange = (field: string, value: string) => {
    setBankForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNameFormChange = (field: string, value: string) => {
    setNameForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBankSelection = (selectedBankName: string, selectedRoutingNumber?: string) => {
    setBankForm(prev => ({
      ...prev,
      bankName: selectedBankName,
      routingNumber: selectedRoutingNumber || prev.routingNumber
    }));
  };

  const getBankNameFromRouting = (routingNumber: string): string => {
    // First try to get from our bank database
    const bank = getBankByRoutingNumber(routingNumber);
    if (bank) {
      return bank.name;
    }
    
    // Fallback to generating realistic bank names based on routing number patterns
    const bankNames = [
      'Wells Fargo Bank',
      'JPMorgan Chase Bank', 
      'Bank of America',
      'U.S. Bank',
      'PNC Bank',
      'Capital One Bank',
      'TD Bank',
      'Fifth Third Bank'
    ];
    
    const routingInt = parseInt(routingNumber);
    const bankIndex = routingInt % bankNames.length;
    return bankNames[bankIndex];
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

  const performAccountCheck = async (routingNumber: string, accountNumberLast4: string) => {
    // Create a unique key for this account using last 4 digits
    const accountKey = `${routingNumber}-${accountNumberLast4}`;
    
    // Get the current account database
    const accountDatabase = getAccountDatabase();
    
    // Increment times checked for this account
    if (accountDatabase[accountKey]) {
      accountDatabase[accountKey].timesChecked = (accountDatabase[accountKey].timesChecked || 0) + 1;
      saveAccountDatabase(accountDatabase);
    }
    
    // Check if this account exists in our account database
    const accountRecord = accountDatabase[accountKey];
    
    let fraudResult: FraudResult;
    
    if (accountRecord && accountRecord.submissions.length > 0) {
      // Check if this is an associated account
      if (accountRecord.isAssociated && accountRecord.associatedWith) {
        const associatedRecord = accountDatabase[accountRecord.associatedWith];
        
        // Get notes from the associated account submission
        const associatedSubmission = accountRecord.submissions.find(s => s.isAssociated);
        
        fraudResult = {
          fraudStatus: 'Associated',
          bankName: accountRecord.bankName,
          timesChecked: accountRecord.timesChecked,
          tags: ['associated_account'],
          associatedWith: accountRecord.associatedWith,
          notes: associatedSubmission?.notes,
          associatedFraudAccount: associatedRecord ? {
            routingNumber: associatedRecord.routingNumber,
            accountNumberLast4: associatedRecord.accountNumberLast4,
            bankName: associatedRecord.bankName,
            reportedBy: [...new Set(associatedRecord.submissions.map(s => s.companyName))]
          } : undefined
        };
      } else {
        // Account has been reported for fraud
        const submissions = accountRecord.submissions.filter(s => !s.isAssociated);
        
        if (submissions.length > 0) {
          // Get unique company names that reported this account
          const reportingCompanies = [...new Set(submissions.map(s => s.companyName))];
          
          // Get all unique tags from submissions
          const allTags = [...new Set(submissions.flatMap(s => s.tags || []))];
          
          const lastSubmission = submissions[submissions.length - 1];
          
          // Combine notes from all submissions
          const allNotes = submissions
            .map(s => s.notes)
            .filter(note => note && note.trim())
            .join(' | ');
          
          // Get default balance from submissions that have it
          const defaultBalanceSubmission = submissions.find(s => s.defaultBalance);
          
          fraudResult = {
            fraudStatus: 'Flagged',
            flaggedCount: submissions.length,
            flaggedBy: reportingCompanies,
            lastFlaggedDate: lastSubmission.submittedDate,
            bankName: accountRecord.bankName,
            timesChecked: accountRecord.timesChecked,
            tags: allTags,
            notes: allNotes || undefined,
            defaultBalance: defaultBalanceSubmission?.defaultBalance,
          };
        } else {
          // Only associated submissions, treat as clean
          fraudResult = {
            fraudStatus: 'Not Reported',
            bankName: accountRecord.bankName,
            timesChecked: accountRecord.timesChecked,
            tags: [],
          };
        }
      }
    } else {
      // Account not found in database - appears clean
      const bankName = getBankNameFromRouting(routingNumber);
      
      // Increment times checked for new accounts
      if (!accountDatabase[accountKey]) {
        accountDatabase[accountKey] = {
          routingNumber,
          accountNumberLast4,
          bankName,
          timesChecked: 1,
          submissions: []
        };
        saveAccountDatabase(accountDatabase);
      }
      
      fraudResult = {
        fraudStatus: 'Not Reported',
        bankName,
        timesChecked: 1,
        tags: [],
      };
    }

    return fraudResult;
  };

  const handleBankCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user has reached their limit
    if (isAtLimit()) {
      return;
    }

    setIsChecking(true);
    setResult(null);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Get effective routing number and bank name
    let effectiveRoutingNumber = '';
    let effectiveBankName = '';

    if (bankForm.bankName) {
      // Get routing number from selected bank
      const bank = getBankByName(bankForm.bankName);
      effectiveRoutingNumber = bank?.routingNumbers[0] || '';
      effectiveBankName = bankForm.bankName;
    } else if (bankForm.routingNumber) {
      // Use provided routing number
      effectiveRoutingNumber = bankForm.routingNumber;
      effectiveBankName = getBankNameFromRouting(bankForm.routingNumber);
    }

    if (!effectiveRoutingNumber) {
      setIsChecking(false);
      return;
    }

    // Since account number is now mandatory, perform specific account check
    const fraudResult = await performAccountCheck(effectiveRoutingNumber, bankForm.accountNumberLast4);

    // Create the complete check result for storage
    const checkResult = {
      id: Date.now(),
      routingNumber: effectiveRoutingNumber,
      accountNumber: `****${bankForm.accountNumberLast4}`,
      checkDate: new Date().toISOString(),
      fraudStatus: fraudResult.fraudStatus,
      flaggedCount: fraudResult.flaggedCount,
      bankName: fraudResult.bankName,
      flaggedBy: fraudResult.flaggedBy,
      lastFlaggedDate: fraudResult.lastFlaggedDate,
      timesChecked: fraudResult.timesChecked,
      tags: fraudResult.tags,
      associatedWith: fraudResult.associatedWith,
      associatedFraudAccount: fraudResult.associatedFraudAccount,
      notes: fraudResult.notes,
      defaultBalance: fraudResult.defaultBalance,
    };

    setResult(fraudResult);
    setIsChecking(false);

    // Notify parent component that a check was performed
    if (onCheckPerformed) {
      onCheckPerformed();
    }

    // Pass the result to parent for storage in check history
    if (onCheckResult) {
      onCheckResult(checkResult);
    }
  };

  const handleAccountCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user has reached their limit
    if (isAtLimit()) {
      return;
    }

    setIsChecking(true);
    setResult(null);

    // Simulate API call to fraud detection service
    await new Promise(resolve => setTimeout(resolve, 2500));

    const fraudResult = await performAccountCheck(accountForm.routingNumber, accountForm.accountNumberLast4);

    // Create the complete check result for storage
    const checkResult = {
      id: Date.now(),
      routingNumber: accountForm.routingNumber,
      accountNumber: `****${accountForm.accountNumberLast4}`,
      checkDate: new Date().toISOString(),
      fraudStatus: fraudResult.fraudStatus,
      flaggedCount: fraudResult.flaggedCount,
      bankName: fraudResult.bankName,
      flaggedBy: fraudResult.flaggedBy,
      lastFlaggedDate: fraudResult.lastFlaggedDate,
      timesChecked: fraudResult.timesChecked,
      tags: fraudResult.tags,
      associatedWith: fraudResult.associatedWith,
      associatedFraudAccount: fraudResult.associatedFraudAccount,
      notes: fraudResult.notes,
      defaultBalance: fraudResult.defaultBalance,
    };

    setResult(fraudResult);
    setIsChecking(false);

    // Notify parent component that a check was performed
    if (onCheckPerformed) {
      onCheckPerformed();
    }

    // Pass the result to parent for storage in check history
    if (onCheckResult) {
      onCheckResult(checkResult);
    }
  };

  const handleNameCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user has reached their limit
    if (isAtLimit()) {
      return;
    }

    setIsChecking(true);
    setResult(null);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Get the current account database
    const accountDatabase = getAccountDatabase();
    
    // Search for accounts by account holder name
    const matchingAccounts = Object.entries(accountDatabase).filter(([key, record]) => {
      return record.submissions.some(submission => 
        submission.accountHolderName.toLowerCase().includes(nameForm.accountHolderName.toLowerCase())
      );
    });

    if (matchingAccounts.length > 0) {
      // Found flagged accounts for this name
      const [firstAccountKey, firstRecord] = matchingAccounts[0];
      const firstSubmissions = firstRecord.submissions.filter(s => !s.isAssociated);
      
      if (firstSubmissions.length > 0) {
        const reportingCompanies = [...new Set(firstSubmissions.map(s => s.companyName))];
        const allTags = [...new Set(firstSubmissions.flatMap(s => s.tags || []))];
        
        // Combine notes from all submissions
        const allNotes = firstSubmissions
          .map(s => s.notes)
          .filter(note => note && note.trim())
          .join(' | ');
        
        // Get default balance from submissions that have it
        const defaultBalanceSubmission = firstSubmissions.find(s => s.defaultBalance);
        
        const fraudResult: FraudResult = {
          fraudStatus: 'Flagged',
          flaggedCount: firstSubmissions.length,
          flaggedBy: reportingCompanies,
          lastFlaggedDate: firstSubmissions[firstSubmissions.length - 1].submittedDate,
          bankName: 'Multiple Banks',
          timesChecked: firstRecord.timesChecked,
          tags: allTags,
          notes: allNotes || undefined,
          defaultBalance: defaultBalanceSubmission?.defaultBalance,
        };

        // Create a name search result
        const checkResult = {
          id: Date.now(),
          routingNumber: 'Name Search',
          accountNumber: `Results for "${nameForm.accountHolderName}"`,
          checkDate: new Date().toISOString(),
          fraudStatus: fraudResult.fraudStatus,
          flaggedCount: fraudResult.flaggedCount,
          bankName: fraudResult.bankName,
          flaggedBy: fraudResult.flaggedBy,
          lastFlaggedDate: fraudResult.lastFlaggedDate,
          timesChecked: fraudResult.timesChecked,
          tags: fraudResult.tags,
          notes: fraudResult.notes,
          defaultBalance: fraudResult.defaultBalance,
          // Add name search specific data
          nameSearchResults: matchingAccounts.map(([key, record]) => ({
            routingNumber: record.routingNumber,
            accountNumberLast4: record.accountNumberLast4,
            bankName: record.bankName,
            flaggedCount: record.submissions.filter(s => !s.isAssociated).length,
            reportedBy: [...new Set(record.submissions.filter(s => !s.isAssociated).map(s => s.companyName))],
            tags: [...new Set(record.submissions.flatMap(s => s.tags || []))]
          })),
          customerDetails: {
            personName: nameForm.accountHolderName,
            businessName: '',
            businessAddress: '',
          }
        };

        setResult(fraudResult);
        setIsChecking(false);

        // Notify parent component that a check was performed
        if (onCheckPerformed) {
          onCheckPerformed();
        }

        // Pass the result to parent for storage in check history
        if (onCheckResult) {
          onCheckResult(checkResult);
        }
      } else {
        // Only associated accounts found
        const fraudResult: FraudResult = {
          fraudStatus: 'Not Reported',
          bankName: 'No flagged accounts found',
          timesChecked: 0,
          tags: [],
        };

        setResult(fraudResult);
        setIsChecking(false);
      }
    } else {
      // No accounts found for this name
      const fraudResult: FraudResult = {
        fraudStatus: 'Not Reported',
        bankName: 'No accounts found',
        timesChecked: 0,
        tags: [],
      };

      setResult(fraudResult);
      setIsChecking(false);
    }
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Available risk tags with colors
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

  const isBankFormValid = () => {
    const hasBank = bankForm.bankName || (bankForm.routingNumber && bankForm.routingNumber.length === 9);
    return hasBank && bankForm.accountNumberLast4 && bankForm.accountNumberLast4.length === 4;
  };

  const isAccountFormValid = () => {
    return accountForm.routingNumber && accountForm.routingNumber.length === 9 && 
           accountForm.accountNumberLast4 && accountForm.accountNumberLast4.length === 4;
  };

  const isNameFormValid = () => {
    return nameForm.accountHolderName && nameForm.accountHolderName.trim().length >= 2;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Bank Account Risk Check</h2>
        <p className="text-gray-600">Check bank account information for potential risk indicators</p>
        
        {/* Usage indicator */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800">
              Checks used this month: {account.checksUsed} / {account.checksLimit === -1 ? '∞' : account.checksLimit}
            </span>
            {account.checksLimit !== -1 && (
              <div className="w-32 bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((account.checksUsed / account.checksLimit) * 100, 100)}%` }}
                ></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Limit reached warning */}
      {isAtLimit() && (
        <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center space-x-3 mb-4">
            <Lock className="h-6 w-6 text-red-600" />
            <h3 className="text-lg font-bold text-red-800">Monthly Limit Reached</h3>
          </div>
          <p className="text-red-700 mb-4">
            You've used all {account.checksLimit} account checks for this month. Upgrade your plan to continue checking accounts.
          </p>
          <button
            onClick={onUpgrade}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Upgrade Plan
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('bank')}
          className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'bank'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Search by Bank
        </button>
        <button
          onClick={() => setActiveTab('account')}
          className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'account'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Search by Account
        </button>
        <button
          onClick={() => setActiveTab('name')}
          className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'name'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Search by Name
        </button>
      </div>

      {/* Search by Bank */}
      {activeTab === 'bank' && (
        <form onSubmit={handleBankCheck} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bank Name *
              </label>
              <BankSelector
                value={bankForm.bankName}
                onChange={handleBankSelection}
                placeholder="Search for the bank..."
                disabled={isAtLimit()}
              />
              <p className="text-xs text-gray-500 mt-1">
                Search for banks like "Chase", "Bank of America", "Wells Fargo"
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Number (Last 4 Digits) *
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={bankForm.accountNumberLast4}
                  onChange={(e) => handleBankFormChange('accountNumberLast4', e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    isAtLimit() ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="Last 4 digits"
                  maxLength={4}
                  disabled={isAtLimit()}
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Account number is required for bank search</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isChecking || !isBankFormValid() || isAtLimit()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {isChecking ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Searching bank account...</span>
              </>
            ) : isAtLimit() ? (
              <>
                <Lock className="h-5 w-5" />
                <span>Upgrade to Continue Checking</span>
              </>
            ) : (
              <>
                <Search className="h-5 w-5" />
                <span>Search Bank Account</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* Search by Account */}
      {activeTab === 'account' && (
        <form onSubmit={handleAccountCheck} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="routing" className="block text-sm font-medium text-gray-700 mb-2">
                Routing Number *
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="routing"
                  type="text"
                  value={accountForm.routingNumber}
                  onChange={(e) => handleAccountFormChange('routingNumber', e.target.value.replace(/\D/g, '').slice(0, 9))}
                  className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    isAtLimit() ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="9-digit routing number"
                  maxLength={9}
                  disabled={isAtLimit()}
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Enter the 9-digit bank routing number</p>
            </div>

            <div>
              <label htmlFor="account" className="block text-sm font-medium text-gray-700 mb-2">
                Account Number (Last 4 Digits) *
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="account"
                  type="text"
                  value={accountForm.accountNumberLast4}
                  onChange={(e) => handleAccountFormChange('accountNumberLast4', e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    isAtLimit() ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="Last 4 digits only"
                  maxLength={4}
                  disabled={isAtLimit()}
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Enter only the last 4 digits for compliance</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isChecking || !isAccountFormValid() || isAtLimit()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {isChecking ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Analyzing account for risk indicators...</span>
              </>
            ) : isAtLimit() ? (
              <>
                <Lock className="h-5 w-5" />
                <span>Upgrade to Continue Checking</span>
              </>
            ) : (
              <>
                <Search className="h-5 w-5" />
                <span>Check Account</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* Search by Name */}
      {activeTab === 'name' && (
        <form onSubmit={handleNameCheck} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Holder Name *
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={nameForm.accountHolderName}
                onChange={(e) => handleNameFormChange('accountHolderName', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  isAtLimit() ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder="Enter full name to search"
                disabled={isAtLimit()}
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Search for accounts associated with this person's name</p>
          </div>

          <button
            type="submit"
            disabled={isChecking || !isNameFormValid() || isAtLimit()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {isChecking ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Searching by name...</span>
              </>
            ) : isAtLimit() ? (
              <>
                <Lock className="h-5 w-5" />
                <span>Upgrade to Continue Checking</span>
              </>
            ) : (
              <>
                <Search className="h-5 w-5" />
                <span>Search by Name</span>
              </>
            )}
          </button>
        </form>
      )}

      {result && (
        <div className="mt-8 border rounded-xl bg-gray-50">
          {/* Header */}
          <div className="p-6 border-b bg-white rounded-t-xl">
            <div className="flex items-center space-x-3">
              {getStatusIcon(result.fraudStatus)}
              <h3 className="text-xl font-bold text-gray-900">
                {activeTab === 'name' ? 'Name Search Results' : 'Account Check Results'}
              </h3>
            </div>
          </div>

          {/* Main Results */}
          <div className="p-6 space-y-6">
            {/* Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-gray-500" />
                  <h4 className="font-semibold text-gray-900">Status</h4>
                </div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(result.fraudStatus)}`}>
                  {getStatusIcon(result.fraudStatus)}
                  <span className="ml-1">
                    {result.fraudStatus === 'Associated' ? 'Associated Account' : result.fraudStatus}
                  </span>
                </div>
              </div>

              {result.fraudStatus === 'Flagged' && result.flaggedCount && (
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center space-x-2 mb-2">
                    <Flag className="h-5 w-5 text-gray-500" />
                    <h4 className="font-semibold text-gray-900">Reports</h4>
                  </div>
                  <p className="text-2xl font-bold text-red-600">{result.flaggedCount} {result.flaggedCount === 1 ? 'report' : 'reports'}</p>
                </div>
              )}

              {result.timesChecked && (
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center space-x-2 mb-2">
                    <Search className="h-5 w-5 text-gray-500" />
                    <h4 className="font-semibold text-gray-900">Times Checked</h4>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{result.timesChecked}</p>
                </div>
              )}

              {result.lastFlaggedDate && (
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <h4 className="font-semibold text-gray-900">Last Reported</h4>
                  </div>
                  <p className="text-sm text-gray-700 font-medium">{formatDate(result.lastFlaggedDate)}</p>
                </div>
              )}
            </div>

            {/* Default Balance */}
            {result.defaultBalance && (
              <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                <div className="flex items-center space-x-2 mb-4">
                  <DollarSign className="h-5 w-5 text-red-600" />
                  <h4 className="font-semibold text-red-800">Default Balance Information</h4>
                </div>
                <div className="bg-red-100 border border-red-300 rounded-lg p-4">
                  <p className="text-red-800 font-semibold text-lg">
                    Default Amount: ${formatCurrencyDisplay(result.defaultBalance)}
                  </p>
                  <p className="text-red-700 text-sm mt-2">
                    This is the amount that was defaulted on by the account holder. This information helps assess the financial risk associated with this account.
                  </p>
                </div>
              </div>
            )}

            {/* Notes */}
            {result.notes && (
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 mb-4">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-800">Additional Notes</h4>
                </div>
                <div className="bg-blue-100 border border-blue-300 rounded-lg p-4">
                  <p className="text-blue-800 text-sm leading-relaxed">
                    {result.notes}
                  </p>
                </div>
                <p className="text-blue-700 text-xs mt-2">
                  These notes were provided by the reporting institutions to give additional context about this account.
                </p>
              </div>
            )}

            {/* Associated Account Warning */}
            {result.fraudStatus === 'Associated' && result.associatedFraudAccount && (
              <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                <div className="flex items-center space-x-2 mb-4">
                  <Link className="h-5 w-5 text-orange-600" />
                  <h4 className="font-semibold text-orange-800">⚠️ Associated Account Warning</h4>
                </div>
                <p className="text-orange-700 mb-4">
                  This account is associated with a flagged account that has been reported to our database.
                </p>
                <div className="bg-orange-100 border border-orange-300 rounded-lg p-4">
                  <h5 className="font-medium text-orange-800 mb-2">Associated Flagged Account:</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-orange-700">Bank:</span>
                      <span className="font-medium text-orange-900 ml-2">{result.associatedFraudAccount.bankName}</span>
                    </div>
                    <div>
                      <span className="text-orange-700">Account:</span>
                      <span className="font-medium text-orange-900 ml-2">****{result.associatedFraudAccount.accountNumberLast4}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-orange-700">Reported by:</span>
                      <span className="font-medium text-orange-900 ml-2">{result.associatedFraudAccount.reportedBy.join(', ')}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Risk Tags */}
            {(result.fraudStatus === 'Flagged' || result.fraudStatus === 'Associated') && result.tags && result.tags.length > 0 && (
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center space-x-2 mb-4">
                  <Tag className="h-5 w-5 text-gray-500" />
                  <h4 className="font-semibold text-gray-900">
                    {result.fraudStatus === 'Associated' ? 'Account Type' : 'Risk Tags'}
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.tags.map((tagId, index) => {
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
              </div>
            )}

            {/* Flagged By Companies */}
            {result.fraudStatus === 'Flagged' && result.flaggedBy && (
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center space-x-2 mb-4">
                  <Users className="h-5 w-5 text-gray-500" />
                  <h4 className="font-semibold text-gray-900">Reported By</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.flaggedBy.map((company, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200"
                    >
                      {company}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  This account has been reported {result.flaggedBy.length} {result.flaggedBy.length === 1 ? 'time' : 'times'} by financial institutions for risky activity.
                </p>
              </div>
            )}

            {/* Bank Information */}
            <div className="bg-white p-6 rounded-lg border">
              <h4 className="font-semibold text-gray-900 mb-4">
                {activeTab === 'name' ? 'Search Information' : 'Bank Information'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">
                    {activeTab === 'name' ? 'Search Term' : 'Bank Name'}
                  </p>
                  <p className="font-medium text-gray-900">
                    {activeTab === 'name' ? nameForm.accountHolderName : result.bankName}
                  </p>
                </div>
                {activeTab !== 'name' && (
                  <div>
                    <p className="text-sm text-gray-600">Account Number</p>
                    <p className="font-medium text-gray-900">
                      ****{activeTab === 'bank' ? bankForm.accountNumberLast4 : accountForm.accountNumberLast4}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Recommendation */}
            <div className={`p-6 rounded-lg border-l-4 ${
              result.fraudStatus === 'Flagged'
                ? 'bg-red-50 border-red-400' 
                : result.fraudStatus === 'Associated'
                ? 'bg-orange-50 border-orange-400'
                : 'bg-green-50 border-green-400'
            }`}>
              <h4 className={`font-semibold mb-2 ${
                result.fraudStatus === 'Flagged' ? 'text-red-800' : 
                result.fraudStatus === 'Associated' ? 'text-orange-800' : 'text-green-800'
              }`}>
                Recommendation
              </h4>
              <p className={`text-sm ${
                result.fraudStatus === 'Flagged' ? 'text-red-700' : 
                result.fraudStatus === 'Associated' ? 'text-orange-700' : 'text-green-700'
              }`}>
                {result.fraudStatus === 'Flagged'
                  ? `⚠️ HIGH RISK: Exercise extreme caution with this account. It has been reported ${result.flaggedCount} ${result.flaggedCount === 1 ? 'time' : 'times'} for risky activity${result.timesChecked ? ` and has been checked ${result.timesChecked} times by various institutions` : ''}. ${result.defaultBalance ? `Previous default amount: $${formatCurrencyDisplay(result.defaultBalance)}.` : ''} Immediate investigation and verification required before proceeding.`
                  : result.fraudStatus === 'Associated'
                  ? `⚠️ CAUTION: This account is associated with a flagged account. While not directly reported as risky, exercise additional caution and consider enhanced verification procedures${result.timesChecked ? `. This account has been checked ${result.timesChecked} times` : ''}.`
                  : activeTab === 'name'
                  ? `✅ LOW RISK: No flagged accounts found for "${nameForm.accountHolderName}". This name does not appear in our risk database.`
                  : `✅ LOW RISK: Account appears legitimate and safe to process. No risk indicators detected in our database${result.timesChecked ? `. This account has been checked ${result.timesChecked} times with no issues reported` : ''}.`
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Export the database functions for use by other components
export { getAccountDatabase, saveAccountDatabase };