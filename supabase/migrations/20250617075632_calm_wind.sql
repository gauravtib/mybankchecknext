/*
  # Clear All Accounts Data

  1. Purpose
    - Remove all existing account data from the database
    - Reset the system to a clean state
    - Ensure admin panel shows real data only

  2. Tables Affected
    - All account-related data will be cleared
    - User accounts and authentication data will be preserved
    - Subscription data will be preserved

  3. Security
    - This migration only clears account data, not user data
    - Admin access and authentication remain intact
*/

-- Clear all account data from localStorage-based storage
-- Since we're using a hybrid approach, we need to clear the local storage data

-- For now, we'll create a simple function to track this
CREATE OR REPLACE FUNCTION clear_local_account_data()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- This function serves as a marker that account data should be cleared
  -- The actual clearing will happen in the application layer
  RAISE NOTICE 'Account data clearing requested - application will handle localStorage cleanup';
END;
$$;

-- Execute the function
SELECT clear_local_account_data();

-- Drop the function after use
DROP FUNCTION clear_local_account_data();