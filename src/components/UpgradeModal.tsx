import React, { useState } from 'react';
import { X, Check, Zap } from 'lucide-react';
import { PaymentForm } from './PaymentForm';
import { getSupabaseClient } from '../lib/supabase';
import { stripeProducts } from '../stripe-config';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (planId: string) => void;
  currentPlan?: string;
}

export function UpgradeModal({ isOpen, onClose, onUpgrade, currentPlan = 'free' }: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState('growth');
  const [showPayment, setShowPayment] = useState(false);
  const [userSession, setUserSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use centralized stripe configuration
  const plans = [
    {
      id: 'growth',
      name: 'Growth',
      price: '$299',
      period: '/month',
      checks: '500 monthly checks',
      priceId: stripeProducts.find(p => p.name === 'Growth')?.priceId || '',
      popular: true,
      savings: null,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$999',
      period: '/month',
      checks: 'Unlimited checks',
      priceId: stripeProducts.find(p => p.name === 'Pro')?.priceId || '',
      popular: false,
      savings: 'Best Value',
    },
  ];

  const selectedPlanDetails = plans.find(p => p.id === selectedPlan);

  const handleContinueToPayment = async () => {
    console.log('=== CONTINUE TO PAYMENT CLICKED ===');
    console.log('Selected plan:', selectedPlan);
    console.log('Selected plan details:', selectedPlanDetails);
    
    if (!selectedPlanDetails) {
      setError('Please select a plan first.');
      return;
    }

    if (!selectedPlanDetails.priceId) {
      setError('Invalid plan configuration. Please contact support.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get current user session
      const supabase = getSupabaseClient();
      if (supabase) {
        console.log('Getting user session from Supabase...');
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw new Error(`Failed to get session: ${sessionError.message}`);
        }
        
        if (data.session) {
          console.log('Found valid session for user:', data.session.user?.email);
          // Set user session for payment form
          setUserSession(data.session);
          setShowPayment(true);
        } else {
          console.warn('No active session found');
          throw new Error('No active session found. Please sign in again.');
        }
      } else {
        console.log('No Supabase client, creating mock session for demo...');
        // Create a mock session for demo mode
        const mockSession = {
          access_token: 'demo_token',
          user: {
            id: 'demo_user_id',
            email: 'demo@example.com',
          }
        };
        setUserSession(mockSession);
        setShowPayment(true);
      }
    } catch (error: any) {
      console.error('Error getting session:', error);
      setError(error.message || 'Failed to initialize payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToPlanSelection = () => {
    console.log('Back to plan selection');
    setShowPayment(false);
    setUserSession(null);
    setError(null);
  };

  const handlePaymentSuccess = (planId: string) => {
    console.log('Payment successful for plan:', planId);
    onUpgrade(planId);
    setShowPayment(false);
    setUserSession(null);
    onClose();
  };

  const handleCancel = () => {
    console.log('Payment cancelled');
    setShowPayment(false);
    setUserSession(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        {/* Modal panel */}
        <div className="inline-block w-full max-w-6xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {showPayment ? 'Complete Payment' : 'Upgrade Your Plan'}
                </h3>
                <p className="text-gray-600">
                  {showPayment ? 'Secure payment processing' : 'Unlock more fraud checks and advanced features including full API access'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {showPayment ? (
            <PaymentForm
              selectedPlan={selectedPlanDetails!}
              onPaymentSuccess={handlePaymentSuccess}
              onCancel={handleBackToPlanSelection}
              userSession={userSession}
            />
          ) : (
            <>
              {/* Current plan notice */}
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">
                  <strong>Current Plan:</strong> Free (10 monthly checks) - You've reached your monthly limit
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              {/* Plan selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all ${
                      selectedPlan === plan.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => {
                      console.log('Plan selected:', plan.id);
                      setSelectedPlan(plan.id);
                      setError(null); // Clear any previous errors
                    }}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                          Most Popular
                        </span>
                      </div>
                    )}

                    {plan.savings && (
                      <div className="absolute -top-3 right-4">
                        <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                          {plan.savings}
                        </span>
                      </div>
                    )}
                    
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <div className="mb-4">
                        <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                        <span className="text-gray-600">{plan.period}</span>
                      </div>
                      <div className="text-blue-600 font-semibold text-lg">{plan.checks}</div>
                    </div>
                    
                    {selectedPlan === plan.id && (
                      <div className="absolute top-4 right-4">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Benefits highlight */}
              <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-3">What you get with your upgrade:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Immediate access to more checks</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Full API access with higher limits</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Priority customer support</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Advanced reporting features</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Webhook notifications</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Export capabilities</span>
                  </div>
                </div>
              </div>

              {/* Debug Information */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Debug Info:</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Selected Plan: {selectedPlan}</p>
                    <p>Plan Details: {selectedPlanDetails ? 'Found' : 'Not Found'}</p>
                    <p>Price ID: {selectedPlanDetails?.priceId || 'Missing'}</p>
                    <p>Is Loading: {isLoading ? 'Yes' : 'No'}</p>
                    <p>Has Error: {error ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex justify-between items-center">
                <button
                  onClick={onClose}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                  disabled={isLoading}
                >
                  Maybe Later
                </button>
                
                <button
                  onClick={handleContinueToPayment}
                  disabled={isLoading || !selectedPlanDetails || !selectedPlanDetails.priceId}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Loading...</span>
                    </>
                  ) : !selectedPlanDetails?.priceId ? (
                    <>
                      <span>Invalid Plan Configuration</span>
                    </>
                  ) : (
                    <>
                      <span>Continue to Payment</span>
                    </>
                  )}
                </button>
              </div>

              {/* Security notice */}
              <div className="mt-6 text-center text-xs text-gray-500">
                <p>🔒 Secure payment processing • Cancel anytime • 30-day money-back guarantee</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}