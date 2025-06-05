import { Hono } from 'hono'
import { createAuth } from '@ordo/auth'
import { createDb } from '@ordo/neon-db/db'
import type { AppEnv } from '../lib/types'

const authApp = new Hono<AppEnv>()

authApp.all('/api/auth/*', async (c) => {
  console.log('=== BETTER AUTH REQUEST ===');
  console.log('URL:', c.req.url);
  console.log('Method:', c.req.method);
  console.log('Path:', new URL(c.req.url).pathname);
  console.log('Origin:', c.req.header('origin'));
  console.log('Cookie:', c.req.header('cookie'));
  
  const db = createDb(c.env.DATABASE_URL)
  const auth = createAuth(db, c.env)
  
  try {
    const response = await auth.handler(c.req.raw);
    // Try to read the response body for debugging
    const responseClone = response.clone();
    try {
      const responseText = await responseClone.text();
      console.log('Response body:', responseText);
      
      // Try to parse as JSON if possible
      if (responseText) {
        try {
          const responseJson = JSON.parse(responseText);
          console.log('Response JSON:', responseJson);
        } catch (e) {
          console.log('Response is not valid JSON');
        }
      }
    } catch (e) {
      console.log('Could not read response body:', e);
    }
    
    return response;
  } catch (error) {
    console.error('Better Auth handler error:', error);
    return c.json({ error: 'Authentication error' }, 500);
  }
})

export default authApp 