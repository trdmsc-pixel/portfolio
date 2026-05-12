import { supabase, isSupabaseConfigured } from './supabase'

/**
 * Supabase data access layer.
 * Maps live DB table/column names to the shapes used by the admin CMS Zustand store.
 *
 * Live tables:
 *   site_settings      – singleton row
 *   form_submissions   – contact form leads
 *   tiers              – service tier definitions (has jsonb `features` column)
 *   site_content       – key/value pairs for hero copy
 *   portfolio          – portfolio items
 *   videos             – video gallery items
 *   pricing            – pricing rows keyed by tier_slug
 *   admin_users        – admin allow-list
 */

// ─── helpers ────────────────────────────────────────────────────────

function guard() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured')
  }
}

// ─── PORTFOLIO ──────────────────────────────────────────────────────

export async function fetchPortfolio() {
  guard()
  const { data, error } = await supabase
    .from('portfolio')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw error
  return (data || []).map(rowToPortfolioItem)
}

function rowToPortfolioItem(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category || '',
    tier: '', // live schema has no tier column – kept for UI compatibility
    thumbnail: row.thumbnail_url || '',
    video_url: row.video_url || '',
    description: row.description || '',
    tags: Array.isArray(row.tags) ? row.tags.join(', ') : (row.tags || ''),
    is_featured: row.featured ?? false,
    is_visible: row.visible ?? true,
    aspect_ratio: row.aspect_ratio || '16/9',
    created_at: row.created_at,
    sort_order: row.sort_order ?? 0,
  }
}

function portfolioItemToRow(item) {
  return {
    title: item.title,
    category: item.category,
    thumbnail_url: item.thumbnail,
    video_url: item.video_url,
    description: item.description,
    tags: typeof item.tags === 'string' ? item.tags.split(',').map((t) => t.trim()).filter(Boolean) : (item.tags || []),
    featured: item.is_featured ?? false,
    visible: item.is_visible ?? true,
    aspect_ratio: item.aspect_ratio || '16/9',
    sort_order: item.sort_order ?? 0,
  }
}

export async function upsertPortfolioItem(item) {
  guard()
  const row = portfolioItemToRow(item)
  if (item.id && typeof item.id === 'string' && item.id.includes('-')) {
    // existing uuid — update
    const { error } = await supabase.from('portfolio').update(row).eq('id', item.id)
    if (error) throw error
  } else {
    const { error } = await supabase.from('portfolio').insert(row)
    if (error) throw error
  }
}

export async function deletePortfolioItem(id) {
  guard()
  const { error } = await supabase.from('portfolio').delete().eq('id', id)
  if (error) throw error
}

export async function reorderPortfolio(items) {
  guard()
  const updates = items.map((item, index) => ({
    id: item.id,
    sort_order: index + 1,
  }))
  for (const u of updates) {
    const { error } = await supabase.from('portfolio').update({ sort_order: u.sort_order }).eq('id', u.id)
    if (error) throw error
  }
}

// ─── VIDEOS ─────────────────────────────────────────────────────────

export async function fetchVideos() {
  guard()
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw error
  return (data || []).map(rowToVideoItem)
}

function rowToVideoItem(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category || '',
    tier: '',
    duration: row.duration || '',
    views: '',
    thumbnail: row.thumbnail_url || '',
    video_url: row.video_url || '',
    tags: '',
    is_featured: row.featured ?? false,
    is_visible: row.visible ?? true,
    sort_order: row.sort_order ?? 0,
    created_at: row.created_at,
  }
}

function videoItemToRow(item) {
  return {
    title: item.title,
    category: item.category,
    thumbnail_url: item.thumbnail,
    video_url: item.video_url,
    duration: item.duration || null,
    featured: item.is_featured ?? false,
    visible: item.is_visible ?? true,
    sort_order: item.sort_order ?? 0,
  }
}

export async function upsertVideoItem(item) {
  guard()
  const row = videoItemToRow(item)
  if (item.id && typeof item.id === 'string' && item.id.includes('-')) {
    const { error } = await supabase.from('videos').update(row).eq('id', item.id)
    if (error) throw error
  } else {
    const { error } = await supabase.from('videos').insert(row)
    if (error) throw error
  }
}

export async function deleteVideoItem(id) {
  guard()
  const { error } = await supabase.from('videos').delete().eq('id', id)
  if (error) throw error
}

export async function reorderVideos(items) {
  guard()
  for (let i = 0; i < items.length; i++) {
    const { error } = await supabase.from('videos').update({ sort_order: i + 1 }).eq('id', items[i].id)
    if (error) throw error
  }
}

// ─── TIERS ──────────────────────────────────────────────────────────

export async function fetchTiers() {
  guard()
  const { data, error } = await supabase
    .from('tiers')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw error
  return (data || []).map(rowToTier)
}

function rowToTier(row) {
  return {
    id: row.slug || row.id,
    name: row.name,
    tagline: row.tagline || '',
    description: row.description || '',
    accent_color: row.accent_color || '#00e5ff',
    badge: row.badge_text || '',
    cta_label: row.cta_label || '',
    starting_price: row.starting_price || '',
    is_visible: row.visible ?? true,
    features: Array.isArray(row.features) ? row.features : [],
    _db_id: row.id, // preserve the actual DB uuid for updates
  }
}

function tierToRow(tier) {
  return {
    name: tier.name,
    tagline: tier.tagline,
    description: tier.description,
    accent_color: tier.accent_color,
    badge_text: tier.badge,
    cta_label: tier.cta_label,
    starting_price: tier.starting_price,
    visible: tier.is_visible ?? true,
    features: tier.features || [],
  }
}

export async function updateTierInDb(tier) {
  guard()
  const row = tierToRow(tier)
  const id = tier._db_id || tier.id
  const { error } = await supabase.from('tiers').update(row).eq('id', id)
  if (error) throw error
}

// ─── PRICING ────────────────────────────────────────────────────────

export async function fetchPricing() {
  guard()
  const { data, error } = await supabase
    .from('pricing')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data || []
}

export async function upsertPricingRow(row) {
  guard()
  const payload = {
    tier_slug: row.tier_slug,
    service_name: row.service_name || row.service,
    description: row.description,
    price: row.price,
    visible: row.visible ?? row.is_visible ?? true,
    sort_order: row.sort_order ?? 0,
  }
  if (row.id && typeof row.id === 'string' && row.id.includes('-')) {
    const { error } = await supabase.from('pricing').update(payload).eq('id', row.id)
    if (error) throw error
  } else {
    const { error } = await supabase.from('pricing').insert(payload)
    if (error) throw error
  }
}

export async function deletePricingRow(id) {
  guard()
  const { error } = await supabase.from('pricing').delete().eq('id', id)
  if (error) throw error
}

// ─── HERO / SITE CONTENT ───────────────────────────────────────────

export async function fetchSiteContent() {
  guard()
  const { data, error } = await supabase.from('site_content').select('*')
  if (error) throw error
  // Convert key-value rows into a flat object
  const result = {}
  for (const row of data || []) {
    result[row.key] = row.value
  }
  return result
}

export async function upsertSiteContent(key, value) {
  guard()
  const { error } = await supabase
    .from('site_content')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
  if (error) throw error
}

export async function saveSiteContentBatch(entries) {
  guard()
  const rows = Object.entries(entries).map(([key, value]) => ({
    key,
    value: value || '',
    updated_at: new Date().toISOString(),
  }))
  const { error } = await supabase
    .from('site_content')
    .upsert(rows, { onConflict: 'key' })
  if (error) throw error
}

// ─── SITE SETTINGS ─────────────────────────────────────────────────

export async function fetchSiteSettings() {
  guard()
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .limit(1)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  return {
    ...data,
    site_logo: data.site_logo || '',
    logo_padding: data.logo_padding || 0,
    logo_margin: data.logo_margin || 0,
  }
}

export async function saveSiteSettings(settings) {
  guard()
  const payload = {
    site_title: settings.site_title,
    meta_description: settings.meta_description,
    og_image_url: settings.og_image,
    favicon_url: settings.favicon,
    analytics_id: settings.analytics_id,
    pixel_id: settings.pixel_id,
    agency_email: settings.agency_email,
    phone: settings.phone,
    instagram_handle: settings.instagram,
    whatsapp_number: settings.whatsapp,
    maintenance_mode: settings.maintenance_mode ?? false,
    site_logo: settings.site_logo || '',
    logo_padding: settings.logo_padding || 0,
    logo_margin: settings.logo_margin || 0,
    updated_at: new Date().toISOString(),
  }

  const { data: current } = await supabase
    .from('site_settings')
    .select('id')
    .limit(1)
    .maybeSingle()

  if (current?.id) {
    const { error } = await supabase.from('site_settings').update(payload).eq('id', current.id)
    if (error) throw error
  } else {
    const { error } = await supabase.from('site_settings').insert(payload)
    if (error) throw error
  }
}

// ─── FORM SUBMISSIONS ──────────────────────────────────────────────

export async function fetchSubmissions() {
  guard()
  const { data, error } = await supabase
    .from('form_submissions')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map((row) => ({
    id: row.id,
    name: row.full_name,
    email: row.email,
    phone: row.phone || '',
    company: row.company || '',
    grade: row.grade_selected || '',
    content_type: row.content_type || '',
    duration: row.duration || '',
    budget: row.budget || '',
    message: row.project_brief || '',
    source: row.source || '',
    status: row.status || 'new',
    created_at: row.created_at,
  }))
}

export async function updateSubmissionStatus(id, status) {
  guard()
  const { error } = await supabase
    .from('form_submissions')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}
