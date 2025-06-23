import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing required environment variables:', {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey
      })
      
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error', 
          details: 'Missing required environment variables',
          debug: {
            hasUrl: !!supabaseUrl,
            hasServiceKey: !!supabaseServiceKey,
            envVars: Object.keys(Deno.env.toObject()).filter(k => k.includes('SUPABASE'))
          }
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify the user is authenticated and is an admin
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token', details: authError?.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is admin
    const adminEmails = ['admin@mybankcheck.com', 'support@mybankcheck.com', 'dev@mybankcheck.com']
    if (!adminEmails.includes(user.email || '')) {
      return new Response(
        JSON.stringify({ error: 'User not allowed', details: 'User is not an admin' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse URL to get the endpoint
    const url = new URL(req.url)
    const path = url.pathname.split('/admin-data/')[1]

    // Dashboard endpoint
    if (path === 'dashboard') {
      // Get user count
      const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
      
      if (usersError) {
        return new Response(
          JSON.stringify({ error: 'Failed to fetch users', details: usersError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get subscription data
      const { data: subscriptions, error: subscriptionsError } = await supabaseAdmin
        .from('stripe_subscriptions')
        .select('*')
        .in('status', ['active', 'trialing'])
      
      if (subscriptionsError) {
        console.warn('Error fetching subscriptions:', subscriptionsError.message)
      }

      // Get orders data
      const { data: orders, error: ordersError } = await supabaseAdmin
        .from('stripe_orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)
      
      if (ordersError) {
        console.warn('Error fetching orders:', ordersError.message)
      }

      // Calculate stats
      const totalUsers = users?.users?.length || 0
      const totalAccounts = 0 // This would come from your accounts table
      const fraudReports = 0 // This would come from your reports table
      const monthlyGrowth = 0 // Calculate based on user growth

      // Generate recent activity
      const recentActivity = []
      
      // Add recent user signups to activity
      if (users?.users) {
        users.users.slice(0, 5).forEach(user => {
          recentActivity.push({
            id: `user_${user.id}`,
            type: 'user_signup',
            description: `New user registered: ${user.email}`,
            timestamp: user.created_at,
            user: user.email
          })
        })
      }

      // Add recent orders to activity
      if (orders) {
        orders.slice(0, 5).forEach(order => {
          recentActivity.push({
            id: `order_${order.id}`,
            type: 'account_check',
            description: `Payment processed: $${(order.amount_total / 100).toFixed(2)}`,
            timestamp: order.created_at,
            user: ''
          })
        })
      }

      // Sort activity by timestamp
      recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      const stats = {
        totalUsers,
        totalAccounts,
        fraudReports,
        monthlyGrowth,
        recentActivity: recentActivity.slice(0, 10)
      }

      return new Response(
        JSON.stringify(stats),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Analytics endpoint
    if (path === 'analytics') {
      // Get subscription breakdown
      const { data: subscriptions, error: subscriptionsError } = await supabaseAdmin
        .from('stripe_subscriptions')
        .select('status, price_id')
      
      if (subscriptionsError) {
        console.warn('Error fetching subscriptions for analytics:', subscriptionsError.message)
      }

      // Calculate subscription breakdown
      const subscriptionCounts = {
        Free: 0,
        Growth: 0,
        Pro: 0,
      }

      if (subscriptions) {
        subscriptions.forEach(sub => {
          if (sub.status === 'active' || sub.status === 'trialing') {
            // Map price IDs to plan names
            if (sub.price_id?.includes('growth')) {
              subscriptionCounts.Growth++
            } else if (sub.price_id?.includes('pro')) {
              subscriptionCounts.Pro++
            } else {
              subscriptionCounts.Free++
            }
          } else {
            subscriptionCounts.Free++
          }
        })
      }

      const total = Object.values(subscriptionCounts).reduce((sum, count) => sum + count, 0) || 1
      const subscriptionBreakdown = Object.entries(subscriptionCounts).map(([plan, count]) => ({
        plan,
        count,
        percentage: Math.round((count / total) * 100)
      }))

      const analytics = {
        userGrowth: [], // Would implement based on user creation dates
        revenueData: [], // Would implement based on order data
        checkActivity: [], // Would implement based on usage tracking
        subscriptionBreakdown
      }

      return new Response(
        JSON.stringify(analytics),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Settings endpoint
    if (path === 'settings') {
      if (req.method === 'GET') {
        // In a real implementation, this would fetch from your settings table
        // For now, return default settings
        const settings = {
          siteName: 'MyBankCheck',
          siteDescription: 'Bank Account Risk Checker',
          adminEmail: 'admin@mybankcheck.com',
          maxChecksPerUser: 10,
          enableRegistration: true,
          enableEmailNotifications: true,
          maintenanceMode: false,
          apiRateLimit: 100,
        }

        return new Response(
          JSON.stringify(settings),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      if (req.method === 'POST') {
        // In a real implementation, this would save to your settings table
        // For now, just return success
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Users endpoint
    if (path === 'users') {
      // Get all users
      const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
      
      if (usersError) {
        return new Response(
          JSON.stringify({ error: 'Failed to fetch users', details: usersError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get subscription data for each user
      const usersWithSubscriptions = await Promise.all(
        users.map(async (user) => {
          try {
            const { data: subscription } = await supabaseAdmin
              .from('stripe_user_subscriptions')
              .select('*')
              .eq('user_id', user.id)
              .single()

            return {
              id: user.id,
              email: user.email,
              created_at: user.created_at,
              last_sign_in_at: user.last_sign_in_at,
              user_metadata: user.user_metadata,
              subscription: subscription || null
            }
          } catch (error) {
            return {
              id: user.id,
              email: user.email,
              created_at: user.created_at,
              last_sign_in_at: user.last_sign_in_at,
              user_metadata: user.user_metadata,
              subscription: null
            }
          }
        })
      )

      return new Response(
        JSON.stringify(usersWithSubscriptions),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid endpoint', path }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in admin-data function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: error.message,
        stack: error.stack
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})