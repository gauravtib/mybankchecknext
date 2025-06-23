import React, { useState } from 'react';
import { User, Phone, Mail, Building, MapPin, CreditCard, AlertTriangle, ToggleLeft, ToggleRight, Tag, X, Plus, Trash2, FileText, DollarSign, Upload, CheckCircle } from 'lucide-react';
import { BankSelector } from './BankSelector';
import { getBankByName, getBankByRoutingNumber } from '../data/usBanks';
import { getAccountDatabase, saveAccountDatabase } from './ManualFraudCheck';
import { CSVUploader } from './CSVUploader';

interface SubmitAccountProps {
  onSubmit?: (accountData: any) => void;
  userAccount?: {
    companyName: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

interface AssociatedAccount {
  id: string;
  inputMethod: 'bank' | 'routing';
  bankName: string;
  routingNumber: string;
  accountNumberLast4: string;
  accountHolderName: string;
}

// Available risk tags - reordered as requested
const RISK_TAGS = [
  { id: 'fraud', label: 'Fraud', color: 'bg-red-100 text-red-800 border-red-300' },
  { id: 'default', label: 'Default', color: 'bg-gray-100 text-gray-800 border-gray-300' },
  { id: 'stacking', label: 'Stacking', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  { id: 'fake_deposits', label: 'Fake Deposits', color: 'bg-pink-100 text-pink-800 border-pink-300' },
  { id: 'bank_disconnected', label: 'Bank Disconnected', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { id: 'blocked_payments', label: 'Blocked Payments', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  { id: 'excessive_nsfs', label: 'Excessive NSFs', color: 'bg-purple-100 text-purple-800 border-purple-300' },
];

// Get current user's company information from the user account
const getCurrentUserInfo = (userAccount?: any) => {
  // Check if user has enabled company name privacy
  const hideCompanyName = localStorage.getItem('bankcheck_hide_company_name') === 'true';
  
  // Use the actual user's company name from their account
  const actualCompanyName = userAccount?.companyName || 'Your Company';
  const userEmail = userAccount?.email || 'user@company.com';
  
  return {
    companyName: hideCompanyName ? 'Undisclosed' : actualCompanyName,
    actualCompanyName,
    reporterEmail: userEmail,
    submittedBy: userEmail,
    isCompanyNameHidden: hideCompanyName
  };
};

export function SubmitFraudAccount({ onSubmit, userAccount }: SubmitAccountProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [inputMethod, setInputMethod] = useState<'bank' | 'routing'>('bank');
  const [selectedTags, setSelectedTags] = useState<string[]>([]); // No tags selected by default
  const [associatedAccounts, setAssociatedAccounts] = useState<AssociatedAccount[]>([]);
  const [notes, setNotes] = useState(''); // New notes field
  const [defaultBalance, setDefaultBalance] = useState(''); // New default balance field
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [bulkSubmitSuccess, setBulkSubmitSuccess] = useState(false);
  const [bulkSubmitCount, setBulkSubmitCount] = useState(0);
  
  const [formData, setFormData] = useState({
    // Bank Selection
    bankName: '',
    routingNumber: '',
    
    // Bank Account Details
    accountNumberLast4: '',
    accountHolderName: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBankSelection = (selectedBankName: string, selectedRoutingNumber?: string) => {
    setFormData(prev => ({
      ...prev,
      bankName: selectedBankName,
      routingNumber: selectedRoutingNumber || prev.routingNumber
    }));
  };

  const handleInputMethodToggle = () => {
    setInputMethod(inputMethod === 'bank' ? 'routing' : 'bank');
    setFormData(prev => ({
      ...prev,
      bankName: '',
      routingNumber: ''
    }));
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tagId)) {
        // If removing the default tag, clear the default balance
        if (tagId === 'default') {
          setDefaultBalance('');
        }
        return prev.filter(id => id !== tagId);
      } else {
        return [...prev, tagId];
      }
    });
  };

  const formatCurrency = (value: string) => {
    // Remove all non-digits and decimal points
    const numericValue = value.replace(/[^\d.]/g, '');
    
    // Ensure only one decimal point
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) {
      return parts[0] + '.' + parts[1].slice(0, 2);
    }
    
    return numericValue;
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

  const handleDefaultBalanceChange = (value: string) => {
    const formatted = formatCurrency(value);
    setDefaultBalance(formatted);
  };

  const getTagById = (tagId: string) => {
    return RISK_TAGS.find(tag => tag.id === tagId);
  };

  // Associated Accounts functions
  const addAssociatedAccount = () => {
    const newAccount: AssociatedAccount = {
      id: Date.now().toString(),
      inputMethod: 'bank',
      bankName: '',
      routingNumber: '',
      accountNumberLast4: '',
      accountHolderName: '',
    };
    setAssociatedAccounts(prev => [...prev, newAccount]);
  };

  const removeAssociatedAccount = (id: string) => {
    setAssociatedAccounts(prev => prev.filter(account => account.id !== id));
  };

  const updateAssociatedAccount = (id: string, field: keyof AssociatedAccount, value: string) => {
    setAssociatedAccounts(prev => prev.map(account => 
      account.id === id ? { ...account, [field]: value } : account
    ));
  };

  const handleAssociatedBankSelection = (id: string, bankName: string, routingNumber?: string) => {
    setAssociatedAccounts(prev => prev.map(account => 
      account.id === id ? { 
        ...account, 
        bankName, 
        routingNumber: routingNumber || account.routingNumber 
      } : account
    ));
  };

  const toggleAssociatedInputMethod = (id: string) => {
    setAssociatedAccounts(prev => prev.map(account => 
      account.id === id ? { 
        ...account, 
        inputMethod: account.inputMethod === 'bank' ? 'routing' : 'bank',
        bankName: '',
        routingNumber: ''
      } : account
    ));
  };

  const getEffectiveRoutingNumber = (): string => {
    if (inputMethod === 'routing') {
      return formData.routingNumber;
    } else {
      // Get routing number from selected bank
      const bank = getBankByName(formData.bankName);
      return bank?.routingNumbers[0] || '';
    }
  };

  const getEffectiveBankName = (): string => {
    if (inputMethod === 'bank') {
      return formData.bankName;
    } else {
      // Get bank name from routing number
      const bank = getBankByRoutingNumber(formData.routingNumber);
      return bank?.name || getBankNameFromRouting(formData.routingNumber);
    }
  };

  const getAssociatedAccountEffectiveRouting = (account: AssociatedAccount): string => {
    if (account.inputMethod === 'routing') {
      return account.routingNumber;
    } else {
      const bank = getBankByName(account.bankName);
      return bank?.routingNumbers[0] || '';
    }
  };

  const getAssociatedAccountEffectiveBankName = (account: AssociatedAccount): string => {
    if (account.inputMethod === 'bank') {
      return account.bankName;
    } else {
      const bank = getBankByRoutingNumber(account.routingNumber);
      return bank?.name || getBankNameFromRouting(account.routingNumber);
    }
  };

  const getBankNameFromRouting = (routingNumber: string): string => {
    // Generate realistic bank names based on routing number patterns
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Get current user information using the actual user account
    const userInfo = getCurrentUserInfo(userAccount);
    
    const effectiveRoutingNumber = getEffectiveRoutingNumber();
    const effectiveBankName = getEffectiveBankName();
    
    // Create the account submission
    const accountSubmission = {
      routingNumber: effectiveRoutingNumber,
      accountNumberLast4: formData.accountNumberLast4,
      accountHolderName: formData.accountHolderName,
      tags: selectedTags, // Add selected tags to submission
      notes: notes.trim(), // Add notes to submission
      defaultBalance: selectedTags.includes('default') ? defaultBalance : undefined, // Add default balance if default tag is selected
      submittedBy: userInfo.submittedBy,
      submittedDate: new Date().toISOString(),
      companyName: userInfo.companyName, // This will be "Undisclosed" if privacy is enabled
      actualCompanyName: userInfo.actualCompanyName, // Keep actual name for internal tracking
      reporterEmail: userInfo.reporterEmail,
      id: Date.now(),
      // Legacy fields for compatibility (empty since we removed the form)
      personName: formData.accountHolderName || 'Not Provided',
      personPhone: '',
      personEmail: '',
      businessName: '',
      businessPhone: '',
      businessEmail: '',
      businessAddress: '',
    };

    // Get current account database
    const accountDatabase = getAccountDatabase();
    
    // Create account key using last 4 digits
    const accountKey = `${effectiveRoutingNumber}-${formData.accountNumberLast4}`;
    
    // Add or update the account record
    if (accountDatabase[accountKey]) {
      // Account already exists, add this submission
      accountDatabase[accountKey].submissions.push(accountSubmission);
    } else {
      // New flagged account
      accountDatabase[accountKey] = {
        routingNumber: effectiveRoutingNumber,
        accountNumberLast4: formData.accountNumberLast4,
        bankName: effectiveBankName,
        timesChecked: 0,
        submissions: [accountSubmission]
      };
    }

    // Process associated accounts
    const processedAssociatedAccounts = [];
    for (const account of associatedAccounts) {
      if (account.accountNumberLast4.length === 4) {
        const associatedRouting = getAssociatedAccountEffectiveRouting(account);
        const associatedBankName = getAssociatedAccountEffectiveBankName(account);
        
        if (associatedRouting) {
          const associatedKey = `${associatedRouting}-${account.accountNumberLast4}`;
          
          // Create associated account submission
          const associatedSubmission = {
            ...accountSubmission,
            routingNumber: associatedRouting,
            accountNumberLast4: account.accountNumberLast4,
            accountHolderName: account.accountHolderName,
            isAssociated: true,
            associatedWith: accountKey,
            tags: ['associated_account'], // Special tag for associated accounts
          };

          // Add to database as associated account
          if (accountDatabase[associatedKey]) {
            // Check if this is already marked as flagged
            if (accountDatabase[associatedKey].submissions.some(sub => !sub.isAssociated)) {
              // Already flagged, just add association note
              accountDatabase[associatedKey].submissions.push(associatedSubmission);
            } else {
              // Mark as associated
              accountDatabase[associatedKey].submissions.push(associatedSubmission);
            }
          } else {
            // New associated account
            accountDatabase[associatedKey] = {
              routingNumber: associatedRouting,
              accountNumberLast4: account.accountNumberLast4,
              bankName: associatedBankName,
              timesChecked: 0,
              submissions: [associatedSubmission],
              isAssociated: true,
              associatedWith: accountKey
            };
          }

          processedAssociatedAccounts.push({
            routing: associatedRouting,
            accountLast4: account.accountNumberLast4,
            bankName: associatedBankName,
            accountHolderName: account.accountHolderName
          });
        }
      }
    }
    
    // Save updated database
    saveAccountDatabase(accountDatabase);
    
    console.log('Bank account added to database:', accountSubmission);
    console.log('Associated accounts processed:', processedAssociatedAccounts);
    console.log('Updated account database:', accountDatabase);

    // Call the parent handler
    if (onSubmit) {
      onSubmit({
        ...accountSubmission,
        associatedAccounts: processedAssociatedAccounts
      });
    }
    
    setIsSubmitting(false);
    setSubmitted(true);
    
    // Reset form after 5 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        bankName: '',
        routingNumber: '',
        accountNumberLast4: '',
        accountHolderName: '',
      });
      setSelectedTags([]); // Reset to no tags selected
      setAssociatedAccounts([]); // Reset associated accounts
      setNotes(''); // Reset notes
      setDefaultBalance(''); // Reset default balance
    }, 5000);
  };

  const handleBulkUpload = (csvData: any[]) => {
    // Instead of directly adding to the database, save to pending uploads for admin approval
    saveToPendingUploads(csvData);
    
    // Show success message
    setBulkSubmitSuccess(true);
    setBulkSubmitCount(csvData.length);
    
    // Reset after 5 seconds
    setTimeout(() => {
      setBulkSubmitSuccess(false);
      setBulkSubmitCount(0);
    }, 5000);
  };

  const saveToPendingUploads = (data: any[]) => {
    try {
      // Get existing pending uploads
      const saved = localStorage.getItem('admin_pending_uploads');
      let pendingUploads = [];
      
      if (saved) {
        pendingUploads = JSON.parse(saved);
      }
      
      // Get user info
      const userInfo = getCurrentUserInfo(userAccount);
      
      // Add new upload
      const newUpload = {
        id: 'upload_' + Date.now(),
        uploadDate: new Date().toISOString(),
        companyName: userInfo.companyName,
        fileName: `${userInfo.companyName.toLowerCase().replace(/\s+/g, '_')}_upload_${new Date().toISOString().split('T')[0]}.csv`,
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

  const isFormValid = () => {
    const effectiveRoutingNumber = getEffectiveRoutingNumber();
    const hasDefaultBalance = !selectedTags.includes('default') || (selectedTags.includes('default') && defaultBalance.trim());
    
    return effectiveRoutingNumber && 
           formData.accountNumberLast4 && 
           formData.accountNumberLast4.length === 4 && 
           formData.accountHolderName.trim() && // Account holder name is now required
           selectedTags.length > 0 &&
           hasDefaultBalance; // Ensure default balance is provided if default tag is selected
  };

  if (submitted) {
    const userInfo = getCurrentUserInfo(userAccount);
    
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Submit Risk Account</h2>
          <p className="text-gray-600">Report bank account information with risk indicators</p>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-green-800 mb-2">Bank Account Report Submitted Successfully</h3>
          <p className="text-green-700 mb-4">
            Thank you for reporting this account. The information has been added to our collaborative 
            database and will help protect other financial institutions.
          </p>
          <div className="bg-green-100 border border-green-300 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-green-800">
              <strong>What happens next:</strong><br />
              • Account is flagged in our database<br />
              • Other institutions will see this report during account checks<br />
              • Your company will be listed as{' '}
              <strong>"{userInfo.companyName}"</strong> to other users<br />
              {userInfo.isCompanyNameHidden && (
                <span className="text-blue-700">
                  • Your privacy setting is active - company name is hidden<br />
                </span>
              )}
              • Selected risk tags will help categorize the issue<br />
              {selectedTags.includes('default') && defaultBalance && (
                <span className="text-gray-700">
                  • Default balance of ${formatCurrencyDisplay(defaultBalance)} will be visible to other institutions<br />
                </span>
              )}
              {notes && (
                <span className="text-gray-700">
                  • Additional notes will be available to other institutions<br />
                </span>
              )}
              {associatedAccounts.length > 0 && (
                <span className="text-orange-700">
                  • {associatedAccounts.length} associated account{associatedAccounts.length > 1 ? 's' : ''} will show warnings<br />
                </span>
              )}
              • Try checking this account now to see the report!
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (bulkSubmitSuccess) {
    const userInfo = getCurrentUserInfo(userAccount);
    
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Submit Risk Account</h2>
          <p className="text-gray-600">Report bank account information with risk indicators</p>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-green-800 mb-2">Bulk Upload Submitted for Review</h3>
          <p className="text-green-700 mb-4">
            Your CSV file with {bulkSubmitCount} accounts has been submitted for admin review.
          </p>
          <div className="bg-green-100 border border-green-300 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-green-800">
              <strong>What happens next:</strong><br />
              • An administrator will review your submission<br />
              • Once approved, accounts will be added to the database<br />
              • You'll be able to check these accounts after approval<br />
              • Your company will be listed as{' '}
              <strong>"{userInfo.companyName}"</strong> to other users<br />
              {userInfo.isCompanyNameHidden && (
                <span className="text-blue-700">
                  • Your privacy setting is active - company name is hidden<br />
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const userInfo = getCurrentUserInfo(userAccount);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Submit Risk Account</h2>
        <p className="text-gray-600">Report bank account information with risk indicators to help protect the financial community</p>
        
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-800">Collaborative Risk Prevention</p>
              <p className="text-xs text-blue-700 mt-1">
                When you report an account, it becomes part of our shared database that helps protect all participating financial institutions. 
                Your report will show up in account checks performed by other users, with <strong>{userInfo.companyName}</strong> listed as the reporting institution.
                {userInfo.isCompanyNameHidden && (
                  <span className="block mt-1 text-blue-600 font-medium">
                    🔒 Privacy Mode Active: Your company name will appear as "Undisclosed" to protect your privacy.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('single')}
          className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'single'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Single Account
        </button>
        <button
          onClick={() => setActiveTab('bulk')}
          className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'bulk'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Bulk Upload
        </button>
      </div>

      {activeTab === 'single' ? (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Bank Account Details */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-red-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Bank Account Details</h3>
            </div>

            {/* Input Method Toggle - Left Aligned */}
            <div className="flex justify-start mb-6">
              <div className="bg-gray-100 p-1 rounded-lg flex items-center">
                <button
                  type="button"
                  onClick={() => inputMethod === 'routing' && handleInputMethodToggle()}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    inputMethod === 'bank'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Search by Bank Name
                </button>
                <button
                  type="button"
                  onClick={() => inputMethod === 'bank' && handleInputMethodToggle()}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    inputMethod === 'routing'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Enter Routing Number
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bank Selection */}
              {inputMethod === 'bank' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Name *
                  </label>
                  <BankSelector
                    value={formData.bankName}
                    onChange={handleBankSelection}
                    placeholder="Search for the bank..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Search for banks like "Chase", "Bank of America", "Wells Fargo"
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Routing Number *
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.routingNumber}
                      onChange={(e) => handleInputChange('routingNumber', e.target.value.replace(/\D/g, '').slice(0, 9))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="9-digit routing number"
                      maxLength={9}
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Enter the 9-digit bank routing number</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number (Last 4 Digits Only) *
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.accountNumberLast4}
                    onChange={(e) => handleInputChange('accountNumberLast4', e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Last 4 digits only"
                    maxLength={4}
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  <strong>Compliance:</strong> Enter only the last 4 digits of the account number
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Holder Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.accountHolderName}
                    onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Full name on the account"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  <strong>Required:</strong> Enter the full name associated with the account
                </p>
              </div>
            </div>
          </div>

          {/* Risk Tags Section */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Tag className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Risk Tags</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Risk Tags * <span className="text-gray-500 font-normal">(Select one or more)</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {RISK_TAGS.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.id)}
                    className={`flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                      selectedTags.includes(tag.id)
                        ? `${tag.color} ring-2 ring-blue-500 ring-opacity-50`
                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Tag className="h-4 w-4 mr-2" />
                    {tag.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Select tags that best describe the type of risk. Multiple tags can be selected to provide more context.
              </p>
              
              {/* Selected Tags Display */}
              {selectedTags.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Selected tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tagId) => {
                      const tag = getTagById(tagId);
                      if (!tag) return null;
                      return (
                        <span
                          key={tagId}
                          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${tag.color}`}
                        >
                          {tag.label}
                          <button
                            type="button"
                            onClick={() => handleTagToggle(tagId)}
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Default Balance Field - Only show when "Default" tag is selected */}
              {selectedTags.includes('default') && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Balance *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={defaultBalance}
                      onChange={(e) => handleDefaultBalanceChange(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="15000"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the default balance amount (e.g., 15000 will display as {formatCurrencyDisplay('15000')})
                  </p>
                  
                  {/* Show formatted preview */}
                  {defaultBalance && (
                    <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Preview:</strong> ${formatCurrencyDisplay(defaultBalance)}
                      </p>
                    </div>
                  )}
                  
                  {/* Default Balance Info */}
                  <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">Default Balance Information</p>
                        <p className="text-xs text-gray-600 mt-1">
                          This is the amount that was defaulted on. This information will be visible to other institutions 
                          when they check this account and can help them assess the risk level.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Notes</h3>
                <p className="text-sm text-gray-600">Optional: Add additional context about this account</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Add any additional context, such as 'This person also did it to 5 other lenders after us' or other relevant details..."
                  maxLength={500}
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">
                  Optional field to provide additional context that may help other institutions
                </p>
                <span className="text-xs text-gray-400">
                  {notes.length}/500 characters
                </span>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Notes Usage</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Notes will be visible to other institutions when they check this account. Use this field to provide 
                    helpful context such as patterns of behavior, additional fraud attempts, or other relevant information 
                    that could help protect the financial community.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Associated Accounts Section */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Associated Accounts</h3>
                  <p className="text-sm text-gray-600">Optional: Add accounts that are associated with the reported account</p>
                </div>
              </div>
              <button
                type="button"
                onClick={addAssociatedAccount}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Account</span>
              </button>
            </div>

            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-orange-800">What are Associated Accounts?</p>
                  <p className="text-xs text-orange-700 mt-1">
                    These are accounts that aren't risky themselves but are connected to the reported account. 
                    When someone checks these accounts, they'll see a warning that they're associated with a reported account. 
                    This helps identify potential risks and patterns.
                  </p>
                </div>
              </div>
            </div>

            {associatedAccounts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm">No associated accounts added yet</p>
                <p className="text-xs mt-1">Click "Add Account" to include accounts that are related to the reported account</p>
              </div>
            ) : (
              <div className="space-y-4">
                {associatedAccounts.map((account, index) => (
                  <div key={account.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Associated Account #{index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeAssociatedAccount(account.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Input Method Toggle for Associated Account - Left Aligned */}
                    <div className="flex justify-start mb-4">
                      <div className="bg-gray-100 p-1 rounded-lg flex items-center">
                        <button
                          type="button"
                          onClick={() => account.inputMethod === 'routing' && toggleAssociatedInputMethod(account.id)}
                          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                            account.inputMethod === 'bank'
                              ? 'bg-white text-blue-600 shadow-sm'
                              : 'text-gray-600 hover:text-gray-800'
                          }`}
                        >
                          Bank Name
                        </button>
                        <button
                          type="button"
                          onClick={() => account.inputMethod === 'bank' && toggleAssociatedInputMethod(account.id)}
                          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                            account.inputMethod === 'routing'
                              ? 'bg-white text-blue-600 shadow-sm'
                              : 'text-gray-600 hover:text-gray-800'
                          }`}
                        >
                          Routing Number
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Bank Selection for Associated Account */}
                      {account.inputMethod === 'bank' ? (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bank Name
                          </label>
                          <BankSelector
                            value={account.bankName}
                            onChange={(bankName, routingNumber) => handleAssociatedBankSelection(account.id, bankName, routingNumber)}
                            placeholder="Search for the bank..."
                            className="text-sm"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Routing Number
                          </label>
                          <div className="relative">
                            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              type="text"
                              value={account.routingNumber}
                              onChange={(e) => updateAssociatedAccount(account.id, 'routingNumber', e.target.value.replace(/\D/g, '').slice(0, 9))}
                              className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              placeholder="9-digit routing number"
                              maxLength={9}
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Account Number (Last 4 Digits)
                        </label>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            value={account.accountNumberLast4}
                            onChange={(e) => updateAssociatedAccount(account.id, 'accountNumberLast4', e.target.value.replace(/\D/g, '').slice(0, 4))}
                            className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="Last 4 digits"
                            maxLength={4}
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Account Holder Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            value={account.accountHolderName}
                            onChange={(e) => updateAssociatedAccount(account.id, 'accountHolderName', e.target.value)}
                            className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="Name on the associated account (optional)"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Compliance Notice */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Compliance & Security Notice</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    For compliance and security purposes, only provide the <strong>last 4 digits</strong> of account numbers. 
                    Full account numbers are not stored or transmitted for privacy protection. Bank details are automatically 
                    determined from the routing number during account checks.
                  </p>
                </div>
              </div>
            </div>

            {/* Reporting Information Note */}
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Building className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Your Company Information</p>
                  <p className="text-xs text-blue-700 mt-1">
                    When this report appears in future account checks, <strong>{userInfo.companyName}</strong> 
                    will be listed as the reporting institution. This helps other financial institutions know the source 
                    of the report and builds trust in the collaborative risk prevention network.
                    {userInfo.isCompanyNameHidden && (
                      <span className="block mt-2 text-blue-600 font-medium">
                        🔒 Your privacy setting is active - your actual company name ({userInfo.actualCompanyName}) will not be visible to others.
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !isFormValid()}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-3 px-8 rounded-lg transition-colors flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Submitting Report...</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5" />
                  <span>Submit Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <CSVUploader onUpload={handleBulkUpload} />
      )}
    </div>
  );
}