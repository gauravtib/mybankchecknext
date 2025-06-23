'use client';

import React, { useState } from 'react';
import { User, Mail, Building, Lock, Eye, EyeOff, CheckCircle, AlertTriangle, CreditCard, ArrowRight, Zap, Settings, Shield, Edit2, Save, X, Phone } from 'lucide-react';
import { UserAccount } from '@/types';
import { mockProducts } from '@/data/mockData';

interface AccountProps {
  userAccount?: UserAccount;
  onUpgrade?: () => void;
  onAccountUpdate?: (updatedAccount: UserAccount) => void;
}

export function Account({ userAccount, onUpgrade, onAccountUpdate }: AccountProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [hideCompanyName, setHideCompanyName] = useState(() => {
    if (typeof window !== 'undefined') {
      // Load setting from localStorage
      const saved = localStorage.getItem('bankcheck_hide_company_name');
      return saved === 'true';
    }
    return false;
  });
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [accountInfoSaved, setAccountInfoSaved] = useState(false);
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Default user data if none provided
  const defaultUserAccount: UserAccount = {
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@securebank.com',
    companyName: 'SecureBank Financial Services',
    companyPhone: '(555) 123-4567',
    jobTitle: 'Fraud Detection Analyst',
    plan: {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: '/month',
      checks: '10 monthly checks',
    },
    checksUsed: 3,
    checksLimit: 10,
    accountCreated: '2023-06-15',
    lastLogin: '2024-01-20 14:30:22',
  };

  const account = userAccount || defaultUserAccount;

  // Editable account information state
  const [editableAccount, setEditableAccount] = useState({
    firstName: account.firstName,
    lastName: account.lastName,
    companyName: account.companyName,
    companyPhone: account.companyPhone,
    jobTitle: account.jobTitle,
  });

  // Update editableAccount when userAccount changes
  React.useEffect(() => {
    setEditableAccount({
      firstName: account.firstName,
      lastName: account.lastName,
      companyName: account.companyName,
      companyPhone: account.companyPhone,
      jobTitle: account.jobTitle,
    });
  }, [account.firstName, account.lastName, account.companyName, account.companyPhone, account.jobTitle]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return;
    }
    
    setIsChangingPassword(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsChangingPassword(false);
    setPasswordChanged(true);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setPasswordChanged(false);
    }, 3000);
  };

  const handlePasswordInputChange = (field: string, value: string) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCompanyPrivacyChange = (enabled: boolean) => {
    setHideCompanyName(enabled);
    // Save setting to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('bankcheck_hide_company_name', enabled.toString());
    }
    setSettingsSaved(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setSettingsSaved(false);
    }, 3000);
  };

  const handleAccountInfoChange = (field: string, value: string) => {
    setEditableAccount(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    handleAccountInfoChange('companyPhone', formatted);
  };

  const handleSaveAccountInfo = async () => {
    setIsEditingAccount(false);
    setAccountInfoSaved(true);
    
    // In production, this would save to the backend
    console.log('Saving account info:', editableAccount);
    
    // Update the parent component with the new account data
    if (onAccountUpdate) {
      const updatedAccount = {
        ...account,
        ...editableAccount
      };
      onAccountUpdate(updatedAccount);
    }
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setAccountInfoSaved(false);
    }, 3000);
  };

  const handleCancelEdit = () => {
    setIsEditingAccount(false);
    // Reset to original values
    setEditableAccount({
      firstName: account.firstName,
      lastName: account.lastName,
      companyName: account.companyName,
      companyPhone: account.companyPhone,
      jobTitle: account.jobTitle,
    });
  };

  const isPasswordFormValid = () => {
    return passwordForm.currentPassword && 
           passwordForm.newPassword && 
           passwordForm.confirmPassword &&
           passwordForm.newPassword === passwordForm.confirmPassword &&
           passwordForm.newPassword.length >= 8;
  };

  // Password validation
  const getPasswordStrength = (password: string) => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    Object.values(checks).forEach(check => {
      if (check) score++;
    });

    return { score, checks };
  };

  const passwordStrength = getPasswordStrength(passwordForm.newPassword);
  const getStrengthColor = (score: number) => {
    if (score < 2) return 'bg-red-500';
    if (score < 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = (score: number) => {
    if (score < 2) return 'Weak';
    if (score < 4) return 'Medium';
    return 'Strong';
  };

  const passwordsMatch = passwordForm.newPassword === passwordForm.confirmPassword;
  const passwordLongEnough = passwordForm.newPassword.length >= 8;

  const getUsagePercentage = () => {
    if (account.checksLimit === -1) return 0; // Unlimited
    return (account.checksUsed / account.checksLimit) * 100;
  };

  const getUsageColor = () => {
    const percentage = getUsagePercentage();
    if (percentage >= 90) return 'text-red-600 bg-red-50 border-red-200';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const isNearLimit = () => {
    return account.checksLimit !== -1 && account.checksUsed >= account.checksLimit * 0.8;
  };

  const isAtLimit = () => {
    return account.checksLimit !== -1 && account.checksUsed >= account.checksLimit;
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Settings</h2>
        <p className="text-gray-600">Manage your account information and subscription</p>
      </div>

      {/* Current Plan & Usage */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <CreditCard className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Current Plan & Usage</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Plan Details */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">{account.plan.name} Plan</h4>
                <p className="text-gray-600">{account.plan.checks}</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-gray-900">{account.plan.price}</span>
                <span className="text-gray-600">{account.plan.period}</span>
              </div>
            </div>

            {/* Subscription Status */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <span className="text-blue-800 font-medium">
                  Subscription Status: {account.subscriptionStatus || 'Active'}
                </span>
              </div>
            </div>

            {account.plan.id === 'free' && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-4 mt-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-blue-800">Upgrade to unlock more checks</span>
                </div>
                <p className="text-blue-700 text-sm mb-3">
                  Get 500+ monthly checks with advanced features and priority support.
                </p>
                <button
                  onClick={onUpgrade}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                >
                  <span>Upgrade Now</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Usage Statistics */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Usage This Month</h4>
            
            <div className={`p-4 rounded-lg border ${getUsageColor()}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Fraud Checks Used</span>
                <span className="font-bold">
                  {account.checksUsed} / {account.checksLimit === -1 ? '∞' : account.checksLimit}
                </span>
              </div>
              
              {account.checksLimit !== -1 && (
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      getUsagePercentage() >= 90 ? 'bg-red-500' :
                      getUsagePercentage() >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(getUsagePercentage(), 100)}%` }}
                  ></div>
                </div>
              )}
              
              {isAtLimit() && (
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">Limit reached - upgrade to continue</span>
                </div>
              )}
              
              {isNearLimit() && !isAtLimit() && (
                <div className="flex items-center space-x-2 text-yellow-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">Approaching monthly limit</span>
                </div>
              )}
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p>Resets on the 1st of each month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Available Plans */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <CreditCard className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Available Plans</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockProducts.map((product) => (
            <div 
              key={product.id}
              className={`relative border-2 rounded-xl p-6 ${
                account.plan.id === product.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200'
              }`}
            >
              {account.plan.id === product.id && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Current Plan
                  </span>
                </div>
              )}
              
              <div className={`text-center ${account.plan.id === product.id ? 'pt-4' : ''}`}>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900">
                    {product.name === 'Free' ? '$0' : 
                     product.name === 'Growth' ? '$299' : 
                     product.name === 'Pro' ? '$999' : '$0'}
                  </span>
                  <span className="text-gray-600">/month</span>
                </div>
                <div className="text-blue-600 font-semibold text-lg mb-4">{product.description}</div>
                
                {account.plan.id !== product.id && (
                  <button
                    onClick={onUpgrade}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    {product.name === 'Free' ? 'Start Free' : `Upgrade to ${product.name}`}
                  </button>
                )}
                
                {account.plan.id === product.id && (
                  <div className="mt-4 inline-flex items-center px-3 py-1 rounded-lg bg-green-100 text-green-800 border border-green-200">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">Active Plan</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Settings className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Settings</h3>
        </div>

        {settingsSaved && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Settings saved successfully!
              </span>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Privacy Settings */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h4>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Shield className="h-5 w-5 text-gray-600" />
                    <h5 className="font-medium text-gray-900">Company Name Privacy</h5>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Hide my company name from others when reporting fraud accounts
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800">
                      <strong>When enabled:</strong> Your fraud reports will show "Undisclosed" instead of "{account.companyName}" 
                      to other users checking the same accounts. This helps maintain your company's privacy while still 
                      contributing to the collaborative fraud prevention network.
                    </p>
                  </div>
                </div>
                
                <div className="ml-6">
                  <button
                    onClick={() => handleCompanyPrivacyChange(!hideCompanyName)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      hideCompanyName ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        hideCompanyName ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
              
              <div className="mt-4 text-xs text-gray-500">
                <p>
                  <strong>Current setting:</strong> When you report fraud accounts, other users will see{' '}
                  <span className="font-medium text-gray-700">
                    {hideCompanyName ? '"Undisclosed"' : `"${account.companyName}"`}
                  </span>{' '}
                  as the reporting institution.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Building className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Account Information</h3>
          </div>
          
          {!isEditingAccount ? (
            <button
              onClick={() => setIsEditingAccount(true)}
              className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit2 className="h-4 w-4" />
              <span>Edit</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSaveAccountInfo}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>Save</span>
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>

        {accountInfoSaved && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Account information updated successfully!
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={isEditingAccount ? editableAccount.firstName : account.firstName}
                onChange={(e) => handleAccountInfoChange('firstName', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg ${
                  isEditingAccount 
                    ? 'focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                    : 'bg-gray-50 text-gray-700'
                }`}
                readOnly={!isEditingAccount}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={isEditingAccount ? editableAccount.lastName : account.lastName}
                onChange={(e) => handleAccountInfoChange('lastName', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg ${
                  isEditingAccount 
                    ? 'focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                    : 'bg-gray-50 text-gray-700'
                }`}
                readOnly={!isEditingAccount}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={account.email}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                readOnly
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed for security reasons</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={isEditingAccount ? editableAccount.companyName : account.companyName}
                onChange={(e) => handleAccountInfoChange('companyName', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg ${
                  isEditingAccount 
                    ? 'focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                    : 'bg-gray-50 text-gray-700'
                }`}
                readOnly={!isEditingAccount}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Phone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                value={isEditingAccount ? editableAccount.companyPhone : account.companyPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg ${
                  isEditingAccount 
                    ? 'focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                    : 'bg-gray-50 text-gray-700'
                }`}
                placeholder="(555) 123-4567"
                maxLength={14}
                readOnly={!isEditingAccount}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Title
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={isEditingAccount ? editableAccount.jobTitle : account.jobTitle}
                onChange={(e) => handleAccountInfoChange('jobTitle', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg ${
                  isEditingAccount 
                    ? 'focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                    : 'bg-gray-50 text-gray-700'
                }`}
                readOnly={!isEditingAccount}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Created
            </label>
            <div className="relative">
              <input
                type="text"
                value={new Date(account.accountCreated).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                readOnly
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Login
            </label>
            <div className="relative">
              <input
                type="text"
                value={new Date(account.lastLogin).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                readOnly
              />
            </div>
          </div>
        </div>
      </div>

      {/* Password Management */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-red-100 rounded-lg">
            <Lock className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Password & Security</h3>
        </div>

        {passwordChanged && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Password changed successfully!
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordForm.currentPassword}
                onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your current password"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={passwordForm.newPassword}
                onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {passwordForm.newPassword && (
              <div className="mt-2 flex items-center space-x-2">
                {passwordLongEnough ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-xs ${passwordLongEnough ? 'text-green-600' : 'text-red-600'}`}>
                  Password must be at least 8 characters long
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordForm.confirmPassword}
                onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Confirm your new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {passwordForm.confirmPassword && (
              <div className="mt-2 flex items-center space-x-2">
                {passwordsMatch ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-xs ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                  {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-4">
            <button
              type="button"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Reset Password via Email
            </button>
            
            <button
              type="submit"
              disabled={isChangingPassword || !isPasswordFormValid()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center space-x-2"
            >
              {isChangingPassword ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Changing Password...</span>
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5" />
                  <span>Change Password</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Security Recommendations</h4>
              <ul className="mt-2 text-xs text-yellow-700 space-y-1">
                <li>• Use a strong password with at least 8 characters</li>
                <li>• Include uppercase, lowercase, numbers, and special characters</li>
                <li>• Don't reuse passwords from other accounts</li>
                <li>• Change your password regularly</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}