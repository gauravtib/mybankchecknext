'use client';

import React from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';

interface SuccessPageProps {
  onContinue: () => void;
}

export function SuccessPage({ onContinue }: SuccessPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Success!</h1>
          <p className="text-gray-600">
            Your account has been activated and you're ready to start using BankCheck.
          </p>
        </div>

        {/* What's Next */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Next?</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-gray-700">Your account has been created</span>
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