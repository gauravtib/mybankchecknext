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
    console.log('Admin Users function called')
    
    // Create Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    
    console.log('Environment check:', { 
      hasUrl: !!supabaseUrl, 
      hasServiceKey: !!supabaseServiceKey,
      urlValue: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'undefined',
      serviceKeyValue: supabaseServiceKey ? `${supabaseServiceKey.substring(0, 20)}...` : 'undefined'
    })
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error', 
          details: 'Missing required environment variables',
          debug: {
            hasUrl: !!supabaseUrl,
            hasServiceKey: !!supabaseServiceKey,
            envVars: Object.keys(Deno.env.toObject()).filter(key => key.includes('SUPABASE'))
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

    const url = new URL(req.url)
    const path = url.pathname.split('/admin-users')[1]
    
    console.log('Request path:', path)
    console.log('Request method:', req.method)

    // GET /admin-users - List all users
    if (req.method === 'GET' && (!path || path === '/')) {
      console.log('Listing all users')
      
      // Get all users
      const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
      
      if (usersError) {
        console.error('Error fetching users:', usersError)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch users', details: usersError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log(`Found ${users.length} users`)

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
            console.warn(`Error fetching subscription for user ${user.id}:`, error)
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

    // POST /admin-users - Create a new user
    if (req.method === 'POST' && (!path || path === '/')) {
      console.log('Creating new user')
      
      // Parse request body
      const body = await req.json()
      const { email, password, firstName, lastName, companyName, jobTitle } = body

      if (!email || !password) {
        return new Response(
          JSON.stringify({ error: 'Email and password are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log(`Creating user with email: ${email}`)

      // Create the user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        user_metadata: {
          first_name: firstName || '',
          last_name: lastName || '',
          company_name: companyName || '',
          job_title: jobTitle || ''
        },
        email_confirm: true
      })

      if (createError) {
        console.error('Error creating user:', createError)
        return new Response(
          JSON.stringify({ error: 'Failed to create user', details: createError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('User created successfully')
      return new Response(
        JSON.stringify(newUser),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // PUT /admin-users/:id - Update a user
    if (req.method === 'PUT' && path && path.startsWith('/')) {
      const userId = path.substring(1) // Remove leading slash
      console.log(`Updating user with ID: ${userId}`)
      
      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'User ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Parse request body
      const body = await req.json()
      const { firstName, lastName, companyName, jobTitle } = body

      // Update the user
      const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        {
          user_metadata: {
            first_name: firstName || '',
            last_name: lastName || '',
            company_name: companyName || '',
            job_title: jobTitle || ''
          }
        }
      )

      if (updateError) {
        console.error('Error updating user:', updateError)
        return new Response(
          JSON.stringify({ error: 'Failed to update user', details: updateError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('User updated successfully')
      return new Response(
        JSON.stringify(updatedUser),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // DELETE /admin-users/:id - Delete a user
    if (req.method === 'DELETE' && path && path.startsWith('/')) {
      const userId = path.substring(1) // Remove leading slash
      console.log(`Deleting user with ID: ${userId}`)
      
      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'User ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Delete the user
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

      if (deleteError) {
        console.error('Error deleting user:', deleteError)
        return new Response(
          JSON.stringify({ error: 'Failed to delete user', details: deleteError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('User deleted successfully')
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed', path, method: req.method }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in admin-users function:', error)
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