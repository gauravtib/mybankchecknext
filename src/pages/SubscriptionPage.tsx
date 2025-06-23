import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { StripePaymentForm } from '../components/StripePaymentForm';
import { SubscriptionStatus } from '../components/SubscriptionStatus';
import { StripeProductList } from '../components/StripeProductList';
import { getSupabaseClient } from '../lib/supabase';

interface SubscriptionPageProps {
  onBack: () => void;
  userAccount?: any;
  onSubscriptionUpdate?: (subscription: any) => void;
}

export function SubscriptionPage({ onBack, userAccount, onSubscriptionUpdate }: SubscriptionPageProps) {
  const [view, setView] = useState<'overview' | 'upgrade'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        // Demo mode
        setSubscription(null);
        setIsLoading(false);
        return;
      }
      
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error('Authentication required');
      }
      
      // Call the get-subscription function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-subscription`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch subscription');
      }
      
      const { subscription: subscriptionData } = await response.json();
      setSubscription(subscriptionData);
      
      if (onSubscriptionUpdate) {
        onSubscriptionUpdate(subscriptionData);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setError(error.message || 'Failed to fetch subscription');
    } finally {
      setIsLoading(false);
    }
  };

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
    fetchSubscription();
  };

  const getCurrentPlanId = () => {
    if (!subscription) return 'free';
    
    // Determine plan based on price_id
    const priceId = subscription.price_id;
    if (!priceId) return 'free';
    
    if (priceId.includes('growth')) return 'growth';
    if (priceId.includes('pro')) return 'pro';
    return 'free';
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
                <SubscriptionStatus 
                  userId={userAccount?.id} 
                  onSubscriptionUpdate={onSubscriptionUpdate} 
                />
                
                <div className="mt-6">
                  <button
                    onClick={handleUpgradeClick}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    {subscription ? 'Change Plan' : 'Upgrade Plan'}
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

            <StripeProductList 
              currentPlan={getCurrentPlanId()} 
              showSubscribeButtons={false}
            />
          </div>
        </>
      ) : (
        <StripePaymentForm 
          onSuccess={handleUpgradeSuccess} 
          onCancel={handleCancelUpgrade}
          currentPlan={getCurrentPlanId()}
        />
      )}
    </div>
  );
}