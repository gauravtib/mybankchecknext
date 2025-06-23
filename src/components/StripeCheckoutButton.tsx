import React, { useState } from 'react';
import { CreditCard, Loader } from 'lucide-react';
import { getSupabaseClient } from '../lib/supabase';

interface StripeCheckoutButtonProps {
  priceId: string;
  mode?: 'subscription' | 'payment';
  buttonText?: string;
  className?: string;
  disabled?: boolean;
  onSuccess?: (sessionId: string) => void;
  onError?: (error: Error) => void;
}

export function StripeCheckoutButton({
  priceId,
  mode = 'subscription',
  buttonText = 'Subscribe',
  className = '',
  disabled = false,
  onSuccess,
  onError
}: StripeCheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Supabase client not available');
      }
      
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error('Authentication required. Please sign in.');
      }
      
      // Call the Stripe checkout function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          price_id: priceId,
          mode: mode,
          success_url: `${window.location.origin}?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: window.location.href,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }
      
      const { sessionId } = await response.json();
      
      // Load Stripe.js dynamically
      const { loadStripe } = await import('@stripe/stripe-js');
      const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
      const stripe = await loadStripe(stripeKey);
      
      if (!stripe) {
        throw new Error('Failed to load Stripe');
      }
      
      // Redirect to Checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId,
      });
      
      if (error) {
        throw error;
      }
      
      if (onSuccess) {
        onSuccess(sessionId);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      if (onError) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={disabled || isLoading}
      className={`flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors ${className}`}
    >
      {isLoading ? (
        <>
          <Loader className="h-5 w-5 animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          <CreditCard className="h-5 w-5" />
          <span>{buttonText}</span>
        </>
      )}
    </button>
  );
}