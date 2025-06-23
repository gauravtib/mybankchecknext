/*
  # Fix stripe_customers RLS policy to allow user insertions

  1. Security Updates
    - Add INSERT policy for stripe_customers table to allow users to create their own customer records
    - Add UPDATE policy for stripe_customers table to allow updates to their own records
    - Ensure the edge functions can properly create customer records during checkout

  2. Changes
    - Allow authenticated users to insert their own customer records
    - Allow authenticated users to update their own customer records
    - Maintain existing SELECT policy for viewing own data
*/

-- Add INSERT policy for stripe_customers to allow users to create their own customer records
CREATE POLICY "Users can insert their own customer data"
  ON stripe_customers
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Add UPDATE policy for stripe_customers to allow users to update their own customer records
CREATE POLICY "Users can update their own customer data"
  ON stripe_customers
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL)
  WITH CHECK (user_id = auth.uid() AND deleted_at IS NULL);

-- Also add INSERT and UPDATE policies for stripe_subscriptions
CREATE POLICY "Users can insert their own subscription data"
  ON stripe_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    customer_id IN (
      SELECT customer_id
      FROM stripe_customers
      WHERE user_id = auth.uid() AND deleted_at IS NULL
    )
  );

CREATE POLICY "Users can update their own subscription data"
  ON stripe_subscriptions
  FOR UPDATE
  TO authenticated
  USING (
    customer_id IN (
      SELECT customer_id
      FROM stripe_customers
      WHERE user_id = auth.uid() AND deleted_at IS NULL
    )
    AND deleted_at IS NULL
  )
  WITH CHECK (
    customer_id IN (
      SELECT customer_id
      FROM stripe_customers
      WHERE user_id = auth.uid() AND deleted_at IS NULL
    )
    AND deleted_at IS NULL
  );

-- Add INSERT and UPDATE policies for stripe_orders
CREATE POLICY "Users can insert their own order data"
  ON stripe_orders
  FOR INSERT
  TO authenticated
  WITH CHECK (
    customer_id IN (
      SELECT customer_id
      FROM stripe_customers
      WHERE user_id = auth.uid() AND deleted_at IS NULL
    )
  );

CREATE POLICY "Users can update their own order data"
  ON stripe_orders
  FOR UPDATE
  TO authenticated
  USING (
    customer_id IN (
      SELECT customer_id
      FROM stripe_customers
      WHERE user_id = auth.uid() AND deleted_at IS NULL
    )
    AND deleted_at IS NULL
  )
  WITH CHECK (
    customer_id IN (
      SELECT customer_id
      FROM stripe_customers
      WHERE user_id = auth.uid() AND deleted_at IS NULL
    )
    AND deleted_at IS NULL
  );