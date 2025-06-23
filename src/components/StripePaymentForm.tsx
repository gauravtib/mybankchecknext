import React, { useState, useEffect } from 'react';
import { CreditCard, AlertTriangle, CheckCircle, Shield } from 'lucide-react';
import { StripeIntegrationStatus } from './StripeIntegrationStatus';
import { StripeProductList } from './StripeProductList';
import { getSupabaseClient } from '../lib/supabase';
import { stripeProducts } from '../stripe-config';

interface StripePaymentFormProps {
  onSuccess?: (planId: string) => void;
  onCancel?: () => void;
  currentPlan?: string;
}

export function StripePaymentForm({ onSuccess, onCancel, currentPlan = 'free' }: StripePaymentFormProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>(currentPlan === 'free' ? 'growth' : 'pro');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userSession, setUserSession] = useState<any>(null);

  useEffect(() => {
    // Get current user session
    const getUserSession = async () => {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setUserSession(data.session);
        }
      }
    };

    getUserSession();
  }, []);

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      const selectedProduct = stripeProducts.find(p => p.id === selectedPlan);
      if (!selectedProduct) {
        throw new Error('Invalid plan selected');
      }

      // Load Stripe.js dynamically
      const { loadStripe } = await import('@stripe/stripe-js');
      const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
      const stripe = await loadStripe(stripeKey);
      
      if (!stripe) {
        throw new Error('Failed to load Stripe');
      }

      const supabase = getSupabaseClient();
      if (!supabase || !userSession) {
        throw new Error('Authentication required');
      }

      // Call the Stripe checkout function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userSession.access_token}`,
        },
        body: JSON.stringify({
          price_id: selectedProduct.priceId,
          mode: selectedProduct.mode,
          success_url: `${window.location.origin}?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: window.location.href,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }
      
      const { sessionId } = await response.json();
      
      // Redirect to Checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId,
      });
      
      if (error) {
        throw error;
      }
      
      if (onSuccess) {
        onSuccess(selectedPlan);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upgrade Your Plan</h2>
        <p className="text-gray-600">Choose a plan that fits your needs</p>
      </div>

      {/* Stripe Integration Status */}
      <StripeIntegrationStatus />

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-red-800 font-medium">{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Plan Selection */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select a Plan</h3>
          <StripeProductList 
            currentPlan={currentPlan} 
            selectedPlan={selectedPlan} 
            onSelectPlan={handlePlanSelect} 
          />
        </div>

        {/* Security Notice */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-gray-600" />
            <span className="text-gray-800 font-medium">Secure Payment Processing</span>
          </div>
          <p className="text-gray-600 text-sm mt-2 ml-7">
            Your payment information is processed securely by Stripe. We never store your credit card details.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isProcessing || !userSession}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
            ) : !userSession ? (
              <>
                <span>Authentication Required</span>
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                <span>Proceed to Payment</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}