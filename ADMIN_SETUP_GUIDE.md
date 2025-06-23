# Admin Panel Setup Guide

## Database Relationship Error Fix

If you're seeing the error "Could not find a relationship between 'stripe_customers' and 'stripe_subscriptions'", follow these steps:

### 1. Apply Database Migration

Run the migration file `supabase/migrations/fix_stripe_relationships.sql` in your Supabase dashboard:

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `fix_stripe_relationships.sql`
4. Click "Run" to execute the migration

### 2. Create Admin Users

The admin panel requires specific admin users to be created in Supabase Auth:

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User" 
3. Create users with these emails:
   - `admin@mybankcheck.com`
   - `support@mybankcheck.com` 
   - `dev@mybankcheck.com`
4. Set passwords for each user

### 3. Verify Database Schema

Ensure your database has these tables with proper relationships:

- `stripe_customers` (links to auth.users)
- `stripe_subscriptions` (links to stripe_customers via customer_id)
- `stripe_orders` (links to stripe_customers via customer_id)

### 4. Test Admin Access

1. Go to `/admin` on your deployed site
2. Login with one of the admin emails you created
3. The Users section should now show live data instead of demo data

### 5. Environment Variables

Make sure these are properly set in your `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 6. Troubleshooting

If you still see demo data:

1. Check the browser console for any Supabase connection errors
2. Verify your admin user email is in the allowed list
3. Ensure RLS policies are properly configured
4. Try refreshing the admin panel data using the "Refresh" button

### 7. Production Considerations

For production use:

1. Implement proper admin role management instead of hardcoded emails
2. Add more restrictive RLS policies
3. Consider adding audit logging for admin actions
4. Implement proper user management features

## Demo Mode

If Supabase is not configured, the admin panel will automatically fall back to demo mode with sample data. This is useful for development and testing.