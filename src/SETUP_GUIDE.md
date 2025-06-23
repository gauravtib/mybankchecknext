# BankCheck Stripe Integration Setup Guide

## 🚀 Complete Setup Instructions

### Step 1: Update Environment Variables

I've updated your `.env` file with your Stripe publishable key. You still need to add:

```env
# Replace these with your actual values:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
STRIPE_SECRET_KEY=sk_test_51RZ76G2cyJcXN9CcYour_Secret_Key_Here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Step 2: Supabase Setup

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Create/Select Project**: Create new or select existing project
3. **Get API Keys**:
   - Go to Settings → API
   - Copy "Project URL" → Add to `VITE_SUPABASE_URL`
   - Copy "anon public" key → Add to `VITE_SUPABASE_ANON_KEY`
   - Copy "service_role" key → Add to `SUPABASE_SERVICE_ROLE_KEY`

### Step 3: Deploy Edge Functions

Run these commands in your terminal:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the edge functions
supabase functions deploy stripe-checkout
supabase functions deploy stripe-webhook
supabase functions deploy get-subscription
```

### Step 4: Create Stripe Products

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com
2. **Navigate to Products**: Products → Add Product
3. **Create these 3 products**:

   **Product 1: Free**
   - Name: "Free"
   - Description: "10 monthly bank account fraud checks"
   - Price: $0.00/month (recurring)
   - Copy the Price ID

   **Product 2: Growth**
   - Name: "Growth"  
   - Description: "500 monthly bank account fraud checks"
   - Price: $299.00/month (recurring)
   - Copy the Price ID

   **Product 3: Pro**
   - Name: "Pro"
   - Description: "Unlimited bank account monthly fraud checks"
   - Price: $999.00/month (recurring)
   - Copy the Price ID

4. **Update Price IDs**: Replace the price IDs in `src/stripe-config.ts` with your actual ones

### Step 5: Configure Stripe Webhook

1. **Go to Webhooks**: Stripe Dashboard → Developers → Webhooks
2. **Add Endpoint**: Click "Add endpoint"
3. **Endpoint URL**: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook`
4. **Select Events**:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. **Copy Webhook Secret**: Add to `STRIPE_WEBHOOK_SECRET` in `.env`

### Step 6: Test the Integration

1. **Restart Dev Server**: `npm run dev`
2. **Test Sign Up**: Create a new account
3. **Test Payment**: Try upgrading to Growth plan
4. **Use Test Card**: `4242 4242 4242 4242` with any future date and CVC
5. **Verify**: Check Stripe dashboard for customer and subscription

## 🔧 Troubleshooting

**Environment Variables Not Working?**
- Restart your dev server after updating `.env`
- Check for typos in variable names
- Ensure no extra spaces around values

**Edge Functions Not Deploying?**
- Make sure you're logged into Supabase CLI
- Verify project is linked correctly
- Check function logs in Supabase dashboard

**Webhook Not Receiving Events?**
- Verify webhook URL is correct
- Check that all required events are selected
- Test webhook in Stripe dashboard

**Payment Not Working?**
- Use Stripe test cards only in test mode
- Check browser console for errors
- Verify all environment variables are set

## 📞 Need Help?

If you encounter any issues:
1. Check the browser console for errors
2. Check Supabase function logs
3. Check Stripe webhook logs
4. Verify all environment variables are correct

The application will show configuration status on the payment page to help debug setup issues.