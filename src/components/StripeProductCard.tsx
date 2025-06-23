import React from 'react';
import { Check, CreditCard } from 'lucide-react';
import { StripeProduct } from '../stripe-config';
import { StripeCheckoutButton } from './StripeCheckoutButton';

interface StripeProductCardProps {
  product: StripeProduct;
  isSelected?: boolean;
  isCurrentPlan?: boolean;
  onSelect?: () => void;
  showSubscribeButton?: boolean;
}

export function StripeProductCard({
  product,
  isSelected = false,
  isCurrentPlan = false,
  onSelect,
  showSubscribeButton = false
}: StripeProductCardProps) {
  // Format price from description
  const formatPrice = () => {
    if (product.name === 'Free') return '$0';
    if (product.name === 'Growth') return '$299';
    if (product.name === 'Pro') return '$999';
    return '$0';
  };

  return (
    <div 
      className={`relative border-2 rounded-xl p-6 transition-all ${
        isSelected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 hover:border-gray-300'
      } ${onSelect ? 'cursor-pointer' : ''}`}
      onClick={onSelect}
    >
      {isSelected && (
        <div className="absolute top-4 right-4">
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
            <Check className="h-4 w-4 text-white" />
          </div>
        </div>
      )}
      
      {isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium">
            Current Plan
          </span>
        </div>
      )}
      
      <div className={`text-center ${isCurrentPlan ? 'pt-4' : ''}`}>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
        <div className="mb-4">
          <span className="text-3xl font-bold text-gray-900">{formatPrice()}</span>
          <span className="text-gray-600">/month</span>
        </div>
        <div className="text-blue-600 font-semibold text-lg mb-4">{product.description}</div>
        
        {showSubscribeButton && !isCurrentPlan && (
          <StripeCheckoutButton
            priceId={product.priceId}
            mode={product.mode}
            buttonText={product.name === 'Free' ? 'Start Free' : `Subscribe to ${product.name}`}
            className="w-full mt-4"
          />
        )}
        
        {isCurrentPlan && (
          <div className="mt-4 inline-flex items-center px-3 py-1 rounded-lg bg-green-100 text-green-800 border border-green-200">
            <Check className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">Active Plan</span>
          </div>
        )}
      </div>
    </div>
  );
}