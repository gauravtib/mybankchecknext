'use client';

import React, { useState } from 'react';
import { CreditCard, CheckCircle, ArrowLeft } from 'lucide-react';
import { UserAccount } from '@/types';
import { mockProducts } from '@/data/mockData';

interface SubscriptionPageProps {
  onBack: () => void;
  userAccount?: UserAccount;
  onSubscriptionUpdate?: (subscription: any) => void;
}

export function SubscriptionPage({ onBack, userAccount, onSubscriptionUpdate }: SubscriptionPageProps) {
  const [view, setView] = useState<'overview' | 'upgrade'>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgradeClick = () => {
    setView('upgrade');
  };

  const handleCancelUpgrade = () => {
    setView('overview');
  };

  const handleUpgradeSuccess = (planId: string) => {
    // This will be handled by the webhook and subscription sync
    // Just go back to overview for now
    setView('overview');
  };

  const getCurrentPlanId = () => {
    if (!userAccount) return 'free';
    return userAccount.plan.id;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Subscription Management</h2>
          <p className="text-gray-600">Manage your subscription plan and billing</p>
        </div>
        
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
      </div>

      {view === 'overview' ? (
        <>
          {/* Current Subscription */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Current Subscription</h3>
            </div>

            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-10 bg-gray-200 rounded mb-4"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            ) : error ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span className="text-red-800 font-medium">{error}</span>
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    <span className="text-blue-800 font-medium">
                      Subscription Status: {userAccount?.subscriptionStatus || 'Active'}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-600">Current Plan:</p>
                      <p className="font-medium">{userAccount?.plan.name || 'Free'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Monthly Price:</p>
                      <p className="font-medium">{userAccount?.plan.price || '$0'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Monthly Checks:</p>
                      <p className="font-medium">{userAccount?.plan.checks || '10 monthly checks'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Checks Used:</p>
                      <p className="font-medium">{userAccount?.checksUsed || 0} / {userAccount?.checksLimit === -1 ? '∞' : userAccount?.checksLimit || 10}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    onClick={handleUpgradeClick}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    {getCurrentPlanId() === 'free' ? 'Upgrade Plan' : 'Change Plan'}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Available Plans */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Available Plans</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {mockProducts.map((product) => (
                <div 
                  key={product.id}
                  className={`relative border-2 rounded-xl p-6 ${
                    getCurrentPlanId() === product.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200'
                  }`}
                >
                  {getCurrentPlanId() === product.id && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                        Current Plan
                      </span>
                    </div>
                  )}
                  
                  <div className={`text-center ${getCurrentPlanId() === product.id ? 'pt-4' : ''}`}>
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
                    
                    {getCurrentPlanId() !== product.id && (
                      <button
                        onClick={handleUpgradeClick}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        {product.name === 'Free' ? 'Downgrade to Free' : `Upgrade to ${product.name}`}
                      </button>
                    )}
                    
                    {getCurrentPlanId() === product.id && (
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
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Upgrade Your Plan</h3>
          </div>

          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Feature</h3>
            <p className="text-gray-500 mb-6">
              The payment feature is available in the full version of the application.
            </p>
            <button
              onClick={handleCancelUpgrade}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Back to Subscription Overview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}