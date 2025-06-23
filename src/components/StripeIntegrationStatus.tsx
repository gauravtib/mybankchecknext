import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { hasSupabaseConfig } from '../lib/supabase';
import { isLiveMode } from '../stripe-config';

export function StripeIntegrationStatus() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorDetails, setErrorDetails] = useState<string[]>([]);

  useEffect(() => {
    checkIntegrationStatus();
  }, []);

  const checkIntegrationStatus = () => {
    const errors: string[] = [];
    
    // Check Stripe configuration
    const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!stripeKey) {
      errors.push('VITE_STRIPE_PUBLISHABLE_KEY is missing');
    } else if (!stripeKey.startsWith('pk_')) {
      errors.push('VITE_STRIPE_PUBLISHABLE_KEY is invalid (should start with pk_)');
    }
    
    // Check Supabase configuration
    if (!hasSupabaseConfig) {
      errors.push('Supabase configuration is missing or invalid');
    }
    
    // Set status based on errors
    if (errors.length > 0) {
      setStatus('error');
      setErrorDetails(errors);
    } else {
      setStatus('success');
    }
  };

  if (status === 'loading') {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg animate-pulse">
        <p className="text-gray-600">Checking integration status...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <span className="text-red-800 font-medium">Configuration Error</span>
        </div>
        <ul className="text-red-700 text-sm space-y-1 ml-7 list-disc">
          {errorDetails.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
        <div className="mt-3 text-sm">
          <a 
            href="/ENVIRONMENT_SETUP.md" 
            target="_blank" 
            className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
          >
            <span>View setup guide</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-center space-x-2">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <span className="text-green-800 font-medium">
          Stripe and Supabase are properly configured
        </span>
      </div>
      <p className="text-green-700 text-sm mt-2 ml-7">
        {isLiveMode() 
          ? '🔴 LIVE MODE: Using production Stripe keys' 
          : '🟡 TEST MODE: Using test Stripe keys'}
      </p>
    </div>
  );
}