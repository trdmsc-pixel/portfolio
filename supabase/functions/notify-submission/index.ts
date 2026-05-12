// Supabase Edge Function: notify-submission
// Deploy with: npx supabase functions deploy notify-submission
// Set secrets:
//   npx supabase secrets set ADMIN_EMAIL=studio@bhakty.life
//   npx supabase secrets set RESEND_API_KEY=re_xxxxx (get from https://resend.com)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name, email, phone, company, grade, content_type, budget, brief } = await req.json()

    const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'studio@bhakty.life'
    const resendKey = Deno.env.get('RESEND_API_KEY')

    if (!resendKey) {
      console.log('RESEND_API_KEY not set, skipping email')
      return new Response(JSON.stringify({ message: 'Email skipped (no API key)' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const htmlBody = `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #222;">
        <div style="background: linear-gradient(135deg, #00e5ff22, #9b59ff22); padding: 32px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; letter-spacing: 0.1em;">🎬 NEW ENQUIRY</h1>
          <p style="margin: 8px 0 0; color: #aaa; font-size: 13px;">bhakti.studio — Form Submission</p>
        </div>
        <div style="padding: 24px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 10px 0; border-bottom: 1px solid #222; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Name</td><td style="padding: 10px 0; border-bottom: 1px solid #222; font-weight: bold;">${name}</td></tr>
            <tr><td style="padding: 10px 0; border-bottom: 1px solid #222; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Email</td><td style="padding: 10px 0; border-bottom: 1px solid #222;"><a href="mailto:${email}" style="color: #00e5ff;">${email}</a></td></tr>
            <tr><td style="padding: 10px 0; border-bottom: 1px solid #222; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Phone</td><td style="padding: 10px 0; border-bottom: 1px solid #222;">${phone}</td></tr>
            <tr><td style="padding: 10px 0; border-bottom: 1px solid #222; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Company</td><td style="padding: 10px 0; border-bottom: 1px solid #222;">${company}</td></tr>
            <tr><td style="padding: 10px 0; border-bottom: 1px solid #222; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Grade</td><td style="padding: 10px 0; border-bottom: 1px solid #222; color: #9b59ff; font-weight: bold;">${grade}</td></tr>
            <tr><td style="padding: 10px 0; border-bottom: 1px solid #222; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Content Type</td><td style="padding: 10px 0; border-bottom: 1px solid #222;">${content_type}</td></tr>
            <tr><td style="padding: 10px 0; border-bottom: 1px solid #222; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Budget</td><td style="padding: 10px 0; border-bottom: 1px solid #222; color: #ffb800; font-weight: bold;">${budget}</td></tr>
          </table>
          <div style="margin-top: 20px; padding: 16px; background: #111; border-radius: 12px; border: 1px solid #222;">
            <div style="color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">Project Brief</div>
            <p style="margin: 0; line-height: 1.6; color: #ccc;">${brief}</p>
          </div>
        </div>
        <div style="padding: 16px 24px; background: #111; text-align: center; font-size: 11px; color: #555;">
          Sent from bhakti.studio contact form
        </div>
      </div>
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Bhakty Studio <notifications@bhakty.studio>',
        to: [adminEmail],
        subject: `🎬 New Enquiry: ${name} — ${grade}`,
        html: htmlBody,
      }),
    })

    const result = await res.json()
    console.log('Email sent:', result)

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Email error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
