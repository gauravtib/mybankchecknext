/*
  # Import Bank Accounts Data

  This migration creates a function to help import bank account data
  without using the problematic generate_random_string function.
*/

-- Create a function to help with the import process
CREATE OR REPLACE FUNCTION import_bank_account_data()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  import_customer_id text;
  account_key text;
BEGIN
  -- Get or create an import customer
  SELECT customer_id INTO import_customer_id 
  FROM stripe_customers 
  WHERE customer_id LIKE 'cus_import_%' 
  LIMIT 1;
  
  IF import_customer_id IS NULL THEN
    -- Create a new import customer with a random ID using md5
    INSERT INTO stripe_customers (user_id, customer_id, created_at, updated_at)
    VALUES (gen_random_uuid(), 'cus_import_' || substr(md5(random()::text), 1, 14), now(), now())
    RETURNING customer_id INTO import_customer_id;
  END IF;

  -- Log the import customer ID
  RAISE NOTICE 'Using import customer ID: %', import_customer_id;
  
  -- The actual import will be handled by the application layer
  -- This ensures proper data validation and formatting
  
  RAISE NOTICE 'Bank account import function created. Use application layer to import CSV data.';
END;
$$;

-- Add a comment explaining the import process
COMMENT ON FUNCTION import_bank_account_data() IS 'Function to import bank account data from CSV. Should be called from application layer with proper data validation.';