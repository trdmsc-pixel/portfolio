import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function sha1(message: string) {
  const data = new TextEncoder().encode(message)
  const hash = await crypto.subtle.digest('SHA-1', data)
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('CLOUDINARY_API_KEY')
    const apiSecret = Deno.env.get('CLOUDINARY_API_SECRET')
    const defaultFolder = Deno.env.get('CLOUDINARY_UPLOAD_FOLDER') || 'bhakty-studio'

    if (!apiKey || !apiSecret) {
      throw new Error('Cloudinary secrets are not configured')
    }

    const body = await req.json().catch(() => ({}))
    const timestamp = Math.round(Date.now() / 1000)
    const folder = body.folder || defaultFolder
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`
    const signature = await sha1(paramsToSign)

    return new Response(
      JSON.stringify({
        apiKey,
        folder,
        timestamp,
        signature,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
