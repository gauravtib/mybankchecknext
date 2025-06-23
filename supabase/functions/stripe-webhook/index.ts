import { createClient } from 'npm:@supabase/supabase-js@2'
import Stripe from 'npm:stripe@12.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the Stripe signature from the request headers
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'No Stripe signature found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the raw request body
    const body = await req.text()

    // Initialize Stripe
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || ''
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    })

    // Verify the webhook signature
    let event
    try {
      event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret)
    } catch (err) {
      return new Response(
        JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        
        // Get the customer ID from the session
        const customerId = session.customer
        
        // Get the user ID from our database
        const { data: customerData, error: customerError } = await supabase
          .from('stripe_customers')
          .select('user_id')
          .eq('customer_id', customerId)
          .is('deleted_at', null)
          .single()
        
        if (customerError) {
          console.error('Error fetching customer:', customerError)
          break
        }
        
        // Handle subscription or one-time payment
        if (session.mode === 'subscription') {
          // Get the subscription ID
          const subscriptionId = session.subscription
          
          // Get the subscription details from Stripe
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          
          // Get the price ID from the subscription
          const priceId = subscription.items.data[0].price.id
          
          // Update or insert subscription in our database
          const { error: subscriptionError } = await supabase
            .from('stripe_subscriptions')
            .upsert({
              customer_id: customerId,
              subscription_id: subscriptionId,
              price_id: priceId,
              current_period_start: subscription.current_period_start,
              current_period_end: subscription.current_period_end,
              cancel_at_period_end: subscription.cancel_at_period_end,
              status: subscription.status,
              updated_at: new Date().toISOString()
            })
          
          if (subscriptionError) {
            console.error('Error updating subscription:', subscriptionError)
          }
        }
        
        // Record the order
        const { error: orderError } = await supabase
          .from('stripe_orders')
          .insert({
            checkout_session_id: session.id,
            payment_intent_id: session.payment_intent || 'sub_' + session.subscription,
            customer_id: customerId,
            amount_subtotal: session.amount_subtotal,
            amount_total: session.amount_total,
            currency: session.currency,
            payment_status: session.payment_status,
            status: 'completed'
          })
        
        if (orderError) {
          console.error('Error recording order:', orderError)
        }
        
        break
      }
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object
        
        // Get the customer ID from the subscription
        const customerId = subscription.customer
        
        // Get the price ID from the subscription
        const priceId = subscription.items.data[0].price.id
        
        // Update payment method details if available
        let paymentMethodBrand = null
        let paymentMethodLast4 = null
        
        if (subscription.default_payment_method) {
          try {
            const paymentMethod = await stripe.paymentMethods.retrieve(
              subscription.default_payment_method
            )
            paymentMethodBrand = paymentMethod.card?.brand
            paymentMethodLast4 = paymentMethod.card?.last4
          } catch (err) {
            console.error('Error fetching payment method:', err)
          }
        }
        
        // Update or insert subscription in our database
        const { error: subscriptionError } = await supabase
          .from('stripe_subscriptions')
          .upsert({
            customer_id: customerId,
            subscription_id: subscription.id,
            price_id: priceId,
            current_period_start: subscription.current_period_start,
            current_period_end: subscription.current_period_end,
            cancel_at_period_end: subscription.cancel_at_period_end,
            payment_method_brand: paymentMethodBrand,
            payment_method_last4: paymentMethodLast4,
            status: subscription.status,
            updated_at: new Date().toISOString()
          })
        
        if (subscriptionError) {
          console.error('Error updating subscription:', subscriptionError)
        }
        
        break
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        
        // Get the customer ID from the subscription
        const customerId = subscription.customer
        
        // Update the subscription in our database
        const { error: subscriptionError } = await supabase
          .from('stripe_subscriptions')
          .update({
            status: 'canceled',
            updated_at: new Date().toISOString()
          })
          .eq('subscription_id', subscription.id)
        
        if (subscriptionError) {
          console.error('Error updating subscription:', subscriptionError)
        }
        
        break
      }
      
      case 'invoice.payment_succeeded': {
        // Handle successful invoice payment
        // This could update usage limits, etc.
        break
      }
      
      case 'invoice.payment_failed': {
        // Handle failed invoice payment
        // This could send notifications, etc.
        break
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})