/// <reference types="@cloudflare/workers-types" />

export interface Env {
    IMAGE_BUCKET: R2Bucket;
    AUTH_SECRET: string;
  }
  
  export default {
    async fetch(request: Request, env: Env): Promise<Response> {
      const url = new URL(request.url);
      const key = url.pathname.slice(1); // Remove leading slash
  
      // Handle CORS for cross-origin requests from your apps
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      };
  
      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
      }
  
      if (request.method === 'PUT') {
        // Upload images with authentication
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || authHeader !== `Bearer ${env.AUTH_SECRET}`) {
          return new Response('Unauthorized', { 
            status: 401, 
            headers: corsHeaders 
          });
        }
  
        const contentType = request.headers.get('Content-Type') || 'application/octet-stream';
        
        // Upload to R2 with proper metadata
        const object = await env.IMAGE_BUCKET.put(key, request.body, {
          httpMetadata: {
            contentType: contentType,
            cacheControl: 'public, max-age=31536000', // 1 year cache
          },
        });
  
        if (object) {
          return new Response(
            JSON.stringify({ 
              success: true, 
              url: `https://storage.dev-0af.workers.dev/${key}`,
              key: key 
            }), 
            { 
              status: 200, 
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders 
              } 
            }
          );
        } else {
          return new Response('Upload failed', { 
            status: 500, 
            headers: corsHeaders 
          });
        }
      }
  
      if (request.method === 'GET') {
        // Serve images with optimization
        const object = await env.IMAGE_BUCKET.get(key);
  
        if (!object) {
          return new Response('Image not found', { 
            status: 404, 
            headers: corsHeaders 
          });
        }
  
        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);
        headers.set('cache-control', 'public, max-age=31536000');
        
        // Add CORS headers
        Object.entries(corsHeaders).forEach(([key, value]) => {
          headers.set(key, value);
        });
  
        return new Response(object.body, { headers });
      }
  
      if (request.method === 'DELETE') {
        // Delete images with authentication
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || authHeader !== `Bearer ${env.AUTH_SECRET}`) {
          return new Response('Unauthorized', { 
            status: 401, 
            headers: corsHeaders 
          });
        }
  
        await env.IMAGE_BUCKET.delete(key);
        return new Response('Image deleted', { 
          status: 200, 
          headers: corsHeaders 
        });
      }
  
      return new Response('Method not allowed', { 
        status: 405, 
        headers: corsHeaders 
      });
    },
  };
  