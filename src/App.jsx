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
  Film,
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
import { useCmsStore, accent, logo } from './lib/store'

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
        if (authError) throw authError
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

function NotificationBell({ setPage }) {
  const submissions = useCmsStore((s) => s.submissions)
  const logs = useCmsStore((s) => s.logs)
  const [open, setOpen] = useState(false)
  const [lastSeen, setLastSeen] = useState(() => {
    try { return localStorage.getItem('bhakty_notif_seen') || '2000-01-01T00:00:00Z' } catch { return '2000-01-01T00:00:00Z' }
  })
  const bellRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (bellRef.current && !bellRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const newSubmissions = submissions.filter((s) => s.status === 'new' && s.created_at > lastSeen)
  const recentLogs = logs.filter((l) => l.created_at > lastSeen)
  const totalNew = newSubmissions.length + recentLogs.length

  const markSeen = () => {
    const now = new Date().toISOString()
    setLastSeen(now)
    try { localStorage.setItem('bhakty_notif_seen', now) } catch {}
  }

  const handleOpen = () => {
    setOpen(!open)
    if (!open) {
      // Mark as seen after a brief delay so user sees the items
      setTimeout(markSeen, 2000)
    }
  }

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    if (diff < 60000) return 'just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return `${Math.floor(diff / 86400000)}d ago`
  }

  return (
    <div ref={bellRef} className="relative">
      <button onClick={handleOpen} className="relative rounded-2xl border border-white/10 p-3 text-white/60 hover:text-ember transition">
        <Bell size={18} />
        {totalNew > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 font-body text-[10px] font-black text-white animate-pulse">
            {totalNew > 99 ? '99+' : totalNew}
          </span>
        ) : null}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-full z-50 mt-3 w-96 max-h-[70vh] overflow-hidden rounded-2xl border border-white/10 bg-black/90 shadow-2xl backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <h3 className="font-heading text-sm font-black uppercase tracking-[0.15em]">Notifications</h3>
                <p className="mt-0.5 font-body text-[10px] text-white/40">{totalNew} new updates</p>
              </div>
              {totalNew > 0 ? (
                <button onClick={markSeen} className="font-body text-[10px] font-bold uppercase tracking-[0.15em] text-cyan hover:text-white transition">
                  Mark all read
                </button>
              ) : null}
            </div>

            {/* Content */}
            <div className="max-h-80 overflow-y-auto">
              {/* New Submissions */}
              {newSubmissions.length > 0 ? (
                <div className="border-b border-white/5 px-2 py-2">
                  <div className="px-3 py-2 font-body text-[10px] font-black uppercase tracking-[0.2em] text-ember">New Submissions</div>
                  {newSubmissions.slice(0, 5).map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => { setPage('inbox'); setOpen(false) }}
                      className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-white/5"
                    >
                      <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-danger" />
                      <div className="min-w-0 flex-1">
                        <div className="font-body text-sm font-bold text-white">{sub.full_name || 'Anonymous'}</div>
                        <div className="mt-0.5 truncate font-body text-xs text-white/40">{sub.grade_selected || sub.content_type || 'New enquiry'}</div>
                      </div>
                      <div className="shrink-0 font-body text-[10px] text-white/30">{timeAgo(sub.created_at)}</div>
                    </button>
                  ))}
                  {newSubmissions.length > 5 ? (
                    <button onClick={() => { setPage('inbox'); setOpen(false) }} className="w-full px-3 py-2 text-center font-body text-xs font-bold text-cyan hover:underline">
                      View all {newSubmissions.length} submissions →
                    </button>
                  ) : null}
                </div>
              ) : null}

              {/* Recent Activity */}
              {recentLogs.length > 0 ? (
                <div className="px-2 py-2">
                  <div className="px-3 py-2 font-body text-[10px] font-black uppercase tracking-[0.2em] text-cyan">Activity</div>
                  {recentLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-start gap-3 rounded-xl px-3 py-2">
                      <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan/60" />
                      <div className="min-w-0 flex-1">
                        <div className="font-body text-xs text-white/70">{log.action}</div>
                        <div className="mt-0.5 truncate font-body text-[10px] text-white/30">{log.detail}</div>
                      </div>
                      <div className="shrink-0 font-body text-[10px] text-white/25">{timeAgo(log.created_at)}</div>
                    </div>
                  ))}
                </div>
              ) : null}

              {totalNew === 0 ? (
                <div className="px-5 py-10 text-center">
                  <Bell className="mx-auto h-8 w-8 text-white/15" />
                  <p className="mt-3 font-body text-sm text-white/30">You're all caught up</p>
                  <p className="mt-1 font-body text-[10px] text-white/20">No new notifications</p>
                </div>
              ) : null}
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 px-5 py-3">
              <button onClick={() => { setPage('inbox'); setOpen(false) }} className="w-full rounded-xl bg-white/5 px-4 py-2.5 text-center font-body text-xs font-bold uppercase tracking-[0.15em] text-white/50 hover:bg-white/10 hover:text-white transition">
                View All Submissions
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function QuickActionsDropdown({ setPage }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <JellyButton icon={Plus} onClick={() => setOpen(!open)}>
        Quick Action
      </JellyButton>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-full z-50 mt-3 w-56 overflow-hidden rounded-2xl border border-white/10 bg-black/90 shadow-2xl backdrop-blur-2xl"
          >
            <div className="p-2 flex flex-col gap-1">
              <button onClick={() => { setPage('videos'); setOpen(false) }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left font-body text-sm text-white/70 hover:bg-white/10 hover:text-white transition">
                <Video size={16} /> Upload Video
              </button>
              <button onClick={() => { setPage('portfolio'); setOpen(false) }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left font-body text-sm text-white/70 hover:bg-white/10 hover:text-white transition">
                <Clapperboard size={16} /> Add Portfolio Item
              </button>
              <button onClick={() => { setPage('hero'); setOpen(false) }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left font-body text-sm text-white/70 hover:bg-white/10 hover:text-white transition">
                <Edit3 size={16} /> Edit Hero Text
              </button>
              <button onClick={() => { setPage('pricing'); setOpen(false) }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left font-body text-sm text-white/70 hover:bg-white/10 hover:text-white transition">
                <CircleDollarSign size={16} /> Update Pricing
              </button>
              <button onClick={() => { setPage('images'); setOpen(false) }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left font-body text-sm text-white/70 hover:bg-white/10 hover:text-white transition">
                <ImageIcon size={16} /> Upload Image
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
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
              <NotificationBell setPage={setPage} />
              <QuickActionsDropdown setPage={setPage} />
            </div>
          </div>
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}

function Dashboard({ setPage }) {
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
                  <div className="font-body font-bold">{item.full_name || 'Anonymous'}</div>
                  <div className="font-body text-xs text-white/40">{item.grade_selected || item.content_type || 'Enquiry'} / {new Date(item.created_at).toLocaleDateString()}</div>
                </div>
                <JellyButton variant="ghost" onClick={() => setPage('inbox')}>View</JellyButton>
              </div>
            ))}
          </div>
        </GlassPanel>
        <GlassPanel>
          <SectionTitle title="Quick Actions" />
            {[
              { label: 'Upload Video', page: 'videos' },
              { label: 'Add Portfolio Item', page: 'portfolio' },
              { label: 'Edit Hero Text', page: 'hero' },
              { label: 'Update Pricing', page: 'pricing' }
            ].map(({ label, page: targetPage }) => (
              <JellyButton key={label} variant="ghost" icon={Rocket} onClick={() => setPage(targetPage)}>
                {label}
              </JellyButton>
            ))}
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

  const handleAdd = () => {
    if (type === 'videos') {
      // Videos use the simplified VideoAddModal
      setEditing('__video_add__')
      return
    }
    setEditing({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      title: '',
      category: 'Film',
      tier: 'Studio',
      thumbnail: '',
      video_url: '',
      description: '',
      tags: '',
      duration: '',
      views: '',
      is_featured: false,
      is_visible: true,
      autoplay_preview: true,
      created_at: new Date().toISOString(),
      sort_order: 99,
    })
  }

  return (
    <PageGrid>
      <GlassPanel>
        <SectionTitle
          title={title}
          action={<JellyButton icon={Plus} onClick={handleAdd}>Add {type === 'portfolio' ? 'Item' : 'Video'}</JellyButton>}
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
      {type === 'videos' ? (
        <VideoAddModal
          open={editing === '__video_add__'}
          onClose={() => setEditing(null)}
          onSave={(item) => { upsert(key, item, title); setEditing(null); toast.success('Video added') }}
        />
      ) : null}
      {type === 'videos' && editing && editing !== '__video_add__' ? (
        <VideoEditModal item={editing} onClose={() => setEditing(null)} onSave={(item) => { upsert(key, item, title); setEditing(null); toast.success('Video updated') }} />
      ) : null}
      {type !== 'videos' ? (
        <EditorModal type={type} item={editing} onClose={() => setEditing(null)} onSave={(item) => { upsert(key, item, title); setEditing(null); toast.success(`${title} saved`) }} />
      ) : null}
    </PageGrid>
  )
}

function EditorModal({ type, item, onClose, onSave }) {
  const isVideo = type === 'videos'
  const { register, handleSubmit, control, reset, setValue } = useForm()
  const thumbInputRef = useRef(null)
  const [uploadingThumb, setUploadingThumb] = useState(false)

  const handleThumbUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingThumb(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'bhakty_uploads')

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dtse6exar'}/image/upload`, {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error.message)
      setValue('thumbnail', data.secure_url, { shouldDirty: true })
      toast.success('Thumbnail uploaded!')
    } catch (err) {
      console.error(err)
      toast.error('Upload failed.')
    } finally {
      setUploadingThumb(false)
      if (thumbInputRef.current) thumbInputRef.current.value = ''
    }
  }

  useEffect(() => {
    if (item) {
      reset(item)
    }
  }, [item, reset])
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
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <Field label="Thumbnail Image URL"><input className={inputClass()} {...register('thumbnail')} /></Field>
            <div className="pt-7">
              <JellyButton type="button" icon={UploadCloud} onClick={() => thumbInputRef.current?.click()} disabled={uploadingThumb}>{uploadingThumb ? '...' : 'Upload'}</JellyButton>
              <input type="file" ref={thumbInputRef} className="hidden" onChange={handleThumbUpload} accept="image/*" />
            </div>
          </div>
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
          <div className="grid gap-3 md:grid-cols-3">
            <label className="flex items-center gap-3 rounded-2xl border border-white/10 p-4 font-body text-sm"><input type="checkbox" {...register('is_featured')} /> Featured</label>
            <label className="flex items-center gap-3 rounded-2xl border border-white/10 p-4 font-body text-sm"><input type="checkbox" {...register('is_visible')} /> Public Visible</label>
            <label className="flex items-center gap-3 rounded-2xl border border-cyan/20 bg-cyan/5 p-4 font-body text-sm text-cyan"><input type="checkbox" {...register('autoplay_preview')} /> Autoplay Video Preview</label>
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

/* ── Video URL Helpers ─────────────────────────── */
function parseVideoUrl(url) {
  if (!url) return null
  // YouTube: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/shorts/ID, youtube.com/embed/ID
  let m = url.match(/(?:youtube\.com\/(?:watch\?.*v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/)
  if (m) return { platform: 'youtube', id: m[1], thumbnail: `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg`, embedUrl: `https://www.youtube.com/embed/${m[1]}?autoplay=1&mute=1&loop=1&controls=0&playlist=${m[1]}&playsinline=1` }
  // Vimeo: vimeo.com/ID
  m = url.match(/vimeo\.com\/(\d+)/)
  if (m) return { platform: 'vimeo', id: m[1], thumbnail: null, embedUrl: `https://player.vimeo.com/video/${m[1]}?autoplay=1&muted=1&loop=1&background=1` }
  // Instagram Reel
  m = url.match(/instagram\.com\/(?:reel|p)\/([\w-]+)/)
  if (m) return { platform: 'instagram', id: m[1], thumbnail: null, embedUrl: null }
  return { platform: 'other', id: null, thumbnail: null, embedUrl: null }
}

async function fetchVimeoThumb(id) {
  try {
    const res = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${id}`)
    const data = await res.json()
    return data.thumbnail_url || null
  } catch { return null }
}

function VideoAddModal({ open, onClose, onSave }) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)

  const handleFetch = async () => {
    if (!url.trim()) { toast.error('Paste a video URL first'); return }
    setLoading(true)
    const parsed = parseVideoUrl(url.trim())
    if (!parsed) { toast.error('Could not parse that URL'); setLoading(false); return }

    let thumb = parsed.thumbnail
    let title = ''

    // For YouTube, try to get the title via noembed
    if (parsed.platform === 'youtube') {
      try {
        const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${parsed.id}`)
        const data = await res.json()
        if (data.title) title = data.title
        if (!thumb && data.thumbnail_url) thumb = data.thumbnail_url
      } catch { /* ignore */ }
    }

    // For Vimeo, fetch thumbnail and title via oembed
    if (parsed.platform === 'vimeo') {
      try {
        const res = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${parsed.id}`)
        const data = await res.json()
        thumb = data.thumbnail_url || null
        title = data.title || ''
      } catch { /* ignore */ }
    }

    setPreview({ ...parsed, thumbnail: thumb, title, originalUrl: url.trim() })
    setLoading(false)
  }

  const handleSave = () => {
    if (!preview) return
    onSave({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      title: preview.title || `${preview.platform} video`,
      category: preview.platform === 'youtube' ? 'YouTube' : preview.platform === 'vimeo' ? 'Vimeo' : 'Other',
      tier: 'Studio',
      thumbnail: preview.thumbnail || '',
      video_url: preview.originalUrl,
      embed_url: preview.embedUrl || '',
      platform: preview.platform,
      description: '',
      tags: preview.platform,
      duration: '',
      views: '',
      is_featured: false,
      is_visible: true,
      created_at: new Date().toISOString(),
      sort_order: 99,
    })
    setUrl('')
    setPreview(null)
  }

  const handleClose = () => { setUrl(''); setPreview(null); onClose() }

  return (
    <Modal title="Add Video" open={open} onClose={handleClose}>
      <div className="grid gap-5">
        <Field label="Paste Video URL (YouTube, Vimeo, Instagram)">
          <div className="flex gap-3">
            <input
              className={inputClass('flex-1')}
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleFetch())}
            />
            <JellyButton icon={Search} onClick={handleFetch} disabled={loading}>
              {loading ? 'Fetching...' : 'Fetch'}
            </JellyButton>
          </div>
        </Field>

        {preview && (
          <div className="glass overflow-hidden rounded-2xl">
            {preview.thumbnail ? (
              <img src={preview.thumbnail} alt="" className="aspect-video w-full object-cover" />
            ) : (
              <div className="grid aspect-video place-items-center bg-white/5 text-white/30 font-body text-sm">
                No thumbnail available — it will still work on the site
              </div>
            )}
            <div className="p-5">
              <div className="flex items-center gap-3">
                <span className="rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1 font-body text-[10px] font-bold uppercase tracking-[0.18em] text-cyan">{preview.platform}</span>
                <h3 className="font-heading text-lg font-bold">{preview.title || 'Untitled'}</h3>
              </div>
              <p className="mt-2 font-body text-xs text-white/40 break-all">{preview.originalUrl}</p>
              <JellyButton icon={Plus} className="mt-4 w-full" onClick={handleSave}>Add to Gallery</JellyButton>
            </div>
          </div>
        )}

        {!preview && !loading && (
          <div className="glass rounded-2xl p-8 text-center">
            <Film className="mx-auto h-12 w-12 text-white/20" />
            <p className="mt-4 font-body text-sm text-white/40">Paste a YouTube, Vimeo, or Instagram URL and click Fetch</p>
            <p className="mt-2 font-body text-xs text-white/25">We'll automatically grab the thumbnail and title for you</p>
          </div>
        )}
      </div>
    </Modal>
  )
}

function VideoEditModal({ item, onClose, onSave }) {
  const { register, handleSubmit, reset } = useForm()

  useEffect(() => {
    if (item && typeof item === 'object') reset(item)
  }, [item, reset])

  return (
    <Modal title={`Edit: ${item?.title || 'Video'}`} open={!!item && typeof item === 'object'} onClose={onClose}>
      <form onSubmit={handleSubmit(onSave)} className="grid gap-4">
        <Field label="Title"><input className={inputClass()} {...register('title')} /></Field>
        <Field label="Video URL"><input className={inputClass()} {...register('video_url')} /></Field>
        <Field label="Thumbnail URL"><input className={inputClass()} {...register('thumbnail')} /></Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Category">
            <select className={inputClass()} {...register('category')}>
              {['YouTube', 'Vimeo', 'Instagram', 'Brand', 'Other'].map((v) => <option key={v}>{v}</option>)}
            </select>
          </Field>
          <Field label="Grade Tier">
            <select className={inputClass()} {...register('tier')}>
              {['Content', 'Studio', 'Cinema'].map((v) => <option key={v}>{v}</option>)}
            </select>
          </Field>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 p-4 font-body text-sm"><input type="checkbox" {...register('is_featured')} /> Featured</label>
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 p-4 font-body text-sm"><input type="checkbox" {...register('is_visible')} /> Visible</label>
        </div>
        <JellyButton type="submit" icon={Save}>Save Changes</JellyButton>
      </form>
    </Modal>
  )
}

function CloudinaryUploader({ label, value, onChange, accept = 'image/*' }) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'bhakty_uploads')

    try {
      // Cloudinary handles both image and video via auto or specific resource_type.
      // We will use 'auto' to handle both.
      const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dtse6exar'}/auto/upload`, {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error.message)
      onChange(data.secure_url)
      toast.success('Upload successful!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to upload file.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="font-body text-xs font-bold uppercase tracking-[0.14em] text-white/50">{label}</label>}
      <div className="flex items-center gap-3">
        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept={accept} />
        <JellyButton variant="ghost" icon={UploadCloud} onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload File'}
        </JellyButton>
        {value && <div className="truncate text-xs text-white/50 max-w-[200px]">{value}</div>}
        {value && (
          <button type="button" onClick={() => onChange('')} className="text-danger hover:text-white">
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  )
}

function ImageManager() {
  const media = useCmsStore((s) => s.media)
  const upsert = useCmsStore((s) => s.upsertItem)
  const remove = useCmsStore((s) => s.removeItem)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const filtered = media.filter((item) => `${item.filename} ${item.tags} ${item.used_in}`.toLowerCase().includes(query.toLowerCase()))
  const fileInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'bhakty_uploads')

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dtse6exar'}/image/upload`, {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error.message)

      upsert('media', {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2),
        filename: data.original_filename + '.' + data.format,
        url: data.secure_url,
        dimensions: `${data.width} x ${data.height}`,
        size: (data.bytes / 1024).toFixed(1) + ' KB',
        used_in: 'Unassigned',
        tags: 'uploaded, cloudinary',
        uploaded_at: new Date().toISOString(),
      }, 'Media')
      toast.success('Image uploaded successfully!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to upload image.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }
  return (
    <PageGrid>
      <GlassPanel>
        <SectionTitle title="Image Manager" action={
          <>
            <JellyButton icon={UploadCloud} onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload Image'}
            </JellyButton>
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
          </>
        } />
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
    ['about_heading', 'About Heading'],
    ['about_body', 'About Body'],
    ['portfolio_heading', 'Portfolio Heading'],
    ['portfolio_subheading', 'Portfolio Subheading'],
    ['pricing_heading', 'Pricing Heading'],
    ['pricing_subheading', 'Pricing Subheading'],
    ['contact_heading', 'Contact Heading'],
    ['contact_subheading', 'Contact Subheading'],
    ['footer_tagline', 'Footer Tagline'],
    ['instagram_handle', 'Instagram Handle (for Footer)'],
    ['marquee_text', 'Marquee Text (for Footer)'],
  ]
  return (
    <PageGrid>
      <form onSubmit={handleSubmit((data) => { updateHero(data); toast.success('Hero and taglines saved') })} className="grid gap-5">
        <GlassPanel>
          <SectionTitle title="Hero Visuals" />
          <div className="grid gap-6 md:grid-cols-2">
            <div className="col-span-2 md:col-span-1 border border-white/10 p-4 rounded-xl">
              <h3 className="mb-4 font-heading text-lg font-bold text-white">Background Video</h3>
              <CloudinaryUploader 
                label="Hero Background Video Upload" 
                accept="video/*" 
                value={values.hero_bg_video_upload} 
                onChange={(url) => register('hero_bg_video_upload').onChange({ target: { name: 'hero_bg_video_upload', value: url } })} 
              />
              <Field label={`Overlay Opacity: ${values.hero_bg_video_opacity || 20}%`}>
                <input type="range" min="0" max="100" className="w-full accent-cyan" {...register('hero_bg_video_opacity')} />
              </Field>
            </div>
            <div className="col-span-2 md:col-span-1 border border-white/10 p-4 rounded-xl">
              <h3 className="mb-4 font-heading text-lg font-bold text-white">Floating Hero Image</h3>
              <CloudinaryUploader 
                label="Hero PNG Image Upload" 
                accept="image/png, image/jpeg, image/webp" 
                value={values.hero_image_url} 
                onChange={(url) => register('hero_image_url').onChange({ target: { name: 'hero_image_url', value: url } })} 
              />
              <div className="grid gap-4 mt-4 grid-cols-2">
                <Field label="Padding (px)"><input type="number" className={inputClass()} {...register('hero_image_padding')} /></Field>
                <Field label="Border Radius (px)"><input type="number" className={inputClass()} {...register('hero_image_radius')} /></Field>
              </div>
              <div className="flex gap-4 mt-4">
                <label className="flex items-center gap-2 text-sm text-white/70">
                  <input type="checkbox" {...register('hero_image_glow')} /> Enable Glow
                </label>
                <label className="flex items-center gap-2 text-sm text-white/70">
                  <input type="checkbox" {...register('hero_image_animate')} /> Enable Floating Animation
                </label>
              </div>
            </div>
          </div>
        </GlassPanel>
        <GlassPanel className="grid gap-4">
          <SectionTitle title="Hero Copy" />
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
          <SectionTitle title="Site Logo" />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="col-span-2">
              <CloudinaryUploader 
                label="Main Website Logo" 
                accept="image/*" 
                value={values.site_logo} 
                onChange={(url) => register('site_logo').onChange({ target: { name: 'site_logo', value: url } })} 
              />
            </div>
            <Field label="Logo Padding (px)"><input type="number" className={inputClass()} {...register('logo_padding')} /></Field>
            <Field label="Logo Margin (px)"><input type="number" className={inputClass()} {...register('logo_margin')} /></Field>
          </div>
        </GlassPanel>
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
      if (session?.user) {
        setUser(session.user)
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
      } else if (!session) {
        setUser(null)
      }
    })
    return () => subscription?.unsubscribe()
  }, [isAdminRoute])

  // Load CMS data from Supabase for all visitors
  useEffect(() => {
    if (!loaded) {
      loadFromSupabase()
    }
  }, [loaded, loadFromSupabase])

  // Supabase Realtime: listen for new form submissions (admin only)
  useEffect(() => {
    if (!isAdminRoute || !isSupabaseConfigured || !user) return
    const channel = supabase
      .channel('form_submissions_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'form_submissions' }, (payload) => {
        const newSub = payload.new
        useCmsStore.setState((state) => ({
          submissions: [newSub, ...state.submissions],
        }))
        toast.info(`New enquiry from ${newSub.full_name || 'Anonymous'}`, {
          description: newSub.grade_selected || newSub.content_type || 'New form submission',
          duration: 8000,
        })
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [isAdminRoute, user])

  const pageMap = {
    dashboard: <Dashboard setPage={setPage} />,
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
