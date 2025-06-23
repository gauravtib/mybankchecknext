import React, { useState, useEffect } from 'react';
import { CreditCard, Lock, AlertCircle, CheckCircle, Shield, AlertTriangle } from 'lucide-react';
import { hasSupabaseConfig, getSupabaseClient } from '../lib/supabase';
import { stripeProducts, validateProductionConfig, isLiveMode } from '../stripe-config';

// Check if Stripe is configured
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const hasStripeConfig = stripeKey && stripeKey.startsWith('pk_');

interface PaymentFormProps {
  selectedPlan: {
    id: string;
    name: string;
    price: string;
    period: string;
    checks: string;
    priceId?: string;
  };
  onPaymentSuccess: (planId: string) => void;
  onCancel: () => void;
  userSession?: any;
}

export function PaymentForm({ selectedPlan, onPaymentSuccess, onCancel, userSession }: PaymentFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [stripe, setStripe] = useState<any>(null);
  const [initializationComplete, setInitializationComplete] = useState(false);
  const [productionValidation, setProductionValidation] = useState<{ isValid: boolean; errors: string[] }>({ isValid: true, errors: [] });

  // Initialize Stripe and validate production config
  useEffect(() => {
    const initializeServices = async () => {
      console.log('Initializing payment services for PRODUCTION...');
      
      // Validate production configuration
      const validation = validateProductionConfig();
      setProductionValidation(validation);
      
      if (!validation.isValid) {
        console.error('Production configuration errors:', validation.errors);
        setErrors({ general: 'Production configuration errors detected. Please check environment variables.' });
      }
      
      try {
        // Initialize Stripe
        if (hasStripeConfig) {
          console.log('Loading Stripe with key:', stripeKey?.substring(0, 20) + '...');
          console.log('Stripe mode:', isLiveMode() ? 'LIVE (Production)' : 'TEST (Development)');
          
          const { loadStripe } = await import('@stripe/stripe-js');
          const stripeInstance = await loadStripe(stripeKey);
          setStripe(stripeInstance);
          console.log('Stripe initialized successfully');
        } else {
          console.warn('Stripe not configured properly');
        }
        
        setInitializationComplete(true);
      } catch (error) {
        console.error('Failed to initialize services:', error);
        setErrors({ general: 'Failed to initialize payment services. Please refresh and try again.' });
        setInitializationComplete(true);
      }
    };

    initializeServices();
  }, []);

  // Debug environment variables
  useEffect(() => {
    console.log('=== PRODUCTION ENVIRONMENT STATUS ===');
    console.log('Stripe Mode:', isLiveMode() ? 'LIVE (Production)' : 'TEST (Development)');
    console.log('VITE_STRIPE_PUBLISHABLE_KEY:', stripeKey ? `${stripeKey.substring(0, 20)}...` : 'Missing');
    console.log('hasStripeConfig:', hasStripeConfig);
    console.log('hasSupabaseConfig:', hasSupabaseConfig);
    console.log('userSession provided:', !!userSession);
    console.log('Selected plan:', selectedPlan.name, selectedPlan.priceId);
    
    if (userSession) {
      console.log('User session details:', {
        hasAccessToken: !!userSession.access_token,
        hasUser: !!userSession.user,
        userEmail: userSession.user?.email || 'No email'
      });
    }
    
    // Log production validation
    const validation = validateProductionConfig();
    if (!validation.isValid) {
      console.error('❌ PRODUCTION VALIDATION FAILED:', validation.errors);
    } else {
      console.log('✅ Production configuration validated successfully');
    }
  }, [userSession]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== PRODUCTION PAYMENT FLOW INITIATED ===');
    console.log('User session provided:', !!userSession);
    console.log('Stripe loaded:', !!stripe);
    console.log('Live mode:', isLiveMode());
    
    // Validate production configuration first
    if (!productionValidation.isValid) {
      setErrors({ 
        general: `Production configuration errors: ${productionValidation.errors.join(', ')}` 
      });
      return;
    }
    
    if (!hasStripeConfig || !hasSupabaseConfig) {
      const missingServices = [];
      if (!hasStripeConfig) missingServices.push('Stripe (Live Keys Required)');
      if (!hasSupabaseConfig) missingServices.push('Supabase (Production)');
      
      setErrors({ 
        general: `Production deployment requires ${missingServices.join(' and ')} configuration.` 
      });
      return;
    }

    if (!stripe) {
      setErrors({ general: 'Stripe payment services are not loaded yet. Please try again.' });
      return;
    }

    if (!userSession) {
      console.error('No user session provided for payment');
      setErrors({ general: 'Authentication session not found. Please try the signup process again.' });
      return;
    }

    // Validate we're using live keys in production
    if (!isLiveMode()) {
      setErrors({ 
        general: 'Production deployment requires LIVE Stripe keys (pk_live_...). Currently using test keys.' 
      });
      return;
    }

    setIsProcessing(true);
    setErrors({});

    try {
      console.log('Creating checkout session with LIVE Stripe keys...');
      
      // Get the price ID for the selected plan
      const priceId = selectedPlan.priceId || getPriceIdForPlan(selectedPlan.id);
      
      if (!priceId) {
        throw new Error('Invalid plan selected. Please try again.');
      }

      console.log('Using LIVE price ID:', priceId);
      console.log('User session access token available:', !!userSession.access_token);

      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Failed to initialize Supabase client.');
      }

      // Create checkout session using the provided user session
      console.log('Making request to stripe-checkout function...');
      console.log('Request URL:', `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`);
      
      const requestBody = {
        price_id: priceId,
        mode: 'subscription',
        success_url: `${window.location.origin}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: window.location.href,
      };
      
      console.log('Request body:', requestBody);

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userSession.access_token}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Checkout session response status:', response.status);
      console.log('Checkout session response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Checkout session error response:', errorText);
        
        let errorMessage = 'Failed to create checkout session';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
          console.error('Parsed error data:', errorData);
        } catch (parseError) {
          console.error('Could not parse error response:', parseError);
          errorMessage = `Server error (${response.status}): ${errorText}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Checkout session response data:', data);

      if (!data.sessionId) {
        throw new Error('No session ID received from server');
      }

      console.log('Redirecting to Stripe checkout with session ID:', data.sessionId);
      console.log('Using LIVE Stripe checkout...');
      
      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (error) {
        console.error('Stripe redirect error:', error);
        throw new Error(error.message || 'Failed to redirect to checkout');
      }
      
    } catch (error: any) {
      console.error('Payment error:', error);
      setErrors({ general: error.message || 'Payment failed. Please try again.' });
      setIsProcessing(false);
    }
  };

  const getPriceIdForPlan = (planId: string): string | null => {
    // Use the centralized stripe configuration
    const product = stripeProducts.find(p => p.name.toLowerCase() === planId.toLowerCase());
    return product?.priceId || null;
  };

  if (paymentSuccess) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
        <p className="text-gray-600 mb-4">
          Welcome to the {selectedPlan.name} plan. Your account has been upgraded.
        </p>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  // Show loading state while initializing services
  if (!initializationComplete) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Initializing production payment services...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Subscription</h2>
        <p className="text-gray-600">
          Secure payment processing powered by Stripe {isLiveMode() ? '(Live Mode)' : '(Test Mode)'}
        </p>
      </div>

      {/* Plan Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-blue-900">{selectedPlan.name} Plan</h3>
            <p className="text-blue-700">{selectedPlan.checks}</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-blue-900">{selectedPlan.price}</span>
            <span className="text-blue-700">{selectedPlan.period}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Production Validation Errors */}
        {!productionValidation.isValid && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-red-800 font-medium">Production Configuration Errors</span>
            </div>
            <ul className="text-red-700 text-sm space-y-1">
              {productionValidation.errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Error Message */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-800">{errors.general}</span>
            </div>
          </div>
        )}

        {/* Production Mode Indicator */}
        <div className={`border rounded-lg p-4 ${isLiveMode() ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
          <div className="flex items-center space-x-2">
            <Shield className={`h-5 w-5 ${isLiveMode() ? 'text-green-600' : 'text-yellow-600'}`} />
            <span className={`font-medium ${isLiveMode() ? 'text-green-800' : 'text-yellow-800'}`}>
              {isLiveMode() ? '🔴 LIVE MODE - Production Payment Processing' : '🟡 TEST MODE - Development Environment'}
            </span>
          </div>
          <p className={`text-sm mt-1 ${isLiveMode() ? 'text-green-700' : 'text-yellow-700'}`}>
            {isLiveMode() 
              ? 'Real payments will be processed. Credit cards will be charged.'
              : 'Test mode active. Use test credit cards only.'
            }
          </p>
        </div>

        {/* Session Status */}
        {userSession ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800">
                ✅ Authenticated as {userSession.user?.email || 'user@example.com'}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-800">
                ❌ No authentication session provided. Please restart the signup process.
              </span>
            </div>
          </div>
        )}

        {/* Configuration Status */}
        {hasStripeConfig && hasSupabaseConfig && productionValidation.isValid ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800">
                ✅ Production configuration validated. Ready for live payments!
              </span>
            </div>
            <div className="mt-2 text-sm text-green-700">
              <p>• Stripe: {isLiveMode() ? 'Live keys configured' : 'Test keys (switch to live for production)'}</p>
              <p>• Supabase: Production database connected</p>
              <p>• Price IDs: Validated and ready</p>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-800 font-medium">
                ❌ Production Configuration Required
              </span>
            </div>
            <div className="text-sm text-red-700 space-y-2">
              <p><strong>For production deployment, ensure:</strong></p>
              <div className="bg-red-100 p-3 rounded border font-mono text-xs">
                <div className="mb-2">
                  <span className={hasStripeConfig && isLiveMode() ? 'text-green-600' : 'text-red-600'}>
                    {hasStripeConfig && isLiveMode() ? '✅' : '❌'} VITE_STRIPE_PUBLISHABLE_KEY (pk_live_...)
                  </span>
                  <br />
                  <span className="text-gray-600">Currently: {stripeKey?.substring(0, 30) || 'not set'}...</span>
                </div>
                <div className="mb-2">
                  <span className={hasSupabaseConfig ? 'text-green-600' : 'text-red-600'}>
                    {hasSupabaseConfig ? '✅' : '❌'} VITE_SUPABASE_URL
                  </span>
                  <br />
                  <span className="text-gray-600">Currently: {import.meta.env.VITE_SUPABASE_URL || 'not set'}</span>
                </div>
                <div className="mb-2">
                  <span className={hasSupabaseConfig ? 'text-green-600' : 'text-red-600'}>
                    {hasSupabaseConfig ? '✅' : '❌'} VITE_SUPABASE_ANON_KEY
                  </span>
                  <br />
                  <span className="text-gray-600">Currently: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'configured' : 'not set'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Price ID Information */}
        {hasStripeConfig && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <span className="text-blue-800 font-medium">Payment Details</span>
            </div>
            <div className="text-sm text-blue-700">
              <p><strong>Plan:</strong> {selectedPlan.name}</p>
              <p><strong>Price ID:</strong> <code className="bg-blue-100 px-1 rounded">{selectedPlan.priceId || getPriceIdForPlan(selectedPlan.id)}</code></p>
              <p><strong>Mode:</strong> {isLiveMode() ? 'Live (Production)' : 'Test (Development)'}</p>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Lock className="h-4 w-4 text-green-600" />
            <span>
              Your payment information is encrypted and secure. We use Stripe for payment processing.
              {isLiveMode() && ' This is a live transaction.'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            disabled={isProcessing}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isProcessing || !hasStripeConfig || !hasSupabaseConfig || !userSession || !productionValidation.isValid}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Processing {isLiveMode() ? 'Live' : 'Test'} Payment...</span>
              </>
            ) : !hasStripeConfig || !hasSupabaseConfig ? (
              <>
                <Lock className="h-5 w-5" />
                <span>Configuration Required</span>
              </>
            ) : !userSession ? (
              <>
                <Lock className="h-5 w-5" />
                <span>Authentication Required</span>
              </>
            ) : !productionValidation.isValid ? (
              <>
                <AlertTriangle className="h-5 w-5" />
                <span>Fix Configuration</span>
              </>
            ) : (
              <>
                <Lock className="h-5 w-5" />
                <span>Subscribe to {selectedPlan.name} - {selectedPlan.price}{selectedPlan.period}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}