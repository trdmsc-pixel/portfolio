import crypto from 'crypto'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  }

  const pixelId = process.env.VITE_META_PIXEL_ID
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN

  if (!pixelId || !accessToken) {
    console.warn('Meta Ads Config Missing: VITE_META_PIXEL_ID or META_CAPI_ACCESS_TOKEN is not configured.')
    return res.status(200).json({
      success: false,
      message: 'Meta credentials not configured on server.',
    })
  }

  try {
    const { eventName, eventId, userData = {}, customData = {} } = req.body

    if (!eventName) {
      return res.status(400).json({ error: 'Missing eventName parameter.' })
    }

    // Helper to hash user data as required by Meta's CAPI specifications (SHA-256, lowercase, trimmed)
    const hashValue = (val) => {
      if (!val) return undefined
      const clean = String(val).trim().toLowerCase()
      // Ensure if it's already a SHA-256 hash, we don't re-hash it.
      if (/^[a-f0-9]{64}$/i.test(clean)) {
        return clean
      }
      return crypto.createHash('sha256').update(clean).digest('hex')
    }

    // Client IP and User Agent extraction
    const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || ''
    const userAgent = req.headers['user-agent'] || ''

    // Normalize and structure user_data
    const user_data = {
      client_ip_address: clientIp.split(',')[0].trim(), // Get first IP if forwarded through proxy
      client_user_agent: userAgent,
    }

    if (userData.email) user_data.em = [hashValue(userData.email)]
    if (userData.phone) user_data.ph = [hashValue(userData.phone)]
    
    // Split full name if present
    if (userData.fullName) {
      const parts = String(userData.fullName).trim().split(/\s+/)
      if (parts.length > 0) {
        user_data.fn = [hashValue(parts[0])]
        if (parts.length > 1) {
          user_data.ln = [hashValue(parts.slice(1).join(' '))]
        }
      }
    }

    // Add cookies if available
    if (userData.fbp) user_data.fbp = userData.fbp
    if (userData.fbc) user_data.fbc = userData.fbc

    const eventPayload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId,
          event_source: 'web',
          action_source: 'website',
          user_data,
          custom_data: {
            ...customData,
          },
        },
      ],
    }

    const response = await fetch(`https://graph.facebook.com/v20.0/${pixelId}/events?access_token=${accessToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventPayload),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('Meta CAPI Error:', result)
      return res.status(response.status).json({ success: false, error: result })
    }

    return res.status(200).json({ success: true, result })
  } catch (error) {
    console.error('Meta CAPI handler error:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
