export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'subscription' | 'payment';
}

// PRODUCTION STRIPE CONFIGURATION
// These are your LIVE Stripe price IDs for production deployment
export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_SVWY5eCHICgCVO',
    priceId: 'price_1RaVVPDc5FBFm4eohy4JqMQg', // Free - $0/month
    name: 'Free',
    description: '10 monthly checks',
    mode: 'subscription',
  },
  {
    id: 'prod_SVWYhDxDC149wu', 
    priceId: 'price_1RaVVaDc5FBFm4eoajAz798w', // Growth - $299/month
    name: 'Growth',
    description: '500 monthly checks',
    mode: 'subscription',
  },
  {
    id: 'prod_SVWYcEpflZjJ17',
    priceId: 'price_1RaVVqDc5FBFm4eoC0Drqsbi', // Pro - $999/month
    name: 'Pro',
    description: 'Unlimited monthly checks',
    mode: 'subscription',
  },
];

export function getProductByPriceId(priceId: string): StripeProduct | undefined {
  return stripeProducts.find(product => product.priceId === priceId);
}

export function getProductById(id: string): StripeProduct | undefined {
  return stripeProducts.find(product => product.id === id);
}

// Helper function to validate if we're using live keys
export function isLiveMode(): boolean {
  const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  return stripeKey && stripeKey.startsWith('pk_live_');
}

// Production validation
export function validateProductionConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  // Validate Stripe configuration for production
  if (!stripeKey || !stripeKey.startsWith('pk_live_')) {
    errors.push('VITE_STRIPE_PUBLISHABLE_KEY must be a LIVE publishable key (pk_live_...)');
  }
  
  // Validate Supabase configuration
  if (!supabaseUrl || !supabaseUrl.startsWith('https://')) {
    errors.push('VITE_SUPABASE_URL must be a valid HTTPS URL');
  }
  
  if (!supabaseKey || !supabaseKey.startsWith('eyJ')) {
    errors.push('VITE_SUPABASE_ANON_KEY must be a valid JWT token');
  }
  
  // Validate price IDs format
  stripeProducts.forEach(product => {
    if (!product.priceId.startsWith('price_')) {
      errors.push(`Invalid price ID format for ${product.name}: ${product.priceId}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}