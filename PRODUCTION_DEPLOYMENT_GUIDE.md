# MyBankCheck Production Deployment Guide

This guide will walk you through deploying MyBankCheck to production on the mybankcheck.com domain.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Supabase Configuration](#supabase-configuration)
4. [Stripe Configuration](#stripe-configuration)
5. [Building for Production](#building-for-production)
6. [Deployment Options](#deployment-options)
7. [Domain Configuration](#domain-configuration)
8. [Post-Deployment Tasks](#post-deployment-tasks)
9. [Admin Panel Setup](#admin-panel-setup)
10. [Monitoring and Maintenance](#monitoring-and-maintenance)

## Prerequisites

Before deploying, ensure you have:

- A Supabase account with a production project
- A Stripe account with production API keys
- Access to domain registrar for mybankcheck.com
- Node.js 18+ installed locally

## Environment Setup

### 1. Create Production Environment File

Create a `.env.production` file with your production credentials:

```env
# Supabase Production Configuration
VITE_SUPABASE_URL=https://your-production-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key

# Stripe Production Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key

# Server-side environment variables (for edge functions)
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
```

### 2. Update Stripe Configuration

Update the price IDs in `src/stripe-config.ts` to match your production Stripe products:

```typescript
export const stripeProducts: StripeProduct[] = [
  {
    id: 'your_free_product_id',
    priceId: 'your_free_price_id',
    name: 'Free',
    description: '10 monthly bank account fraud checks.',
    mode: 'subscription',
  },
  {
    id: 'your_growth_product_id',
    priceId: 'your_growth_price_id',
    name: 'Growth',
    description: '500 monthly bank account fraud checks',
    mode: 'subscription',
  },
  {
    id: 'your_pro_product_id',
    priceId: 'your_pro_price_id',
    name: 'Pro',
    description: 'Unlimited bank account monthly fraud checks.',
    mode: 'subscription',
  },
];
```

## Supabase Configuration

### 1. Create Production Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project for production
3. Note your project URL and API keys

### 2. Apply Database Migrations

1. Navigate to SQL Editor in your Supabase dashboard
2. Run the migration files from `supabase/migrations/` in order:
   - First run `20250612091453_bright_pebble.sql`
   - Then run `20250615065650_falling_bar.sql`

### 3. Create Admin Users

Create admin users in Supabase Auth:

1. Go to Authentication → Users → Add User
2. Create these admin accounts:
   - admin@mybankcheck.com
   - support@mybankcheck.com
   - dev@mybankcheck.com
3. Set secure passwords for each

### 4. Deploy Edge Functions

Deploy the Supabase Edge Functions:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your production project
supabase link --project-ref your_production_project_ref

# Deploy the edge functions
supabase functions deploy stripe-checkout
supabase functions deploy stripe-webhook
supabase functions deploy get-subscription
```

## Stripe Configuration

### 1. Create Production Products

In your Stripe Dashboard:

1. Create these subscription products:
   - **Free Plan**: $0/month, "10 monthly bank account fraud checks"
   - **Growth Plan**: $299/month, "500 monthly bank account fraud checks"
   - **Pro Plan**: $999/month, "Unlimited bank account monthly fraud checks"

2. Note the price IDs for each product and update them in `src/stripe-config.ts`

### 2. Configure Webhook Endpoint

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-production-project.supabase.co/functions/v1/stripe-webhook`
3. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Get the webhook signing secret and add it to your environment variables

## Building for Production

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Application

```bash
npm run build
```

This will create optimized production files in the `dist/` directory.

## Deployment Options

### Option 1: Netlify (Recommended)

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Login to Netlify:
   ```bash
   netlify login
   ```

3. Initialize Netlify site:
   ```bash
   netlify init
   ```

4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

5. Set environment variables:
   ```bash
   netlify env:set VITE_SUPABASE_URL your_production_supabase_url
   netlify env:set VITE_SUPABASE_ANON_KEY your_production_anon_key
   netlify env:set VITE_STRIPE_PUBLISHABLE_KEY your_production_publishable_key
   ```

6. Deploy to Netlify:
   ```bash
   netlify deploy --prod
   ```

### Option 2: Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

4. Configure environment variables in the Vercel dashboard.

### Option 3: Manual Deployment

If you prefer to deploy to your own hosting:

1. Upload the contents of the `dist/` directory to your web server
2. Configure your web server to serve `index.html` for all routes (for SPA routing)
3. Ensure HTTPS is enabled

## Domain Configuration

### 1. DNS Configuration

1. Log in to your domain registrar for mybankcheck.com
2. Update DNS settings:

   **For Netlify:**
   - Add an A record pointing to Netlify's load balancer: `104.198.14.52`
   - Add a CNAME record for `www` pointing to `your-netlify-site.netlify.app`

   **For Vercel:**
   - Add a CNAME record for both root and `www` pointing to `cname.vercel-dns.com`

   **For custom hosting:**
   - Add A records pointing to your server's IP address

### 2. SSL Certificate

Ensure your hosting provider sets up SSL for mybankcheck.com:

- Netlify and Vercel handle this automatically
- For custom hosting, use Let's Encrypt or a commercial SSL certificate

### 3. Verify Domain

1. Wait for DNS propagation (can take up to 48 hours)
2. Verify the domain is working with HTTPS: https://mybankcheck.com
3. Test both www and non-www versions

## Post-Deployment Tasks

### 1. Update Stripe Webhook URL

Update your Stripe webhook endpoint to use your production domain:
- `https://mybankcheck.com/api/stripe-webhook`

### 2. Test Payment Flow

1. Create a test account
2. Upgrade to a paid plan using Stripe test cards
3. Verify subscription is created in Supabase

### 3. Configure Redirects

Create a `_redirects` file in your public directory for proper routing:

```
/*    /index.html   200
/admin/*    /admin.html   200
```

## Admin Panel Setup

### 1. Access Admin Panel

The admin panel is available at:
- https://mybankcheck.com/admin

### 2. Admin Authentication

1. Log in with one of the admin emails you created:
   - admin@mybankcheck.com
   - support@mybankcheck.com
   - dev@mybankcheck.com

### 3. Verify Admin Functionality

Test all admin panel features:
- User management
- Account monitoring
- Analytics
- Settings

## Monitoring and Maintenance

### 1. Set Up Error Monitoring

Implement an error monitoring service:
- [Sentry](https://sentry.io)
- [LogRocket](https://logrocket.com)
- [New Relic](https://newrelic.com)

### 2. Regular Backups

Set up regular backups of your Supabase database:
1. Go to Supabase Dashboard → Project Settings → Database
2. Configure scheduled backups

### 3. Performance Monitoring

Monitor application performance:
- Set up Google Analytics
- Configure Supabase monitoring
- Monitor Stripe webhook reliability

### 4. Security Considerations

1. **Regular Security Audits**:
   - Review RLS policies
   - Check for exposed API keys
   - Audit admin access

2. **Data Protection**:
   - Ensure PII is properly protected
   - Implement data retention policies
   - Follow financial data regulations

3. **Access Control**:
   - Regularly rotate admin passwords
   - Implement 2FA for admin accounts
   - Review access logs

## Troubleshooting

### Common Issues

1. **Supabase Connection Issues**:
   - Verify environment variables
   - Check network access to Supabase
   - Verify RLS policies

2. **Stripe Integration Problems**:
   - Confirm webhook is receiving events
   - Check Stripe Dashboard for errors
   - Verify price IDs match

3. **Admin Panel Access**:
   - Ensure admin users exist in Supabase Auth
   - Check email is in the allowed admin list
   - Verify RLS policies for admin tables

For additional help, refer to the `ADMIN_SETUP_GUIDE.md` file.