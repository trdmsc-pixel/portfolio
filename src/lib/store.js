import { create } from 'zustand'
import { arrayMove } from '@dnd-kit/sortable'
import { isSupabaseConfigured } from './supabase'
import * as db from './supabaseData'

export const logo = '/brand/bhakty-studio-logo.png'

export const accent = {
  content: '#00e5ff',
  studio: '#8f5cff',
  cinema: '#ffb800',
  plasma: '#6dff6d',
  magenta: '#ff3df2',
}

const now = new Date().toISOString()

const defaults = {
  portfolio: [
    {
      id: 'p1',
      title: 'Temple of Light',
      category: 'Film',
      tier: 'Cinema',
      thumbnail: 'https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?auto=format&fit=crop&w=900&q=80',
      video_url: 'https://vimeo.com/',
      description: 'A cinematic devotional world built with AI production design.',
      tags: 'AI, Cinema, Devotional',
      is_featured: true,
      is_visible: true,
      created_at: now,
      sort_order: 1,
    },
    {
      id: 'p2',
      title: 'Brand Fire Reel',
      category: 'Advertisement',
      tier: 'Studio',
      thumbnail: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80',
      video_url: 'https://youtube.com/',
      description: 'High-energy launch visuals for a modern digital campaign.',
      tags: 'Brand, Reel, Motion',
      is_featured: false,
      is_visible: true,
      created_at: now,
      sort_order: 2,
    },
  ],
  videos: [
    {
      id: 'v1',
      title: 'Infinity Logo Motion',
      category: 'Brand',
      tier: 'Studio',
      duration: '0:42',
      views: '12.4k',
      thumbnail: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80',
      video_url: 'https://youtube.com/',
      tags: 'Logo, Motion',
      is_featured: true,
      is_visible: true,
      sort_order: 1,
    },
  ],
  media: [],
  tiers: [
    {
      id: 'content',
      name: 'Content Grade',
      tagline: 'Fast social-first production',
      description: 'AI-assisted production for reels, shorts, quick brand stories, and ongoing content calendars.',
      accent_color: accent.content,
      badge: 'FASTEST',
      cta_label: 'Book Content Grade',
      starting_price: 'From ₹10,000',
      is_visible: true,
      features: [
        { id: 'cf1', text: 'Script and storyboard', enabled: true },
        { id: 'cf2', text: 'AI visuals and voiceover', enabled: true },
        { id: 'cf3', text: '2 revision rounds', enabled: true },
      ],
    },
    {
      id: 'studio',
      name: 'Studio Grade',
      tagline: 'Premium brand storytelling',
      description: 'A stronger creative package with advanced post-production, sharper art direction, and 4K delivery.',
      accent_color: accent.violet,
      badge: 'MOST POPULAR',
      cta_label: 'Book Studio Grade',
      starting_price: 'From ₹35,000',
      is_visible: true,
      features: [
        { id: 'sf1', text: 'Advanced post-production', enabled: true },
        { id: 'sf2', text: 'Dedicated project manager', enabled: true },
        { id: 'sf3', text: '4K export and social cutdowns', enabled: true },
      ],
    },
    {
      id: 'cinema',
      name: 'Cinema Grade',
      tagline: 'Flagship cinematic worlds',
      description: 'Full creative direction for hero films, premium campaigns, music videos, and narrative shorts.',
      accent_color: accent.cinema,
      badge: 'PREMIUM',
      cta_label: 'Book Cinema Grade',
      starting_price: 'Custom Quote',
      is_visible: true,
      features: [
        { id: 'xf1', text: 'Director-led creative package', enabled: true },
        { id: 'xf2', text: 'Cinematic sound and grading', enabled: true },
        { id: 'xf3', text: 'Broadcast-ready master', enabled: true },
      ],
    },
  ],
  pricing: {
    content: {
      note: 'Bulk reels and monthly retainers available.',
      badge: 'From ₹10,000',
      rows: [
        { id: 'pr1', service: 'Short Reel', description: '15 to 45 second social asset', price: 10000, suffix: '/ video', is_visible: true },
        { id: 'pr2', service: 'Explainer Short', description: 'Up to 90 seconds', price: 18000, suffix: '/ video', is_visible: true },
      ],
    },
    studio: {
      note: 'Best for brand campaigns and music videos.',
      badge: 'From ₹35,000',
      rows: [
        { id: 'pr3', service: 'Brand Film', description: '2 to 4 minute cinematic edit', price: 35000, suffix: '/ project', is_visible: true },
        { id: 'pr4', service: 'Music Visualizer', description: 'Art-directed AI visual video', price: 45000, suffix: '/ track', is_visible: true },
      ],
    },
    cinema: {
      note: 'Built as custom productions.',
      badge: 'Custom Quote',
      rows: [
        { id: 'pr5', service: 'Hero Campaign Film', description: 'Premium creative direction and finish', price: 125000, suffix: '/ project', is_visible: true },
        { id: 'pr6', service: 'Short Film Package', description: 'Narrative film workflow', price: 180000, suffix: 'Custom Quote', is_visible: true },
      ],
    },
    global_note: 'All prices are exclusive of GST, talent licensing, paid media, and rush delivery unless stated otherwise.',
  },
  hero: {
    primary: "WE DON'T JUST CREATE CONTENT.",
    secondary: 'WE BUILD CINEMATIC WORLDS.',
    subtext: 'Bhakty Studio creates AI-powered films, reels, ads, and visual universes for brands and storytellers.',
    cta1_label: 'Start a Project',
    cta1_target: '#contact',
    cta2_label: 'View Work',
    cta2_target: '#work',
    background_video_url: '',
    about_heading: 'Delhi-born AI filmmaking studio',
    about_body: 'We combine art direction, AI production, editing, sound, and cinematic taste into one sharp creative pipeline.',
    portfolio_heading: 'Selected Work',
    portfolio_subheading: 'Films, ads, reels, and visual experiments.',
    pricing_heading: 'Production Grades',
    pricing_subheading: 'Transparent packages for different levels of ambition.',
    contact_heading: 'Start Your Film',
    contact_subheading: 'Send the brief. We shape the world.',
    footer_tagline: 'Create. Visualize. Inspire.',
    instagram_handle: '@notshaam',
    marquee_text: 'AI FILMMAKING / BRAND WORLDS / REELS / MUSIC VIDEOS / CINEMA GRADE',
    hero_bg_video_upload: '',
    hero_bg_video_opacity: 20,
    hero_image_url: '',
    hero_image_padding: 0,
    hero_image_radius: 16,
    hero_image_glow: false,
    hero_image_animate: true,
    hero_text_align: 'center',
    header_opacity: 80,
  },
  submissions: [],
  settings: {
    site_title: 'bhakty.studio',
    meta_description: 'AI filmmaking studio for brands, artists, and storytellers.',
    og_image: '',
    favicon: '',
    analytics_id: '',
    pixel_id: '',
    agency_email: 'hello@bhakty.studio',
    phone: '+91 99581 94155',
    instagram: '@notshaam',
    whatsapp: '+91 99581 94155',
    maintenance_mode: false,
    admin_name: 'Studio Owner',
    admin_avatar: logo,
    site_logo: '',
    logo_padding: 0,
    logo_margin: 0,
  },
  logs: [],
}

export const useCmsStore = create((set, get) => ({
  ...defaults,
  _loaded: false,
  addLog: (action, detail) =>
    set((state) => ({
      logs: [{ id: crypto.randomUUID(), action, detail, created_at: new Date().toISOString() }, ...state.logs].slice(0, 20),
    })),
  upsertItem: async (key, item, label = 'Content') => {
    const exists = get()[key].some((entry) => entry.id === item.id)
    const finalItem = exists ? item : { ...item, id: item.id || crypto.randomUUID(), sort_order: get()[key].length + 1 }
    const next = exists
      ? get()[key].map((entry) => (entry.id === finalItem.id ? finalItem : entry))
      : [finalItem, ...get()[key]]
    set({ [key]: next })
    get().addLog(`${label} saved`, finalItem.title || finalItem.filename || finalItem.name || 'Record updated')
    // Sync to Supabase
    if (isSupabaseConfigured) {
      try {
        if (key === 'portfolio') await db.upsertPortfolioItem(finalItem)
        else if (key === 'videos') await db.upsertVideoItem(finalItem)
      } catch (e) { console.error('Supabase sync error:', e) }
    }
  },
  removeItem: async (key, id, label = 'Content') => {
    set((state) => ({ [key]: state[key].filter((item) => item.id !== id) }))
    get().addLog(`${label} deleted`, id)
    if (isSupabaseConfigured) {
      try {
        if (key === 'portfolio') await db.deletePortfolioItem(id)
        else if (key === 'videos') await db.deleteVideoItem(id)
      } catch (e) { console.error('Supabase delete error:', e) }
    }
  },
  reorder: async (key, activeId, overId, label = 'Content') => {
    const oldIndex = get()[key].findIndex((item) => item.id === activeId)
    const newIndex = get()[key].findIndex((item) => item.id === overId)
    if (oldIndex < 0 || newIndex < 0) return
    const reordered = arrayMove(get()[key], oldIndex, newIndex).map((item, index) => ({ ...item, sort_order: index + 1 }))
    set({ [key]: reordered })
    get().addLog(`${label} reordered`, 'Display order changed')
    if (isSupabaseConfigured) {
      try {
        if (key === 'portfolio') await db.reorderPortfolio(reordered)
        else if (key === 'videos') await db.reorderVideos(reordered)
      } catch (e) { console.error('Supabase reorder error:', e) }
    }
  },
  updateTier: async (tier) => {
    set((state) => ({ tiers: state.tiers.map((item) => (item.id === tier.id ? tier : item)) }))
    get().addLog('Tier saved', tier.name)
    if (isSupabaseConfigured) {
      try { await db.updateTierInDb(tier) } catch (e) { console.error('Supabase tier error:', e) }
    }
  },
  updatePricing: (pricing) => { set({ pricing }); get().addLog('Pricing updated', 'Pricing manager saved') },
  updateHero: async (hero) => {
    set({ hero })
    get().addLog('Hero and taglines saved', 'Site copy updated')
    if (isSupabaseConfigured) {
      try {
        const entries = {
          hero_line_1: hero.primary,
          hero_line_2: hero.secondary,
          hero_subtext: hero.subtext,
          hero_video_url: hero.background_video_url || '',
          about_heading: hero.about_heading || '',
          about_body: hero.about_body || '',
          footer_tagline: hero.footer_tagline || '',
          instagram_handle: hero.instagram_handle || '',
          marquee_text: hero.marquee_text || '',
          hero_bg_video_upload: hero.hero_bg_video_upload || '',
          hero_bg_video_opacity: String(hero.hero_bg_video_opacity ?? 20),
          hero_image_url: hero.hero_image_url || '',
          hero_image_padding: String(hero.hero_image_padding ?? 0),
          hero_image_radius: String(hero.hero_image_radius ?? 16),
          hero_image_glow: hero.hero_image_glow ? 'true' : 'false',
          hero_image_animate: hero.hero_image_animate ? 'true' : 'false',
          hero_text_align: hero.hero_text_align || 'center',
          header_opacity: String(hero.header_opacity ?? 80),
        }
        await db.saveSiteContentBatch(entries)
      } catch (e) { console.error('Supabase hero error:', e) }
    }
  },
  updateSettings: async (settings) => {
    set({ settings })
    get().addLog('Settings saved', 'Global settings updated')
    if (isSupabaseConfigured) {
      try { await db.saveSiteSettings(settings) } catch (e) { console.error('Supabase settings error:', e) }
    }
  },
  updateSubmission: async (id, patch) => {
    set((state) => ({
      submissions: state.submissions.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }))
    if (isSupabaseConfigured && patch.status) {
      try { await db.updateSubmissionStatus(id, patch.status) } catch (e) { console.error('Supabase submission error:', e) }
    }
  },
  loadFromSupabase: async () => {
    if (!isSupabaseConfigured) { set({ _loaded: true }); return }
    try {
      const [portfolio, videos, tierData, submissions, siteContent, siteSettings] = await Promise.allSettled([
        db.fetchPortfolio(),
        db.fetchVideos(),
        db.fetchTiers(),
        db.fetchSubmissions(),
        db.fetchSiteContent(),
        db.fetchSiteSettings(),
      ])
      const patch = { _loaded: true }
      if (portfolio.status === 'fulfilled' && portfolio.value.length) patch.portfolio = portfolio.value
      if (videos.status === 'fulfilled' && videos.value.length) patch.videos = videos.value
      if (tierData.status === 'fulfilled' && tierData.value.length) patch.tiers = tierData.value
      if (submissions.status === 'fulfilled' && submissions.value.length) patch.submissions = submissions.value
      if (siteSettings.status === 'fulfilled' && siteSettings.value) patch.settings = { ...get().settings, ...siteSettings.value }
      if (siteContent.status === 'fulfilled' && Object.keys(siteContent.value).length) {
        const sc = siteContent.value
        patch.hero = {
          ...get().hero,
          primary: sc.hero_line_1 || get().hero.primary,
          secondary: sc.hero_line_2 || get().hero.secondary,
          subtext: sc.hero_subtext || get().hero.subtext,
          background_video_url: sc.hero_video_url || '',
          about_heading: sc.about_heading || get().hero.about_heading,
          about_body: sc.about_body || get().hero.about_body,
          footer_tagline: sc.footer_tagline || get().hero.footer_tagline,
          instagram_handle: sc.instagram_handle || get().hero.instagram_handle,
          marquee_text: sc.marquee_text || get().hero.marquee_text,
          hero_bg_video_upload: sc.hero_bg_video_upload || '',
          hero_bg_video_opacity: Number(sc.hero_bg_video_opacity) || 20,
          hero_image_url: sc.hero_image_url || '',
          hero_image_padding: Number(sc.hero_image_padding) || 0,
          hero_image_radius: sc.hero_image_radius !== undefined ? Number(sc.hero_image_radius) : 16,
          hero_image_glow: sc.hero_image_glow === 'true',
          hero_image_animate: sc.hero_image_animate === 'true',
          hero_text_align: sc.hero_text_align || get().hero.hero_text_align,
          header_opacity: sc.header_opacity !== undefined ? Number(sc.header_opacity) : 80,
        }
      }
      set(patch)
    } catch (e) {
      console.error('Failed to load Supabase data:', e)
      set({ _loaded: true })
    }
  },
}))
