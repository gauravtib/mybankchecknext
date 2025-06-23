/*
  # Fix Stripe table relationships

  1. Tables
    - Ensure proper foreign key relationships between stripe_customers and stripe_subscriptions
    - Add missing indexes for better performance
    - Ensure RLS policies are properly configured

  2. Security
    - Verify RLS is enabled on all tables
    - Ensure proper policies for admin access
*/

-- Ensure the foreign key relationship exists between stripe_subscriptions and stripe_customers
DO $$
BEGIN
  -- Check if foreign key constraint exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'stripe_subscriptions_customer_id_fkey'
    AND table_name = 'stripe_subscriptions'
  ) THEN
    -- Add the foreign key constraint
    ALTER TABLE stripe_subscriptions 
    ADD CONSTRAINT stripe_subscriptions_customer_id_fkey 
    FOREIGN KEY (customer_id) REFERENCES stripe_customers(customer_id);
  END IF;
END $$;

-- Ensure the foreign key relationship exists between stripe_orders and stripe_customers
DO $$
BEGIN
  -- Check if foreign key constraint exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'stripe_orders_customer_id_fkey'
    AND table_name = 'stripe_orders'
  ) THEN
    -- Add the foreign key constraint
    ALTER TABLE stripe_orders 
    ADD CONSTRAINT stripe_orders_customer_id_fkey 
    FOREIGN KEY (customer_id) REFERENCES stripe_customers(customer_id);
  END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_customer_id ON stripe_subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_status ON stripe_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_stripe_orders_customer_id ON stripe_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_stripe_customers_user_id ON stripe_customers(user_id);

-- Ensure RLS is enabled on all tables
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_orders ENABLE ROW LEVEL SECURITY;

-- Add admin policies for full access (for admin panel)
-- Note: In production, you'd want more restrictive policies based on admin roles

-- Admin policy for stripe_customers
DROP POLICY IF EXISTS "Admin full access to stripe_customers" ON stripe_customers;
CREATE POLICY "Admin full access to stripe_customers"
  ON stripe_customers
  FOR ALL
  TO authenticated
  USING (
    -- Check if user is admin (you can customize this logic)
    auth.jwt() ->> 'email' IN (
      'admin@mybankcheck.com',
      'support@mybankcheck.com', 
      'dev@mybankcheck.com'
    )
  );

-- Admin policy for stripe_subscriptions
DROP POLICY IF EXISTS "Admin full access to stripe_subscriptions" ON stripe_subscriptions;
CREATE POLICY "Admin full access to stripe_subscriptions"
  ON stripe_subscriptions
  FOR ALL
  TO authenticated
  USING (
    -- Check if user is admin
    auth.jwt() ->> 'email' IN (
      'admin@mybankcheck.com',
      'support@mybankcheck.com',
      'dev@mybankcheck.com'
    )
  );

-- Admin policy for stripe_orders
DROP POLICY IF EXISTS "Admin full access to stripe_orders" ON stripe_orders;
CREATE POLICY "Admin full access to stripe_orders"
  ON stripe_orders
  FOR ALL
  TO authenticated
  USING (
    -- Check if user is admin
    auth.jwt() ->> 'email' IN (
      'admin@mybankcheck.com',
      'support@mybankcheck.com',
      'dev@mybankcheck.com'
    )
  );

-- Update the stripe_user_subscriptions view to ensure proper joins
DROP VIEW IF EXISTS stripe_user_subscriptions;
CREATE VIEW stripe_user_subscriptions AS
SELECT 
  sc.customer_id,
  ss.subscription_id,
  ss.status as subscription_status,
  ss.price_id,
  ss.current_period_start,
  ss.current_period_end,
  ss.cancel_at_period_end,
  ss.payment_method_brand,
  ss.payment_method_last4,
  sc.user_id
FROM stripe_customers sc
LEFT JOIN stripe_subscriptions ss ON sc.customer_id = ss.customer_id
WHERE sc.deleted_at IS NULL 
  AND (ss.deleted_at IS NULL OR ss.deleted_at IS NOT NULL);

-- Update the stripe_user_orders view to ensure proper joins
DROP VIEW IF EXISTS stripe_user_orders;
CREATE VIEW stripe_user_orders AS
SELECT 
  sc.customer_id,
  so.id as order_id,
  so.checkout_session_id,
  so.payment_intent_id,
  so.amount_subtotal,
  so.amount_total,
  so.currency,
  so.payment_status,
  so.status as order_status,
  so.created_at as order_date,
  sc.user_id
FROM stripe_customers sc
LEFT JOIN stripe_orders so ON sc.customer_id = so.customer_id
WHERE sc.deleted_at IS NULL 
  AND (so.deleted_at IS NULL OR so.deleted_at IS NOT NULL);