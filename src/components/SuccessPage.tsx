import React, { useEffect, useState } from 'react';
import { CheckCircle, ArrowRight, CreditCard } from 'lucide-react';
import { getProductByPriceId } from '../stripe-config';
import { hasSupabaseConfig, getSupabaseClient } from '../lib/supabase';

interface SuccessPageProps {
  onContinue: () => void;
}

export function SuccessPage({ onContinue }: SuccessPageProps) {
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        if (!hasSupabaseConfig) {
          setError('Supabase configuration is required to view subscription details.');
          setLoading(false);
          return;
        }

        const supabase = getSupabaseClient();
        if (!supabase) {
          setError('Failed to initialize Supabase client.');
          setLoading(false);
          return;
        }

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          setError('Please sign in to view your subscription details.');
          setLoading(false);
          return;
        }

        // Fetch user's subscription data
        const { data, error: subscriptionError } = await supabase
          .from('stripe_user_subscriptions')
          .select('*')
          .maybeSingle();

        if (subscriptionError) {
          console.error('Error fetching subscription:', subscriptionError);
          setError('Failed to load subscription details.');
        } else if (data) {
          // Get product details from price ID
          const product = getProductByPriceId(data.price_id);
          setSubscriptionData({
            ...data,
            product,
          });
        }
      } catch (err) {
        console.error('Error:', err);
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your subscription details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CreditCard className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Subscription</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={onContinue}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">
            Your subscription has been activated and you're ready to start using BankCheck.
          </p>
        </div>

        {/* Subscription Details */}
        {subscriptionData && subscriptionData.product && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Subscription Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-blue-700 mb-1">Plan</p>
                <p className="font-semibold text-blue-900">{subscriptionData.product.name}</p>
              </div>
              <div>
                <p className="text-sm text-blue-700 mb-1">Status</p>
                <p className="font-semibold text-blue-900 capitalize">
                  {subscriptionData.subscription_status.replace('_', ' ')}
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-700 mb-1">Description</p>
                <p className="font-semibold text-blue-900">{subscriptionData.product.description}</p>
              </div>
              {subscriptionData.current_period_end && (
                <div>
                  <p className="text-sm text-blue-700 mb-1">Next Billing Date</p>
                  <p className="font-semibold text-blue-900">
                    {new Date(subscriptionData.current_period_end * 1000).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* What's Next */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Next?</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-gray-700">Your account has been upgraded</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-gray-700">Start performing fraud checks immediately</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-gray-700">Access advanced reporting features</span>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={onContinue}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 mx-auto"
          >
            <span>Continue to Dashboard</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        {/* Support Notice */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Need help? Contact our support team at{' '}
            <a href="mailto:support@mybankcheck.com" className="text-blue-600 hover:text-blue-700">
              support@mybankcheck.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}