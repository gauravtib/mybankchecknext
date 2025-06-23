'use client';

import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { ManualFraudCheck } from './ManualFraudCheck';
import { SubmitFraudAccount } from './SubmitFraudAccount';
import { CheckResults } from './CheckResults';
import { Account } from './Account';
import { ApiIntegration } from './ApiIntegration';
import { SubscriptionPage } from './SubscriptionPage';
import { UserAccount, CheckResult } from '@/types';

interface DashboardProps {
  onLogout: () => void;
  userAccount?: UserAccount;
  onUpgrade?: () => void;
  onCheckPerformed?: () => void;
  onUserAccountUpdate?: (updatedAccount: UserAccount) => void;
}

export function Dashboard({ onLogout, userAccount, onUpgrade, onCheckPerformed, onUserAccountUpdate }: DashboardProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [checkHistory, setCheckHistory] = useState<CheckResult[]>([]);

  const handleCheckResult = (result: CheckResult) => {
    // Add the new check result to the history
    setCheckHistory(prev => [result, ...prev]);
  };

  const handleAccountSubmission = (accountData: any) => {
    // In production, this would update your account database
    // For now, we'll just log it
    console.log('Bank account submitted:', accountData);
    
    // You could also add this to a separate account submissions list
    // that gets checked during account checks
  };

  const handleAccountUpdate = (updatedAccount: UserAccount) => {
    // Pass the updated account data up to the parent component
    if (onUserAccountUpdate) {
      onUserAccountUpdate(updatedAccount);
    }
  };

  const handleSubscriptionUpdate = (subscription: any) => {
    // Update the user account with subscription data
    if (onUserAccountUpdate && userAccount) {
      // Get product details from price ID
      let planDetails = {
        id: 'free',
        name: 'Free',
        price: '$0',
        period: '/month',
        checks: '10 monthly checks',
      };

      let checksLimit = 10;

      if (subscription?.price_id) {
        // Determine plan based on price_id
        if (subscription.price_id.includes('growth')) {
          planDetails = {
            id: 'growth',
            name: 'Growth',
            price: '$299',
            period: '/month',
            checks: '500 monthly checks',
          };
          checksLimit = 500;
        } else if (subscription.price_id.includes('pro')) {
          planDetails = {
            id: 'pro',
            name: 'Pro',
            price: '$999',
            period: '/month',
            checks: 'Unlimited monthly checks',
          };
          checksLimit = -1; // Unlimited
        }
      }

      const updatedAccount = {
        ...userAccount,
        plan: planDetails,
        checksLimit,
        subscriptionStatus: subscription?.subscription_status || 'not_started',
      };

      onUserAccountUpdate(updatedAccount);
    }
  };

  // Get the user's first name for the welcome message
  const getUserFirstName = () => {
    if (userAccount?.firstName) {
      return userAccount.firstName;
    }
    // Fallback to extracting from email if no first name
    if (userAccount?.email) {
      const emailPart = userAccount.email.split('@')[0];
      // Capitalize first letter
      return emailPart.charAt(0).toUpperCase() + emailPart.slice(1);
    }
    return 'User';
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text text-transparent mb-2">
                Welcome {getUserFirstName()}
              </h1>
              <p className="text-gray-600">Bank Account Risk Checker - Check bank account information for potential risk indicators</p>
            </div>
            <ManualFraudCheck 
              userAccount={userAccount}
              onUpgrade={onUpgrade}
              onCheckPerformed={onCheckPerformed}
              onCheckResult={handleCheckResult}
            />
          </div>
        );
      case 'submit':
        return <SubmitFraudAccount onSubmit={handleAccountSubmission} userAccount={userAccount} />;
      case 'results':
        return <CheckResults checkHistory={checkHistory} />;
      case 'api':
        return <ApiIntegration userAccount={userAccount} />;
      case 'account':
        return <Account userAccount={userAccount} onUpgrade={onUpgrade} onAccountUpdate={handleAccountUpdate} />;
      case 'subscription':
        return <SubscriptionPage onBack={() => setActiveSection('account')} userAccount={userAccount} onSubscriptionUpdate={handleSubscriptionUpdate} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      
      <div className="flex-1 flex flex-col">
        <Header onLogout={onLogout} />
        
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}