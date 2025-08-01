import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js@2'

const app = new Hono()

// Add CORS middleware
app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))

// Add logger
app.use('*', logger(console.log))

// Create Supabase client with service role key for admin operations
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// Health check endpoint
app.get('/make-server-12068a29/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Signup endpoint - creates user with auto email confirmation
app.post('/make-server-12068a29/auth/signup', async (c) => {
  try {
    const body = await c.req.json()
    const { email, password, name } = body

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400)
    }

    console.log(`Creating user account for email: ${email}`)

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name: name || '' },
      // Automatically confirm the user's email since an email server hasn't been configured
      email_confirm: true
    })

    if (error) {
      console.error('Signup error:', error.message)
      return c.json({ error: error.message }, 400)
    }

    console.log(`Successfully created user: ${data.user.id}`)
    
    return c.json({ 
      success: true, 
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name
      }
    })

  } catch (error) {
    console.error('Signup endpoint error:', error)
    return c.json({ error: 'Internal server error during signup' }, 500)
  }
})

// Test endpoint for development
app.get('/make-server-12068a29/test', (c) => {
  return c.json({ message: 'Muncher API is running!' })
})

export default app

Deno.serve(app.fetch)