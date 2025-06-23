# 🔧 Environment Variables Setup Guide

## The Problem
You're seeing this error because your environment variables are not properly configured:

```
Required environment variables:
VITE_STRIPE_PUBLISHABLE_KEY (currently: ${VITE_STRIPE_PUBLISHABLE_KEY})
```

This means the variable is not being read from your `.env` file.

## ✅ Quick Fix

### Step 1: Check Your .env File
Make sure you have a `.env` file in your project root (same level as `package.json`):

```
your-project/
├── .env                 ← This file should exist
├── package.json
├── src/
└── ...
```

### Step 2: Update Your .env File
Copy this template and replace with your actual values:

```env
# Supabase Configuration (Get from https://supabase.com/dashboard)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_actual_key_here

# Stripe Configuration (Get from https://dashboard.stripe.com/apikeys)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51RZ76G2cyJcXN9CcYour_Actual_Key_Here

# Server-side variables (for edge functions)
STRIPE_SECRET_KEY=sk_test_51RZ76G2cyJcXN9CcYour_Secret_Key_Here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_service_role_key_here
```

### Step 3: Get Your Actual Keys

**Supabase Keys:**
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project (or create one)
3. Go to Settings → API
4. Copy:
   - Project URL → `VITE_SUPABASE_URL`
   - anon public key → `VITE_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

**Stripe Keys:**
1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Make sure you're in "Test mode" (toggle in top right)
3. Go to Developers → API keys
4. Copy:
   - Publishable key → `VITE_STRIPE_PUBLISHABLE_KEY`
   - Secret key → `STRIPE_SECRET_KEY`

### Step 4: Restart Development Server
After updating your `.env` file:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## 🔍 Verification

After restarting, the payment page should show:
- ✅ Green message: "Stripe and Supabase are properly configured"
- Instead of ❌ Red error about missing variables

## 🚨 Common Issues

**Issue 1: Variables still showing as ${VARIABLE_NAME}**
- Solution: Make sure there are no spaces around the `=` in your `.env` file
- Correct: `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_123`
- Wrong: `VITE_STRIPE_PUBLISHABLE_KEY = pk_test_123`

**Issue 2: .env file not being read**
- Make sure the file is named exactly `.env` (not `.env.txt`)
- Make sure it's in the project root directory
- Restart your development server

**Issue 3: Keys look correct but still not working**
- Check that Supabase URL starts with `https://`
- Check that Supabase anon key starts with `eyJ`
- Check that Stripe key starts with `pk_test_` (for test mode)

## 📞 Still Need Help?

If you're still having issues:
1. Check the browser console for any error messages
2. Verify your `.env` file is in the correct location
3. Make sure you restarted the development server
4. Double-check that you copied the keys correctly (no extra spaces or characters)

The application will show you exactly which variables are missing or incorrectly formatted on the payment page.