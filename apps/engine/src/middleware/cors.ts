import { cors } from 'hono/cors'
import type { MiddlewareHandler } from 'hono'

export const corsMiddleware: MiddlewareHandler = cors({
  origin: (origin, c) => {
    const allowedOrigins = [
      'http://localhost:3001', // Development dashboard
      'https://dashboard.dev-0af.workers.dev' // Production dashboard
    ]
    
    // Log CORS requests for debugging
    console.log('CORS check:', { 
      origin, 
      allowedOrigins, 
      isAllowed: allowedOrigins.includes(origin || '') 
    });
    
    // Allow requests without origin (same-origin or tools like Postman)
    if (!origin) {
      console.log('No origin header, allowing request');
      return origin; // Return the origin (which is null/undefined)
    }
    
    // Check if origin is in allowed list
    const isAllowed = allowedOrigins.includes(origin);
    if (isAllowed) {
      console.log('Origin allowed:', origin);
      return origin;
    }
    
    console.log('Origin rejected:', origin);
    return null;
  },
  credentials: true,
  allowHeaders: [
    'Content-Type', 
    'Authorization', 
    'Cookie', 
    'Set-Cookie',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  exposeHeaders: ['Set-Cookie'],
  maxAge: 86400, // Cache preflight for 24 hours
}) 