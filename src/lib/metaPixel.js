export async function trackMetaEvent(eventName, userData = {}, customData = {}) {
  const pixelId = import.meta.env.VITE_META_PIXEL_ID

  // If there's no Pixel ID configured in the client, we cannot track.
  if (!pixelId || pixelId === '%VITE_META_PIXEL_ID%' || pixelId.startsWith('%')) {
    return
  }

  // Generate a unique event ID for deduplication
  const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`

  // 1. Browser-side Track (Meta Pixel)
  if (window.fbq) {
    try {
      window.fbq('track', eventName, customData, { eventID: eventId })
    } catch (browserErr) {
      console.warn('Browser Meta Pixel tracking failed:', browserErr)
    }
  }

  // 2. Server-side Track (Conversions API via Serverless Proxy)
  try {
    // Extract fbp and fbc cookies if present
    let fbp = undefined
    let fbc = undefined
    
    if (typeof document !== 'undefined') {
      fbp = document.cookie
        .split('; ')
        .find((row) => row.startsWith('_fbp='))
        ?.split('=')[1]
      
      fbc = document.cookie
        .split('; ')
        .find((row) => row.startsWith('_fbc='))
        ?.split('=')[1]
    }

    await fetch('/api/meta-capi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventName,
        eventId,
        userData: {
          ...userData,
          fbp,
          fbc,
        },
        customData,
      }),
    })
  } catch (serverErr) {
    console.warn('Conversions API proxy call skipped/failed:', serverErr.message)
  }
}
