import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { getSupabaseClient } from '../lib/supabase';
import { getProductByPriceId } from '../stripe-config';

interface SubscriptionStatusProps {
  userId?: string;
  onSubscriptionUpdate?: (subscription: any) => void;
}

export function SubscriptionStatus({ userId, onSubscriptionUpdate }: SubscriptionStatusProps) {
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, [userId]);

  const fetchSubscription = async () => {
    if (isRefreshing) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
    
    setError(null);
    
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Supabase client not available');
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
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchSubscription();
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'trialing':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'past_due':
      case 'incomplete':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'canceled':
      case 'unpaid':
      case 'incomplete_expired':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'trialing':
        return 'Trial';
      case 'past_due':
        return 'Past Due';
      case 'incomplete':
        return 'Incomplete';
      case 'canceled':
        return 'Canceled';
      case 'unpaid':
        return 'Unpaid';
      case 'incomplete_expired':
        return 'Expired';
      default:
        return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg animate-pulse">
        <p className="text-gray-600">Loading subscription status...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <span className="text-red-800 font-medium">Error</span>
        </div>
        <p className="text-red-700 text-sm">{error}</p>
        <button
          onClick={handleRefresh}
          className="mt-2 text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5 text-gray-600" />
          <span className="text-gray-800 font-medium">No active subscription</span>
        </div>
        <p className="text-gray-600 text-sm mt-2">
          You are currently on the Free plan with limited features.
        </p>
      </div>
    );
  }

  // Get product details from price ID
  const product = getProductByPriceId(subscription.price_id);

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5 text-blue-600" />
          <span className="text-blue-800 font-medium">
            {product ? product.name : 'Unknown'} Plan
          </span>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(subscription.subscription_status)}`}>
          {getStatusText(subscription.subscription_status)}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm mt-3">
        <div>
          <p className="text-gray-600">Next billing date:</p>
          <p className="font-medium">{formatDate(subscription.current_period_end)}</p>
        </div>
        
        {subscription.payment_method_last4 && (
          <div>
            <p className="text-gray-600">Payment method:</p>
            <p className="font-medium">
              {subscription.payment_method_brand ? subscription.payment_method_brand.charAt(0).toUpperCase() + subscription.payment_method_brand.slice(1) : 'Card'} •••• {subscription.payment_method_last4}
            </p>
          </div>
        )}
      </div>
      
      <div className="mt-3 text-sm">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="text-blue-600 hover:text-blue-800 flex items-center space-x-1 disabled:opacity-50"
        >
          {isRefreshing ? (
            <>
              <RefreshCw className="h-3 w-3 animate-spin" />
              <span>Refreshing...</span>
            </>
          ) : (
            <>
              <RefreshCw className="h-3 w-3" />
              <span>Refresh</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}