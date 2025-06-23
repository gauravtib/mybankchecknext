import React from 'react';
import { StripeProductCard } from './StripeProductCard';
import { stripeProducts } from '../stripe-config';

interface StripeProductListProps {
  currentPlan?: string;
  onSelectPlan?: (planId: string) => void;
  selectedPlan?: string;
  showSubscribeButtons?: boolean;
}

export function StripeProductList({
  currentPlan,
  onSelectPlan,
  selectedPlan,
  showSubscribeButtons = false
}: StripeProductListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stripeProducts.map((product) => (
        <StripeProductCard
          key={product.id}
          product={product}
          isSelected={selectedPlan === product.id}
          isCurrentPlan={currentPlan === product.id}
          onSelect={onSelectPlan ? () => onSelectPlan(product.id) : undefined}
          showSubscribeButton={showSubscribeButtons}
        />
      ))}
    </div>
  );
}