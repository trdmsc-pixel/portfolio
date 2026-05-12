import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import { useForm, useWatch } from 'react-hook-form'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { create } from 'zustand'
import { Toaster, toast } from 'sonner'
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clapperboard,
  Edit3,
  Eye,
  EyeOff,
  GripVertical,
  Image as ImageIcon,
  Inbox,
  Layers3,
  LogOut,
  Menu,
  Plus,
  Rocket,
  Save,
  Search,
  Settings,
  Trash2,
  UploadCloud,
  Video,
  X,
} from 'lucide-react'
import { supabase, isSupabaseConfigured, adminEmail } from './lib/supabase'
import * as db from './lib/supabaseData'
import PublicSite from './PublicSite'

const queryClient = new QueryClient()
const logo = '/brand/bhakty-studio-logo.png'

const accent = {
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
      thumbnail:
        'https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?auto=format&fit=crop&w=900&q=80',
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
      thumbnail:
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80',
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
      thumbnail:
        'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80',
      video_url: 'https://youtube.com/',
      tags: 'Logo, Motion',
      is_featured: true,
      is_visible: true,
      sort_order: 1,
    },
    {
      id: 'v2',
      title: 'Cinema Grade Breakdown',
      category: 'Case Study',
      tier: 'Cinema',
      duration: '3:18',
      views: '8.2k',
      thumbnail:
        'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=900&q=80',
      video_url: 'https://vimeo.com/',
      tags: 'Case Study, AI',
      is_featured: false,
      is_visible: true,
      sort_order: 2,
    },
  ],
  media: [
    {
      id: 'm1',
      filename: 'bhakty-studio-logo.png',
      url: logo,
      dimensions: '1536 x 1024',
      size: '2.3 MB',
      used_in: 'Login, Sidebar, Brand',
      tags: 'logo, brand',
      uploaded_at: now,
    },
    {
      id: 'm2',
      filename: 'hero-cinematic-bg.jpg',
      url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
      dimensions: '1600 x 900',
      size: '184 KB',
      used_in: 'Hero BG',
      tags: 'hero, background',
      uploaded_at: now,
    },
  ],
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
    cta2_target: '#portfolio',
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
  },
  submissions: [
    {
      id: 's1',
      name: 'Aarav Mehta',
      email: 'aarav@example.com',
      phone: '+91 98765 43210',
      company: 'Mehta Foods',
      grade: 'Studio',
      content_type: 'Brand Film',
      duration: '3 minutes',
      budget: '₹60,000+',
      message: 'We need a cinematic launch film for a new product line.',
      source: 'Instagram',
      status: 'new',
      created_at: now,
    },
    {
      id: 's2',
      name: 'Riya Kapoor',
      email: 'riya@example.com',
      phone: '+91 99887 77665',
      company: 'Independent Artist',
      grade: 'Cinema',
      content_type: 'Music Video',
      duration: '4 minutes',
      budget: 'Custom Quote',
      message: 'Looking for a surreal AI-assisted devotional music video.',
      source: 'Referral',
      status: 'in_progress',
      created_at: now,
    },
  ],
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
  },
  logs: [
    { id: 'l1', action: 'Pricing updated', detail: 'Cinema Grade starting price changed', created_at: now },
    { id: 'l2', action: 'Portfolio reordered', detail: 'Temple of Light pinned first', created_at: now },
    { id: 'l3', action: 'Hero copy saved', detail: 'Primary line refreshed', created_at: now },
  ],
}

const useCmsStore = create((set, get) => ({
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
  // Load all data from Supabase
  loadFromSupabase: async () => {
    if (!isSupabaseConfigured) { set({ _loaded: true }); return }
    try {
      const [portfolio, videos, tierData, submissions, siteContent] = await Promise.allSettled([
        db.fetchPortfolio(),
        db.fetchVideos(),
        db.fetchTiers(),
        db.fetchSubmissions(),
        db.fetchSiteContent(),
      ])
      const patch = { _loaded: true }
      if (portfolio.status === 'fulfilled' && portfolio.value.length) patch.portfolio = portfolio.value
      if (videos.status === 'fulfilled' && videos.value.length) patch.videos = videos.value
      if (tierData.status === 'fulfilled' && tierData.value.length) patch.tiers = tierData.value
      if (submissions.status === 'fulfilled' && submissions.value.length) patch.submissions = submissions.value
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
        }
      }
      set(patch)
    } catch (e) {
      console.error('Failed to load Supabase data:', e)
      set({ _loaded: true })
    }
  },
}))

const nav = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'portfolio', label: 'Portfolio Manager', icon: Clapperboard },
  { id: 'videos', label: 'Video Gallery', icon: Video },
  { id: 'images', label: 'Image Manager', icon: ImageIcon },
  { id: 'tiers', label: 'Service Tiers', icon: Layers3 },
  { id: 'pricing', label: 'Pricing Manager', icon: CircleDollarSign },
  { id: 'hero', label: 'Hero & Taglines', icon: Edit3 },
  { id: 'inbox', label: 'Form Submissions', icon: Inbox },
  { id: 'settings', label: 'Site Settings', icon: Settings },
]

function useJelly() {
  const ref = useRef(null)
  const press = () => {
    if (!ref.current) return
    gsap.fromTo(
      ref.current,
      { scaleX: 0.97, scaleY: 0.9 },
      { scaleX: 1, scaleY: 1, duration: 0.7, ease: 'elastic.out(1, 0.32)' },
    )
  }
  return [ref, press]
}

function JellyButton({ children, className = '', variant = 'primary', icon: Icon, ...props }) {
  const [ref, press] = useJelly()
  const variants = {
    primary: 'bg-[linear-gradient(110deg,#00e5ff,#8f5cff,#ffb800,#6dff6d,#ff3df2,#00e5ff)] bg-[length:220%_100%] text-black shadow-glow hover:animate-shimmer',
    ghost: 'glass text-white hover:border-cyan/60 hover:text-cyan',
    danger: 'border border-danger/50 bg-danger/10 text-danger hover:bg-danger hover:text-white',
  }
  return (
    <button
      ref={ref}
      onMouseDown={press}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-body text-xs font-extrabold uppercase tracking-[0.18em] transition ${variants[variant]} ${className}`}
      {...props}
    >
      {Icon ? <Icon size={16} /> : null}
      {children}
    </button>
  )
}

function GlassPanel({ children, className = '' }) {
  return <div className={`glass rounded-2xl p-5 ${className}`}>{children}</div>
}

function Field({ label, children, counter }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between font-body text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">
        {label}
        {counter ? <span className="text-cyan/70">{counter}</span> : null}
      </span>
      {children}
    </label>
  )
}

function inputClass(extra = '') {
  return `w-full rounded-xl border border-white/10 bg-black/35 px-4 py-3 font-body text-sm text-white outline-none transition placeholder:text-white/25 focus:border-cyan/60 focus:shadow-[0_0_0_3px_rgba(0,229,255,0.12)] ${extra}`
}

function Modal({ title, open, onClose, children }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="glass max-h-[90vh] w-full max-w-3xl overflow-auto rounded-3xl p-6"
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ type: 'spring', damping: 22, stiffness: 220 }}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-heading text-2xl font-bold text-white">{title}</h2>
              <button className="rounded-full border border-white/10 p-2 text-white/60 hover:text-white" onClick={onClose}>
                <X size={18} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

function SortableCard({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className="relative">
      <button
        className="absolute left-3 top-3 z-10 rounded-lg bg-black/50 p-2 text-white/50 backdrop-blur hover:text-white"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} />
      </button>
      {children}
    </div>
  )
}

function Login({ onLogin }) {
  const { register, handleSubmit } = useForm({ defaultValues: { email: adminEmail, password: '' } })
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (values) => {
    setLoading(true)
    setError(false)
    try {
      if (isSupabaseConfigured) {
        const { data, error: authError } = await supabase.auth.signInWithPassword(values)
        if (authError || data?.user?.email !== adminEmail) throw authError || new Error('Admin email not allowlisted')
        onLogin(data.user)
      } else {
        if (values.email !== adminEmail || values.password.length < 6) throw new Error('Invalid local demo credentials')
        onLogin({ email: values.email, user_metadata: { name: 'Studio Owner' } })
      }
      toast.success('Welcome inside the studio')
    } catch (err) {
      setError(true)
      toast.error(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const forgotPassword = async () => {
    if (!isSupabaseConfigured) {
      toast.warning('Connect Supabase env vars to send reset emails')
      return
    }
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(adminEmail)
    resetError ? toast.error(resetError.message) : toast.success('Reset email sent')
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-void p-5 text-white noise">
      <div className="mesh mesh-one" />
      <div className="mesh mesh-two" />
      <motion.form
        onSubmit={handleSubmit(submit)}
        className={`glass relative z-10 w-full max-w-md rounded-3xl p-8 text-center ${error ? 'animate-shake border-danger/70 shadow-[0_0_42px_rgba(255,55,95,0.24)]' : ''}`}
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <img src={logo} alt="Bhakty Studio" className="mx-auto mb-4 h-28 w-auto object-contain drop-shadow-[0_0_30px_rgba(0,229,255,0.45)]" />
        <p className="mb-8 font-heading text-sm uppercase tracking-[0.35em] text-cyan">Private Admin CMS</p>
        {!isSupabaseConfigured ? (
          <div className="mb-5 rounded-2xl border border-ember/30 bg-ember/10 p-3 text-left font-body text-xs leading-relaxed text-ember/90">
            Supabase env vars are not configured. Local demo login is enabled with `{adminEmail}` and any password of 6+ characters.
          </div>
        ) : null}
        <div className="space-y-4 text-left">
          <Field label="Email">
            <input className={inputClass()} type="email" {...register('email', { required: true })} />
          </Field>
          <Field label="Password">
            <input className={inputClass()} type="password" {...register('password', { required: true })} />
          </Field>
        </div>
        <JellyButton className="mt-6 w-full" type="submit" disabled={loading}>
          {loading ? 'Entering...' : 'Enter The Studio'}
        </JellyButton>
        <button type="button" onClick={forgotPassword} className="mt-5 font-body text-xs font-semibold uppercase tracking-[0.2em] text-white/45 hover:text-cyan">
          Forgot Password
        </button>
      </motion.form>
    </main>
  )
}

function Shell({ page, setPage, collapsed, setCollapsed, onLogout, children }) {
  const unread = useCmsStore((s) => s.submissions.filter((item) => item.status === 'new').length)
  const settings = useCmsStore((s) => s.settings)
  const pageLabel = nav.find((item) => item.id === page)?.label || 'Dashboard'
  return (
    <div className="min-h-screen bg-void text-white noise">
      <div className="mesh mesh-one" />
      <div className="mesh mesh-two" />
      <aside className={`fixed inset-y-0 left-0 z-40 hidden border-r border-white/10 bg-black/35 backdrop-blur-2xl transition-all lg:block ${collapsed ? 'w-24' : 'w-80'}`}>
        <div className="flex h-full flex-col p-4">
          <div className="mb-8 flex items-center gap-3">
            <img src={logo} alt="Bhakty Studio" className="h-14 w-14 rounded-2xl object-cover shadow-glow" />
            {!collapsed ? (
              <div>
                <div className="font-heading text-lg font-bold uppercase tracking-[0.2em]">Bhakty</div>
                <div className="font-body text-xs uppercase tracking-[0.24em] text-white/40">Admin CMS</div>
              </div>
            ) : null}
          </div>
          <nav className="flex-1 space-y-2">
            {nav.map(({ id, label, icon: Icon }, index) => {
              const active = page === id
              return (
                <button
                  key={id}
                  onClick={() => setPage(id)}
                  className={`group flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left font-body text-sm font-bold transition duration-300 hover:scale-[1.025] hover:border-cyan/50 hover:text-cyan hover:shadow-glow ${
                    active ? 'border-cyan/60 bg-cyan/10 text-cyan shadow-glow' : 'border-transparent text-white/55'
                  }`}
                  style={{ borderLeftColor: active ? Object.values(accent)[index % 5] : 'transparent' }}
                >
                  <Icon size={19} />
                  {!collapsed ? <span className="flex-1">{label}</span> : null}
                  {!collapsed && id === 'inbox' && unread ? (
                    <span className="rounded-full bg-danger px-2 py-0.5 text-[10px] text-white">{unread}</span>
                  ) : null}
                </button>
              )
            })}
          </nav>
          <div className="glass rounded-2xl p-3">
            <div className="flex items-center gap-3">
              <img src={settings.admin_avatar || logo} alt="" className="h-10 w-10 rounded-full object-cover" />
              {!collapsed ? (
                <div className="min-w-0 flex-1">
                  <div className="truncate font-body text-sm font-bold">{settings.admin_name}</div>
                  <div className="truncate font-body text-xs text-white/40">{adminEmail}</div>
                </div>
              ) : null}
            </div>
            {!collapsed ? (
              <button onClick={onLogout} className="mt-3 flex w-full items-center gap-2 rounded-xl border border-white/10 px-3 py-2 font-body text-xs text-white/55 hover:text-danger">
                <LogOut size={15} /> Logout
              </button>
            ) : null}
          </div>
        </div>
      </aside>
      <div className={`relative z-10 transition-all ${collapsed ? 'lg:pl-24' : 'lg:pl-80'}`}>
        <header className="sticky top-0 z-30 border-b border-white/10 bg-void/65 px-4 py-4 backdrop-blur-2xl lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button className="rounded-xl border border-white/10 p-3 text-white/60 lg:hidden" onClick={() => setCollapsed(!collapsed)}>
                <Menu size={18} />
              </button>
              <button className="hidden rounded-xl border border-white/10 p-3 text-white/60 hover:text-cyan lg:block" onClick={() => setCollapsed(!collapsed)}>
                {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              </button>
              <div>
                <h1 className="font-heading text-xl font-black uppercase tracking-[0.18em] lg:text-3xl">{pageLabel}</h1>
                <div className="mt-1 font-body text-xs uppercase tracking-[0.22em] text-white/35">Admin / {pageLabel}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative rounded-2xl border border-white/10 p-3 text-white/60 hover:text-ember">
                <Bell size={18} />
                {unread ? <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger" /> : null}
              </button>
              <JellyButton icon={Plus} onClick={() => toast.info(`Quick action for ${pageLabel}`)}>
                Quick Action
              </JellyButton>
            </div>
          </div>
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}

function Dashboard() {
  const { portfolio, videos, media, submissions, tiers, logs } = useCmsStore()
  const cards = [
    ['Total Portfolio Items', portfolio.length, Clapperboard, accent.content],
    ['Videos Uploaded', videos.length, Video, accent.violet],
    ['Images in Gallery', media.length, ImageIcon, accent.magenta],
    ['New Form Submissions', submissions.filter((s) => s.status === 'new').length, Inbox, '#ff375f'],
    ['Active Tiers', tiers.filter((t) => t.is_visible).length, Layers3, accent.cinema],
    ['Last Updated', 'Now', CheckCircle2, accent.plasma],
  ]
  return (
    <PageGrid>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map(([label, value, Icon, color]) => (
          <GlassPanel key={label} className="relative overflow-hidden">
            <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full blur-3xl" style={{ background: `${color}30` }} />
            <Icon className="mb-6" color={color} />
            <div className="font-heading text-4xl font-black">{value}</div>
            <div className="mt-2 font-body text-xs uppercase tracking-[0.22em] text-white/45">{label}</div>
          </GlassPanel>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <GlassPanel>
          <SectionTitle title="Recent Form Submissions" />
          <div className="space-y-3">
            {submissions.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div>
                  <div className="font-body font-bold">{item.name}</div>
                  <div className="font-body text-xs text-white/40">{item.grade} / {new Date(item.created_at).toLocaleDateString()}</div>
                </div>
                <JellyButton variant="ghost" onClick={() => toast.info(item.message)}>View</JellyButton>
              </div>
            ))}
          </div>
        </GlassPanel>
        <GlassPanel>
          <SectionTitle title="Quick Actions" />
          <div className="grid gap-3">
            {['Upload Video', 'Add Portfolio Item', 'Edit Hero Text', 'Update Pricing'].map((label) => (
              <JellyButton key={label} variant="ghost" icon={Rocket} onClick={() => toast.success(`${label} ready`)}>
                {label}
              </JellyButton>
            ))}
          </div>
        </GlassPanel>
      </div>
      <GlassPanel>
        <SectionTitle title="Activity Log" />
        <div className="grid gap-3 md:grid-cols-3">
          {logs.slice(0, 6).map((log) => (
            <div key={log.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="font-body text-sm font-bold text-cyan">{log.action}</div>
              <div className="mt-1 font-body text-xs text-white/45">{log.detail}</div>
            </div>
          ))}
        </div>
      </GlassPanel>
    </PageGrid>
  )
}

function SectionTitle({ title, action }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <h2 className="font-heading text-xl font-bold uppercase tracking-[0.14em] text-white">{title}</h2>
      {action}
    </div>
  )
}

function PageGrid({ children }) {
  return <div className="mx-auto grid max-w-7xl gap-5">{children}</div>
}

function ContentManager({ type }) {
  const key = type === 'portfolio' ? 'portfolio' : 'videos'
  const title = type === 'portfolio' ? 'Portfolio Manager' : 'Video Gallery Manager'
  const items = useCmsStore((s) => s[key])
  const upsert = useCmsStore((s) => s.upsertItem)
  const remove = useCmsStore((s) => s.removeItem)
  const reorder = useCmsStore((s) => s.reorder)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [editing, setEditing] = useState(null)
  const sensors = useSensors(useSensor(PointerSensor))
  const categories = ['All', ...new Set(items.map((item) => item.category))]
  const filtered = items.filter((item) => {
    const matchCategory = category === 'All' || item.category === category
    const matchQuery = `${item.title} ${item.tags} ${item.description || ''}`.toLowerCase().includes(query.toLowerCase())
    return matchCategory && matchQuery
  })

  return (
    <PageGrid>
      <GlassPanel>
        <SectionTitle
          title={title}
          action={<JellyButton icon={Plus} onClick={() => setEditing({})}>Add {type === 'portfolio' ? 'Item' : 'Video'}</JellyButton>}
        />
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <input className={inputClass('pl-11')} placeholder="Search by title, keyword, tag..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <select className={inputClass()} value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((cat) => <option key={cat}>{cat}</option>)}
          </select>
        </div>
      </GlassPanel>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={({ active, over }) => over && active.id !== over.id && reorder(key, active.id, over.id, title)}
      >
        <SortableContext items={filtered.map((item) => item.id)} strategy={rectSortingStrategy}>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item) => (
              <SortableCard key={item.id} id={item.id}>
                <GlassPanel className="overflow-hidden p-0">
                  <div className="relative aspect-video overflow-hidden rounded-t-2xl bg-white/5">
                    <img src={item.thumbnail} alt="" className="h-full w-full object-cover transition duration-700 hover:scale-105" />
                    <div className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 font-body text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: item.tier === 'Cinema' ? accent.cinema : item.tier === 'Studio' ? accent.violet : accent.content }}>
                      {item.tier}
                    </div>
                    {!item.is_visible ? <div className="absolute inset-0 grid place-items-center bg-black/70 font-heading text-2xl">Hidden</div> : null}
                  </div>
                  <div className="p-5">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <h3 className="font-heading text-lg font-bold">{item.title}</h3>
                      <span className="rounded-full border border-white/10 px-3 py-1 font-body text-[10px] uppercase tracking-[0.15em] text-white/50">{item.category}</span>
                    </div>
                    <p className="min-h-10 font-body text-sm text-white/45">{item.description || item.tags}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <JellyButton variant="ghost" icon={Edit3} onClick={() => setEditing(item)}>Edit</JellyButton>
                      <JellyButton variant="ghost" icon={item.is_visible ? Eye : EyeOff} onClick={() => upsert(key, { ...item, is_visible: !item.is_visible }, title)}>
                        {item.is_visible ? 'Visible' : 'Hidden'}
                      </JellyButton>
                      <JellyButton variant="danger" icon={Trash2} onClick={() => remove(key, item.id, title)}>Delete</JellyButton>
                    </div>
                  </div>
                </GlassPanel>
              </SortableCard>
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <EditorModal type={type} item={editing} onClose={() => setEditing(null)} onSave={(item) => { upsert(key, item, title); setEditing(null); toast.success(`${title} saved`) }} />
    </PageGrid>
  )
}

function EditorModal({ type, item, onClose, onSave }) {
  const isVideo = type === 'videos'
  const { register, handleSubmit, control } = useForm({
    values: {
      id: item?.id || crypto.randomUUID(),
      title: item?.title || '',
      category: item?.category || (isVideo ? 'Brand' : 'Film'),
      tier: item?.tier || 'Studio',
      thumbnail: item?.thumbnail || '',
      video_url: item?.video_url || '',
      description: item?.description || '',
      tags: item?.tags || '',
      duration: item?.duration || '',
      views: item?.views || '',
      is_featured: item?.is_featured || false,
      is_visible: item?.is_visible ?? true,
      created_at: item?.created_at || now,
      sort_order: item?.sort_order || 99,
    },
  })
  const preview = useWatch({ control })
  return (
    <Modal title={item?.title ? `Edit ${item.title}` : `Add ${isVideo ? 'Video' : 'Portfolio Item'}`} open={!!item} onClose={onClose}>
      <form onSubmit={handleSubmit(onSave)} className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <div className="grid gap-4">
          <Field label="Title"><input className={inputClass()} {...register('title', { required: true })} /></Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Category">
              <select className={inputClass()} {...register('category')}>
                {['Film', 'Advertisement', 'Short Film', 'Reel', 'YouTube', 'Brand', 'Case Study', 'Other'].map((v) => <option key={v}>{v}</option>)}
              </select>
            </Field>
            <Field label="Grade Tier">
              <select className={inputClass()} {...register('tier')}>
                {['Content', 'Studio', 'Cinema'].map((v) => <option key={v}>{v}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Thumbnail Image URL"><input className={inputClass()} {...register('thumbnail')} /></Field>
          <Field label="Video URL"><input className={inputClass()} {...register('video_url')} /></Field>
          {isVideo ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Duration"><input className={inputClass()} {...register('duration')} /></Field>
              <Field label="View Count"><input className={inputClass()} {...register('views')} /></Field>
            </div>
          ) : null}
          <Field label="Short Description" counter={`${preview.description?.length || 0} chars`}>
            <textarea className={inputClass('min-h-28 resize-none')} {...register('description')} />
          </Field>
          <Field label="Tags"><input className={inputClass()} {...register('tags')} /></Field>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex items-center gap-3 rounded-2xl border border-white/10 p-4 font-body text-sm"><input type="checkbox" {...register('is_featured')} /> Featured</label>
            <label className="flex items-center gap-3 rounded-2xl border border-white/10 p-4 font-body text-sm"><input type="checkbox" {...register('is_visible')} /> Public Visible</label>
          </div>
          <JellyButton type="submit" icon={Save}>Save</JellyButton>
        </div>
        <GlassPanel className="h-fit">
          <SectionTitle title="Instant Preview" />
          <div className="overflow-hidden rounded-2xl border border-white/10">
            {preview.thumbnail ? <img src={preview.thumbnail} alt="" className="aspect-video w-full object-cover" /> : <div className="grid aspect-video place-items-center bg-white/5 text-white/30">Thumbnail</div>}
            <div className="p-4">
              <div className="font-heading text-lg">{preview.title || 'Untitled'}</div>
              <div className="mt-1 font-body text-xs text-white/45">{preview.category} / {preview.tier}</div>
              <p className="mt-3 font-body text-sm text-white/50">{preview.description || 'Description preview appears here.'}</p>
            </div>
          </div>
        </GlassPanel>
      </form>
    </Modal>
  )
}

function ImageManager() {
  const media = useCmsStore((s) => s.media)
  const upsert = useCmsStore((s) => s.upsertItem)
  const remove = useCmsStore((s) => s.removeItem)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const filtered = media.filter((item) => `${item.filename} ${item.tags} ${item.used_in}`.toLowerCase().includes(query.toLowerCase()))
  const addMock = () => {
    upsert('media', {
      id: crypto.randomUUID(),
      filename: 'cloudinary-upload-placeholder.jpg',
      url: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=80',
      dimensions: '1200 x 800',
      size: '< 200 KB',
      used_in: 'Unassigned',
      tags: 'uploaded, cloudinary',
      uploaded_at: new Date().toISOString(),
    }, 'Media')
    toast.success('Media asset added. Connect Cloudinary env vars for real uploads.')
  }
  return (
    <PageGrid>
      <GlassPanel>
        <SectionTitle title="Image Manager" action={<JellyButton icon={UploadCloud} onClick={addMock}>Upload</JellyButton>} />
        <input className={inputClass()} placeholder="Search filename or tag..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </GlassPanel>
      <div className="columns-1 gap-5 md:columns-2 xl:columns-3">
        {filtered.map((item) => (
          <button key={item.id} onClick={() => setSelected(item)} className="glass mb-5 block w-full break-inside-avoid overflow-hidden rounded-2xl p-0 text-left">
            <img src={item.url} alt="" className="w-full object-cover" />
            <div className="p-4">
              <div className="font-body text-sm font-bold">{item.filename}</div>
              <div className="mt-1 font-body text-xs text-white/40">{item.dimensions} / {item.size}</div>
            </div>
          </button>
        ))}
      </div>
      <Modal title="Image Details" open={!!selected} onClose={() => setSelected(null)}>
        {selected ? (
          <div className="grid gap-5 md:grid-cols-2">
            <img src={selected.url} alt="" className="rounded-2xl" />
            <div className="space-y-3 font-body text-sm text-white/60">
              <p><b className="text-white">Filename:</b> {selected.filename}</p>
              <p><b className="text-white">Dimensions:</b> {selected.dimensions}</p>
              <p><b className="text-white">Used in:</b> {selected.used_in}</p>
              <p><b className="text-white">URL:</b> {selected.url}</p>
              <div className="flex gap-2 pt-3">
                <JellyButton variant="ghost" onClick={() => navigator.clipboard.writeText(selected.url).then(() => toast.success('URL copied'))}>Copy URL</JellyButton>
                <JellyButton variant="danger" onClick={() => { remove('media', selected.id, 'Media'); setSelected(null) }}>Delete</JellyButton>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </PageGrid>
  )
}

function TiersEditor() {
  const tiers = useCmsStore((s) => s.tiers)
  const updateTier = useCmsStore((s) => s.updateTier)
  const [drafts, setDrafts] = useState(tiers)
  const setTier = (id, patch) => setDrafts((items) => items.map((tier) => (tier.id === id ? { ...tier, ...patch } : tier)))
  const saveAll = () => {
    drafts.forEach(updateTier)
    toast.success('All service tiers saved')
  }
  return (
    <PageGrid>
      <div className="flex justify-end"><JellyButton icon={Save} onClick={saveAll}>Save All Tiers</JellyButton></div>
      <div className="grid gap-5 xl:grid-cols-3">
        {drafts.map((tier) => (
          <GlassPanel key={tier.id}>
            <div className="mb-5 rounded-2xl border p-5" style={{ borderColor: `${tier.accent_color}55`, boxShadow: `0 0 35px ${tier.accent_color}18` }}>
              <div className="font-body text-[10px] uppercase tracking-[0.25em]" style={{ color: tier.accent_color }}>{tier.badge || 'Tier'}</div>
              <div className="mt-3 font-heading text-2xl font-black">{tier.name}</div>
              <p className="mt-2 font-body text-sm text-white/50">{tier.tagline}</p>
              <div className="mt-4 font-heading text-xl" style={{ color: tier.accent_color }}>{tier.starting_price}</div>
            </div>
            <div className="grid gap-3">
              <Field label="Tier Name"><input className={inputClass()} value={tier.name} onChange={(e) => setTier(tier.id, { name: e.target.value })} /></Field>
              <Field label="Tagline"><input className={inputClass()} value={tier.tagline} onChange={(e) => setTier(tier.id, { tagline: e.target.value })} /></Field>
              <Field label="Description"><textarea className={inputClass('min-h-24 resize-none')} value={tier.description} onChange={(e) => setTier(tier.id, { description: e.target.value })} /></Field>
              <Field label="Accent Color"><input className={`${inputClass()} h-12`} type="color" value={tier.accent_color} onChange={(e) => setTier(tier.id, { accent_color: e.target.value })} /></Field>
              <Field label="Badge"><input className={inputClass()} value={tier.badge} onChange={(e) => setTier(tier.id, { badge: e.target.value })} /></Field>
              <Field label="CTA Label"><input className={inputClass()} value={tier.cta_label} onChange={(e) => setTier(tier.id, { cta_label: e.target.value })} /></Field>
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 p-4 font-body text-sm"><input type="checkbox" checked={tier.is_visible} onChange={(e) => setTier(tier.id, { is_visible: e.target.checked })} /> Show tier publicly</label>
              <SectionTitle title="Features" action={<button className="text-cyan" onClick={() => setTier(tier.id, { features: [...tier.features, { id: crypto.randomUUID(), text: 'New feature', enabled: true }] })}><Plus size={18} /></button>} />
              {tier.features.map((feature) => (
                <div key={feature.id} className="grid grid-cols-[auto_1fr_auto] gap-2">
                  <input type="checkbox" checked={feature.enabled} onChange={(e) => setTier(tier.id, { features: tier.features.map((f) => (f.id === feature.id ? { ...f, enabled: e.target.checked } : f)) })} />
                  <input className={inputClass()} value={feature.text} onChange={(e) => setTier(tier.id, { features: tier.features.map((f) => (f.id === feature.id ? { ...f, text: e.target.value } : f)) })} />
                  <button className="rounded-xl border border-white/10 px-3 text-danger" onClick={() => setTier(tier.id, { features: tier.features.filter((f) => f.id !== feature.id) })}><Trash2 size={16} /></button>
                </div>
              ))}
              <JellyButton variant="ghost" onClick={() => { updateTier(tier); toast.success(`${tier.name} saved`) }}>Save Tier</JellyButton>
            </div>
          </GlassPanel>
        ))}
      </div>
    </PageGrid>
  )
}

function PricingManager() {
  const pricing = useCmsStore((s) => s.pricing)
  const updatePricing = useCmsStore((s) => s.updatePricing)
  const [draft, setDraft] = useState(pricing)
  const [tab, setTab] = useState('content')
  const tier = draft[tab]
  const money = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value || 0))
  const setRows = (rows) => setDraft({ ...draft, [tab]: { ...tier, rows } })
  return (
    <PageGrid>
      <GlassPanel>
        <div className="mb-5 flex flex-wrap gap-2">
          {['content', 'studio', 'cinema'].map((id) => (
            <button key={id} className={`rounded-xl border px-4 py-3 font-body text-xs font-bold uppercase tracking-[0.18em] ${tab === id ? 'border-cyan bg-cyan/10 text-cyan' : 'border-white/10 text-white/45'}`} onClick={() => setTab(id)}>
              {id} Grade
            </button>
          ))}
        </div>
        <div className="grid gap-4">
          {tier.rows.map((row) => (
            <div key={row.id} className="grid gap-3 rounded-2xl border border-white/10 p-4 md:grid-cols-[1fr_1fr_150px_150px_auto]">
              <input className={inputClass()} value={row.service} onChange={(e) => setRows(tier.rows.map((r) => (r.id === row.id ? { ...r, service: e.target.value } : r)))} />
              <input className={inputClass()} value={row.description} onChange={(e) => setRows(tier.rows.map((r) => (r.id === row.id ? { ...r, description: e.target.value } : r)))} />
              <input className={inputClass()} type="number" value={row.price} onChange={(e) => setRows(tier.rows.map((r) => (r.id === row.id ? { ...r, price: e.target.value } : r)))} />
              <input className={inputClass()} value={row.suffix} onChange={(e) => setRows(tier.rows.map((r) => (r.id === row.id ? { ...r, suffix: e.target.value } : r)))} />
              <button className="rounded-xl border border-danger/40 px-3 text-danger" onClick={() => setRows(tier.rows.filter((r) => r.id !== row.id))}><Trash2 size={16} /></button>
              <div className="font-body text-xs text-white/35 md:col-span-5">Preview: {money(row.price)} {row.suffix}</div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <JellyButton variant="ghost" icon={Plus} onClick={() => setRows([...tier.rows, { id: crypto.randomUUID(), service: 'New Package', description: 'Short description', price: 0, suffix: '/ project', is_visible: true }])}>Add Row</JellyButton>
          <JellyButton icon={Rocket} onClick={() => { updatePricing(draft); toast.success('Pricing changes published') }}>Publish Pricing Changes</JellyButton>
        </div>
      </GlassPanel>
      <GlassPanel>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Starting Price Badge"><input className={inputClass()} value={tier.badge} onChange={(e) => setDraft({ ...draft, [tab]: { ...tier, badge: e.target.value } })} /></Field>
          <Field label="Bulk Deal Note"><textarea className={inputClass('min-h-24 resize-none')} value={tier.note} onChange={(e) => setDraft({ ...draft, [tab]: { ...tier, note: e.target.value } })} /></Field>
          <Field label="Global Note"><textarea className={inputClass('min-h-24 resize-none')} value={draft.global_note} onChange={(e) => setDraft({ ...draft, global_note: e.target.value })} /></Field>
        </div>
      </GlassPanel>
    </PageGrid>
  )
}

function HeroEditor() {
  const hero = useCmsStore((s) => s.hero)
  const updateHero = useCmsStore((s) => s.updateHero)
  const { register, handleSubmit, control } = useForm({ values: hero })
  const values = useWatch({ control })
  const fields = [
    ['primary', 'Hero Primary Line'],
    ['secondary', 'Hero Secondary Line'],
    ['subtext', 'Hero Subtext'],
    ['cta1_label', 'CTA 1 Label'],
    ['cta1_target', 'CTA 1 Scroll Target'],
    ['cta2_label', 'CTA 2 Label'],
    ['cta2_target', 'CTA 2 Scroll Target'],
    ['background_video_url', 'Background Video URL'],
    ['about_heading', 'About Heading'],
    ['about_body', 'About Body'],
    ['portfolio_heading', 'Portfolio Heading'],
    ['portfolio_subheading', 'Portfolio Subheading'],
    ['pricing_heading', 'Pricing Heading'],
    ['pricing_subheading', 'Pricing Subheading'],
    ['contact_heading', 'Contact Heading'],
    ['contact_subheading', 'Contact Subheading'],
    ['footer_tagline', 'Footer Tagline'],
    ['instagram_handle', 'Instagram Handle'],
    ['marquee_text', 'Marquee Ticker Text'],
  ]
  return (
    <PageGrid>
      <form onSubmit={handleSubmit((data) => { updateHero(data); toast.success('Hero and taglines saved') })} className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <GlassPanel className="grid gap-4">
          <SectionTitle title="Hero & Taglines Editor" />
          {fields.map(([name, label]) => (
            <Field key={name} label={label} counter={`${values[name]?.length || 0}`}>
              {name.includes('body') || name.includes('subtext') || name.includes('marquee') ? (
                <textarea className={inputClass('min-h-24 resize-none')} {...register(name)} />
              ) : (
                <input className={inputClass()} {...register(name)} />
              )}
            </Field>
          ))}
          <JellyButton type="submit" icon={Save}>Save Copy</JellyButton>
        </GlassPanel>
        <GlassPanel className="sticky top-28 h-fit">
          <SectionTitle title="Live Hero Preview" />
          <div className="rounded-3xl border border-cyan/20 bg-black/50 p-7">
            <div className="font-body text-xs uppercase tracking-[0.3em] text-cyan">bhakty.studio</div>
            <div className="mt-6 font-heading text-4xl font-black leading-tight">{values.primary}</div>
            <div className="font-heading text-4xl font-black leading-tight text-ember">{values.secondary}</div>
            <p className="mt-5 font-body text-sm leading-relaxed text-white/55">{values.subtext}</p>
            <div className="mt-6 flex gap-3">
              <span className="rounded-xl bg-cyan px-4 py-3 font-body text-xs font-bold uppercase text-black">{values.cta1_label}</span>
              <span className="rounded-xl border border-white/15 px-4 py-3 font-body text-xs font-bold uppercase text-white">{values.cta2_label}</span>
            </div>
          </div>
        </GlassPanel>
      </form>
    </PageGrid>
  )
}

function InboxPage() {
  const submissions = useCmsStore((s) => s.submissions)
  const updateSubmission = useCmsStore((s) => s.updateSubmission)
  const [selected, setSelected] = useState(null)
  const [status, setStatus] = useState('all')
  const filtered = submissions.filter((item) => status === 'all' || item.status === status)
  const colors = { new: 'text-danger border-danger/40', viewed: 'text-ember border-ember/40', in_progress: 'text-cyan border-cyan/40', closed: 'text-plasma border-plasma/40' }
  return (
    <PageGrid>
      <GlassPanel>
        <SectionTitle title="Form Submissions Inbox" />
        <select className={inputClass('mb-4 max-w-xs')} value={status} onChange={(e) => setStatus(e.target.value)}>
          {['all', 'new', 'viewed', 'in_progress', 'closed'].map((v) => <option key={v}>{v}</option>)}
        </select>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left font-body text-sm">
            <thead className="text-xs uppercase tracking-[0.18em] text-white/35">
              <tr><th className="p-3">Name</th><th>Email</th><th>Grade</th><th>Content Type</th><th>Budget</th><th>Date</th><th>Status</th></tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} onClick={() => setSelected(item)} className="cursor-pointer border-t border-white/10 hover:bg-white/[0.03]">
                  <td className="p-3 font-bold">{item.name}</td>
                  <td>{item.email}</td>
                  <td>{item.grade}</td>
                  <td>{item.content_type}</td>
                  <td>{item.budget}</td>
                  <td>{new Date(item.created_at).toLocaleDateString()}</td>
                  <td><span className={`rounded-full border px-3 py-1 text-xs ${colors[item.status]}`}>{item.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>
      <Modal title="Submission Detail" open={!!selected} onClose={() => setSelected(null)}>
        {selected ? (
          <div className="grid gap-4">
            {['name', 'email', 'phone', 'company', 'grade', 'content_type', 'duration', 'budget', 'message', 'source'].map((field) => (
              <div key={field} className="rounded-2xl border border-white/10 p-4">
                <div className="font-body text-[10px] uppercase tracking-[0.2em] text-white/35">{field.replace('_', ' ')}</div>
                <div className="mt-1 font-body text-sm text-white/80">{selected[field]}</div>
              </div>
            ))}
            <div className="flex flex-wrap gap-3">
              <JellyButton variant="ghost" onClick={() => window.location.href = `mailto:${selected.email}?subject=Bhakty Studio Project`}>Reply via Email</JellyButton>
              <JellyButton onClick={() => { updateSubmission(selected.id, { status: 'in_progress' }); setSelected({ ...selected, status: 'in_progress' }) }}>Mark In Progress</JellyButton>
              <JellyButton variant="ghost" onClick={() => { updateSubmission(selected.id, { status: 'closed' }); setSelected({ ...selected, status: 'closed' }) }}>Archive / Close</JellyButton>
            </div>
          </div>
        ) : null}
      </Modal>
    </PageGrid>
  )
}

function SettingsPage() {
  const settings = useCmsStore((s) => s.settings)
  const updateSettings = useCmsStore((s) => s.updateSettings)
  const { register, handleSubmit, control } = useForm({ values: settings })
  const values = useWatch({ control })
  const saveSettings = async (data) => {
    const nextSettings = { ...data, maintenance_mode: Boolean(data.maintenance_mode) }
    try {
      await updateSettings(nextSettings)
      toast.success('Settings saved')
    } catch (error) {
      toast.error(error.message || 'Settings could not be saved')
    }
  }
  const fields = [
    ['site_title', 'Site Title'],
    ['meta_description', 'Meta Description'],
    ['og_image', 'OG Image URL'],
    ['favicon', 'Favicon URL'],
    ['analytics_id', 'Google Analytics ID'],
    ['pixel_id', 'Meta Pixel ID'],
    ['agency_email', 'Agency Email'],
    ['phone', 'Phone Number'],
    ['instagram', 'Instagram Handle'],
    ['whatsapp', 'WhatsApp Business Number'],
    ['admin_name', 'Admin Name'],
    ['admin_avatar', 'Admin Avatar URL'],
  ]
  return (
    <PageGrid>
      <form onSubmit={handleSubmit(saveSettings)} className="grid gap-5">
        <GlassPanel>
          <SectionTitle title="Site Settings" />
          <div className="grid gap-4 md:grid-cols-2">
            {fields.map(([name, label]) => (
              <Field key={name} label={label}>
                {name === 'meta_description' ? <textarea className={inputClass('min-h-24 resize-none')} {...register(name)} /> : <input className={inputClass()} {...register(name)} />}
              </Field>
            ))}
          </div>
          <label className="mt-5 flex items-center gap-3 rounded-2xl border border-ember/30 bg-ember/10 p-4 font-body text-sm text-ember">
            <input type="checkbox" {...register('maintenance_mode')} /> Maintenance Mode
          </label>
          <JellyButton className="mt-5" type="submit" icon={Save}>Save Settings</JellyButton>
        </GlassPanel>
        <GlassPanel className="border-danger/30">
          <SectionTitle title="Danger Zone" />
          <div className="flex flex-wrap gap-3">
            {['Clear all form submissions', 'Reset portfolio to default', 'Full cache clear'].map((label) => (
              <JellyButton key={label} variant="danger" onClick={() => toast.warning(`${label} requires Supabase confirmation workflow`)}>
                {label}
              </JellyButton>
            ))}
          </div>
        </GlassPanel>
        {values.maintenance_mode ? (
          <GlassPanel className="border-ember/40 text-ember">Maintenance mode preview: public site would show a glass Coming Soon page while admin remains accessible.</GlassPanel>
        ) : null}
      </form>
    </PageGrid>
  )
}

function AppInner() {
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('dashboard')
  const [collapsed, setCollapsed] = useState(false)
  const isAdminRoute = window.location.pathname.startsWith('/admin')
  const loadFromSupabase = useCmsStore((s) => s.loadFromSupabase)
  const loaded = useCmsStore((s) => s._loaded)

  // Restore Supabase auth session on mount
  useEffect(() => {
    if (!isAdminRoute || !isSupabaseConfigured) return
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email === adminEmail) {
        setUser(session.user)
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email === adminEmail) {
        setUser(session.user)
      } else if (!session) {
        setUser(null)
      }
    })
    return () => subscription?.unsubscribe()
  }, [isAdminRoute])

  // Load CMS data from Supabase when admin is logged in
  useEffect(() => {
    if (user && !loaded) {
      loadFromSupabase()
    }
  }, [user, loaded, loadFromSupabase])

  const pageMap = {
    dashboard: <Dashboard />,
    portfolio: <ContentManager type="portfolio" />,
    videos: <ContentManager type="videos" />,
    images: <ImageManager />,
    tiers: <TiersEditor />,
    pricing: <PricingManager />,
    hero: <HeroEditor />,
    inbox: <InboxPage />,
    settings: <SettingsPage />,
  }
  const logout = async () => {
    if (isSupabaseConfigured) await supabase.auth.signOut()
    setUser(null)
    toast.success('Logged out')
  }

  if (!isAdminRoute) {
    return (
      <>
        <Toaster
          position="bottom-right"
          toastOptions={{
            classNames: {
              toast: 'glass border border-cyan/30 text-white font-body',
              title: 'text-white',
              description: 'text-white/60',
            },
          }}
        />
        <PublicSite />
      </>
    )
  }

  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast: 'glass border border-cyan/30 text-white font-body',
            title: 'text-white',
            description: 'text-white/60',
          },
        }}
      />
      {user ? (
        <Shell page={page} setPage={setPage} collapsed={collapsed} setCollapsed={setCollapsed} onLogout={logout}>
          {!loaded ? (
            <div className="grid min-h-[60vh] place-items-center">
              <div className="text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-cyan/30 border-t-cyan" />
                <p className="mt-4 font-body text-sm text-white/45">Loading studio data...</p>
              </div>
            </div>
          ) : (
            pageMap[page]
          )}
        </Shell>
      ) : (
        <Login onLogin={setUser} />
      )}
    </>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  )
}
