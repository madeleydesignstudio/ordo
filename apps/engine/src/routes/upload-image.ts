import { Hono } from 'hono'
import type { AppEnv } from '../lib/types'

const app = new Hono<AppEnv>()

app.post('/api/upload-image', async (c) => {
  try {
    const { fileName, fileType, path } = await c.req.json()
    
    // Get AUTH_SECRET from environment
    const authSecret = c.env?.AUTH_SECRET || process.env.AUTH_SECRET
    
    if (!authSecret) {
      return c.json({ error: 'Authentication not configured' }, 500)
    }
    
    // Return the upload URL and auth token
    const uploadUrl = `https://storage.dev-0af.workers.dev/${path}`
    const imageUrl = `https://storage.dev-0af.workers.dev/${path}`
    
    return c.json({
      uploadUrl,
      imageUrl,
      authToken: authSecret
    })
  } catch (error) {
    console.error('Upload preparation failed:', error)
    return c.json({ error: 'Failed to prepare upload' }, 500)
  }
})

app.get('/api/get-upload-token', (c) => {
  const authSecret = c.env?.AUTH_SECRET || process.env.AUTH_SECRET
  
  if (!authSecret) {
    return c.json({ error: 'Authentication not configured' }, 500)
  }
  
  return c.json({
    authToken: authSecret
  })
})

export default app