import { Hono } from 'hono'
import { cors } from 'hono/cors'
import auth from './routes/auth';

const app = new Hono()

// Add CORS middleware
app.use('*', cors({
  origin: ['http://localhost:3001'], // Dashboard URL
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}))

app.get('/', (c) => {
  return c.text('Hello Cloudflare!')
})

// Register auth routes
app.route('/api', auth)

export default app
