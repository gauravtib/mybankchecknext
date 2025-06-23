# 🚀 MyBankCheck Deployment Checklist

## Pre-Deployment Setup

### ✅ GitHub Repository
- [x] Repository connected to Netlify
- [x] Code pushed to main branch
- [x] Build configuration verified

### 🔧 Environment Configuration

#### Netlify Environment Variables (Required)
Add these in Netlify Dashboard → Site Settings → Environment Variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe Configuration  
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_... (or pk_test_... for testing)

# Server-side (for edge functions)
STRIPE_SECRET_KEY=sk_live_... (or sk_test_... for testing)
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 🗄️ Supabase Setup

#### 1. Create Production Project
- [ ] Create new Supabase project for production
- [ ] Note project URL and API keys
- [ ] Update environment variables

#### 2. Apply Database Migrations
- [ ] Run `supabase/migrations/20250612091453_bright_pebble.sql`
- [ ] Run `supabase/migrations/20250615065650_falling_bar.sql`
- [ ] Verify all tables created successfully

#### 3. Create Admin Users
Create these users in Supabase Auth → Users:
- [ ] admin@mybankcheck.com
- [ ] support@mybankcheck.com  
- [ ] dev@mybankcheck.com

#### 4. Deploy Edge Functions
```bash
supabase functions deploy stripe-checkout
supabase functions deploy stripe-webhook
supabase functions deploy get-subscription
```

### 💳 Stripe Setup

#### 1. Create Products
Create these subscription products in Stripe Dashboard:
- [ ] **Free Plan**: $0/month - "10 monthly bank account fraud checks"
- [ ] **Growth Plan**: $299/month - "500 monthly bank account fraud checks"  
- [ ] **Pro Plan**: $999/month - "Unlimited bank account monthly fraud checks"

#### 2. Update Price IDs
- [ ] Copy price IDs from Stripe Dashboard
- [ ] Update `src/stripe-config.ts` with production price IDs
- [ ] Commit and push changes

#### 3. Configure Webhook
- [ ] Add webhook endpoint: `https://your-project.supabase.co/functions/v1/stripe-webhook`
- [ ] Select required events:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
- [ ] Copy webhook secret to environment variables

## Netlify Deployment

### 1. Site Configuration
- [ ] Build command: `npm run build`
- [ ] Publish directory: `dist`
- [ ] Node version: 18

### 2. Domain Setup
- [ ] Add custom domain: `mybankcheck.com`
- [ ] Configure DNS records:
  - A record: `@` → `104.198.14.52`
  - CNAME record: `www` → `your-site.netlify.app`
- [ ] Wait for SSL certificate provisioning

### 3. Deploy Settings
- [ ] Auto-deploy from main branch enabled
- [ ] Build hooks configured (optional)
- [ ] Deploy previews enabled for pull requests

## Post-Deployment Testing

### 🧪 Core Functionality
- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] Bank account checking works
- [ ] Account submission works
- [ ] Check history displays

### 💰 Payment Flow
- [ ] Plan selection works
- [ ] Stripe checkout redirects correctly
- [ ] Payment completion redirects back
- [ ] Subscription created in Supabase
- [ ] User plan updated correctly

### 👨‍💼 Admin Panel
- [ ] Admin panel accessible at `/admin`
- [ ] Admin login works
- [ ] User data displays correctly
- [ ] Account data displays correctly
- [ ] Analytics load properly

### 🔒 Security
- [ ] HTTPS enforced
- [ ] Security headers present
- [ ] RLS policies working
- [ ] Admin access restricted

### 📱 Responsive Design
- [ ] Mobile layout works
- [ ] Tablet layout works
- [ ] Desktop layout works
- [ ] All interactions work on touch devices

## Production Monitoring

### 📊 Analytics Setup
- [ ] Google Analytics configured (optional)
- [ ] Error monitoring setup (Sentry, LogRocket, etc.)
- [ ] Performance monitoring enabled

### 🔍 Health Checks
- [ ] Supabase connection monitoring
- [ ] Stripe webhook monitoring
- [ ] Edge function monitoring
- [ ] Database performance monitoring

## Final Verification

### ✅ Complete Checklist
- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] Admin users created
- [ ] Stripe products configured
- [ ] Domain DNS configured
- [ ] SSL certificate active
- [ ] All core features tested
- [ ] Payment flow tested
- [ ] Admin panel tested
- [ ] Mobile responsiveness verified

### 🎉 Go Live
- [ ] Announce launch
- [ ] Monitor for any issues
- [ ] Document any post-launch configurations needed

---

## Quick Commands

### Build Locally
```bash
npm run build
```

### Test Production Build
```bash
npm run preview
```

### Deploy to Netlify (if using CLI)
```bash
netl