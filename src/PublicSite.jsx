import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
  ArrowDown,
  Check,
  Clapperboard,
  Crown,
  ExternalLink,
  Film,
  Camera,
  Menu,
  Play,
  Sparkles,
  Star,
  X,
  Zap,
} from 'lucide-react'
import { isSupabaseConfigured, supabase } from './lib/supabase'

gsap.registerPlugin(ScrollTrigger)

const logo = '/brand/bhakty-studio-logo.png'

const colors = {
  cyan: '#00F5FF',
  violet: '#9B59FF',
  magenta: '#FF2D9B',
  gold: '#FFB800',
  green: '#00FF88',
}

const defaultSettings = {
  site_title: 'bhakti.studio',
  meta_description: 'Premium AI filmmaking and content creation studio.',
  agency_email: 'hello@bhakty.studio',
  phone: '+91 99581 94155',
  instagram_handle: '@notshaam',
  whatsapp_number: '+91 99581 94155',
  maintenance_mode: false,
}

const tiers = [
  {
    id: 'content',
    icon: Zap,
    name: 'Content Grade',
    badge: '',
    color: colors.cyan,
    tagline: 'Scroll-stopping content, AI-powered.',
    description:
      'Built for brands and creators who need high-quality digital content fast. Content Grade delivers polished, AI-generated social media videos, UGC-style ads, reels, and short-form content that converts.',
    features: [
      'AI-generated social media videos',
      'UGC-style & influencer-format videos',
      'Instagram Reels & YouTube Shorts',
      'Product teaser ads',
      'AI voiceover & music sync',
      'Up to 2-minute video duration',
      '2-3 revision rounds',
      'Fast turnaround',
    ],
    price: 'From ₹10,000 / video',
    note: 'Bulk discount: 20%+ off on 10+ videos',
    cta: 'Book Content Grade',
  },
  {
    id: 'studio',
    icon: Clapperboard,
    name: 'Studio Grade',
    badge: 'MOST POPULAR',
    color: colors.violet,
    tagline: 'Stories that earn their screen time.',
    description:
      'For creators and brands ready to go beyond the scroll. Studio Grade delivers short films, YouTube narratives, high-production ads, and storytelling content with professional-grade cinematics.',
    features: [
      'Short films and narrative content',
      'YouTube explainer & storytelling videos',
      'Studio-grade brand advertisements',
      'YouTube series & episodic content',
      'AI + live-action hybrid production',
      'Professional color grading & sound design',
      '5-20 minute content range',
      'Character development & script support',
      '4-5 revision rounds',
      'Dedicated creative producer assigned',
    ],
    price: 'From ₹35,000 / project',
    note: 'Custom quotes available for series and campaigns',
    cta: 'Book Studio Grade',
  },
  {
    id: 'cinema',
    icon: Crown,
    name: 'Cinema Grade',
    badge: 'PREMIUM',
    color: colors.gold,
    tagline: 'Pure cinema. No compromises.',
    description:
      "The pinnacle of bhakti.studio's craft. Cinema Grade is for those who demand the extraordinary: AI films, generated actors, immersive worlds, and commercial productions that blur imagination and reality.",
    features: [
      'Full-length AI feature films',
      'AI-generated actors, characters & worlds',
      'Cinematic brand campaigns & premium ads',
      'Immersive storytelling & world-building',
      'Advanced AI visual effects & compositing',
      'Professional-grade social media production',
      'Unlimited duration - shorts to features',
      'Custom AI model training for characters',
      'Unlimited revisions',
      'White-glove production management',
      'Premiere-ready deliverables',
    ],
    price: 'From ₹1,00,000 / project',
    note: 'Bespoke pricing for feature-length productions',
    cta: 'Book Cinema Grade',
  },
]

const pricing = {
  content: [
    ['Social Media Reel / Short Ad', 'up to 60 sec', '₹10,000'],
    ['Extended Social Video', '1-2 min', '₹15,000'],
    ['UGC-style Series', '3 videos', '₹25,000'],
    ['AI Product Teaser Pack', '5 videos', '₹40,000'],
    ['Monthly Social Media Package', '8 videos/month', '₹65,000'],
  ],
  studio: [
    ['YouTube Explainer Video', '5-10 min', '₹35,000'],
    ['Brand Advertisement', '60-90 sec', '₹45,000'],
    ['Short Film / YouTube Story', 'up to 15 min', '₹60,000'],
    ['Episodic YouTube Series', 'per episode', '₹50,000'],
    ['Full Brand Campaign', '3 videos + strategy', '₹1,20,000'],
  ],
  cinema: [
    ['Premium Brand Film', '2-5 min cinematic', '₹1,00,000'],
    ['AI Short Film with Custom Characters', 'up to 30 min', '₹2,50,000'],
    ['Full-Length AI Feature Film', '60-120 min', 'Custom Quote'],
    ['Cinematic Ad Campaign', 'multi-platform', '₹1,50,000+'],
    ['Annual Cinema Retainer', 'unlimited content', 'Custom Quote'],
  ],
}

const workItems = [
  {
    title: 'AI Mythic Film',
    caption: 'A devotional cinematic universe designed frame by frame.',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1100&q=80',
    type: 'Cinema',
  },
  {
    title: 'Neon Brand Ad',
    caption: 'High-voltage product film for a social-first launch.',
    image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1100&q=80',
    type: 'Ad',
  },
  {
    title: 'Character World',
    caption: 'AI characters, story arcs, and visual continuity.',
    image: 'https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?auto=format&fit=crop&w=1100&q=80',
    type: 'AI Film',
  },
  {
    title: 'Music Visualizer',
    caption: 'Sound-reactive visuals for an artist campaign.',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1100&q=80',
    type: 'Reel',
  },
  {
    title: 'Studio Story',
    caption: 'A short film language built for YouTube retention.',
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1100&q=80',
    type: 'Short Film',
  },
  {
    title: 'Social Heat Pack',
    caption: 'Batched UGC-style content with cinematic finishing.',
    image: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1100&q=80',
    type: 'UGC',
  },
]

function scrollToId(id) {
  document.querySelector(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function useSiteSettings() {
  const [settings, setSettings] = useState(defaultSettings)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!isSupabaseConfigured) return
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .maybeSingle()
      if (!cancelled && !error && data) {
        setSettings({ ...defaultSettings, ...data })
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  return settings
}

function LiquidButton({ children, onClick, href, className = '', type = 'button' }) {
  const ref = useRef(null)
  const press = () => {
    if (!ref.current) return
    gsap.fromTo(ref.current, { scaleX: 0.96, scaleY: 0.9 }, { scaleX: 1, scaleY: 1, duration: 0.7, ease: 'elastic.out(1, .32)' })
  }
  const content = (
    <span
      ref={ref}
      onMouseDown={press}
      className={`liquid-button inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 font-body text-xs font-black uppercase tracking-[0.2em] text-white ${className}`}
    >
      {children}
    </span>
  )
  if (href) {
    return <a href={href}>{content}</a>
  }
  return (
    <button type={type} onClick={onClick} className="contents">
      {content}
    </button>
  )
}

function Loader({ done }) {
  return (
    <AnimatePresence>
      {!done ? (
        <motion.div className="fixed inset-0 z-[100] grid place-items-center bg-black" exit={{ opacity: 0 }} transition={{ duration: 0.7 }}>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <motion.img
              src={logo}
              alt="bhakti.studio"
              className="mx-auto h-32 w-auto object-contain drop-shadow-[0_0_40px_rgba(0,245,255,.45)]"
              animate={{ filter: ['hue-rotate(0deg)', 'hue-rotate(80deg)', 'hue-rotate(0deg)'] }}
              transition={{ duration: 2.4, repeat: Infinity }}
            />
            <div className="mt-5 h-1 w-72 overflow-hidden rounded-full bg-white/10">
              <motion.div className="h-full bg-gradient-to-r from-cyan via-magenta to-ember" initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }} />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

function CursorGlow() {
  const dot = useRef(null)
  const trail = useRef(null)
  useEffect(() => {
    const move = (e) => {
      gsap.to(dot.current, { x: e.clientX, y: e.clientY, duration: 0.08 })
      gsap.to(trail.current, { x: e.clientX, y: e.clientY, duration: 0.42, ease: 'power3.out' })
    }
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [])
  return (
    <>
      <div ref={trail} className="pointer-events-none fixed left-0 top-0 z-[90] hidden h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan/20 blur-xl md:block" />
      <div ref={dot} className="pointer-events-none fixed left-0 top-0 z-[91] hidden h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_20px_#00F5FF] md:block" />
    </>
  )
}

function Nav({ settings }) {
  const [open, setOpen] = useState(false)
  const links = [
    ['Home', '#home'],
    ['Work', '#work'],
    ['Services', '#services'],
    ['Pricing', '#pricing'],
    ['About', '#about'],
    ['Contact', '#contact'],
  ]
  return (
    <>
      <nav className="fixed left-0 right-0 top-0 z-50 px-4 py-4">
        <div className="glass mx-auto flex max-w-7xl items-center justify-between rounded-3xl px-4 py-3">
          <button onClick={() => scrollToId('#home')} className="flex items-center gap-3">
            <img src={logo} alt={settings.site_title} className="h-12 w-12 rounded-2xl object-cover logo-glow" />
            <span className="font-heading text-lg font-black uppercase tracking-[0.22em] text-white">bhakti.studio</span>
          </button>
          <div className="hidden items-center gap-8 lg:flex">
            {links.map(([label, href]) => (
              <button key={label} onClick={() => scrollToId(href)} className="font-body text-xs font-bold uppercase tracking-[0.22em] text-white/55 transition hover:text-cyan">
                {label}
              </button>
            ))}
          </div>
          <div className="hidden lg:block">
            <LiquidButton onClick={() => scrollToId('#contact')}>Book a Project</LiquidButton>
          </div>
          <button className="rounded-2xl border border-white/10 p-3 text-white lg:hidden" onClick={() => setOpen(true)}>
            <Menu />
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {open ? (
          <motion.div className="fixed inset-0 z-[80] bg-black/80 p-5 backdrop-blur-2xl lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="glass flex h-full flex-col rounded-3xl p-6" initial={{ scale: 0.9, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 20 }}>
              <button className="ml-auto rounded-2xl border border-white/10 p-3 text-white" onClick={() => setOpen(false)}><X /></button>
              <div className="mt-12 grid gap-5">
                {links.map(([label, href]) => (
                  <button key={label} onClick={() => { setOpen(false); setTimeout(() => scrollToId(href), 100) }} className="font-heading text-4xl font-black uppercase text-left text-white">
                    {label}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}

function Hero() {
  const letters = "WE DON'T JUST CREATE CONTENT.".split('')
  return (
    <section id="home" className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-5 pt-28 text-center">
      <video className="absolute inset-0 h-full w-full object-cover opacity-35" autoPlay muted loop playsInline poster="https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1800&q=80">
      </video>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,245,255,.16),transparent_32%),linear-gradient(rgba(0,0,0,.72),rgba(0,0,0,.92))]" />
      <div className="pointer-events-none absolute inset-0 public-stars" />
      <motion.div className="relative z-10 max-w-6xl" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.025 } } }}>
        <div className="mb-6 font-body text-xs font-black uppercase tracking-[0.5em] text-cyan">Premium AI filmmaking studio</div>
        <h1 className="font-heading text-[clamp(3rem,8vw,8.6rem)] font-black leading-[0.9] tracking-normal text-white">
          {letters.map((letter, index) => (
            <motion.span key={`${letter}-${index}`} className="inline-block" variants={{ hidden: { opacity: 0, y: 45, filter: 'blur(10px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)' } }}>
              {letter === ' ' ? '\u00A0' : letter}
            </motion.span>
          ))}
        </h1>
        <motion.h2 className="mt-3 font-heading text-[clamp(2.6rem,7vw,7.4rem)] font-black leading-[0.92] text-gradient-rainbow" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
          WE BUILD CINEMATIC WORLDS.
        </motion.h2>
        <motion.p className="mx-auto mt-7 max-w-3xl font-body text-base leading-relaxed text-white/62 md:text-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.15 }}>
          AI Films · Advertisements · Short Films · Social Media · Cinema — crafted at bhakti.studio
        </motion.p>
        <motion.div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row" initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.28 }}>
          <LiquidButton onClick={() => scrollToId('#work')}><Play size={17} /> Explore Our Work</LiquidButton>
          <LiquidButton onClick={() => scrollToId('#contact')} className="!bg-black/30"><Sparkles size={17} /> Book Your Package</LiquidButton>
        </motion.div>
      </motion.div>
      <button onClick={() => scrollToId('#about')} className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-white/45">
        <ArrowDown className="mx-auto animate-bounce" />
        <span className="mt-2 block font-body text-[10px] font-bold uppercase tracking-[0.35em]">Scroll to Explore</span>
      </button>
    </section>
  )
}

function AboutIntro() {
  return (
    <section id="about" className="public-section px-5 py-24 md:py-36">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
        <div className="glass neon-frame relative overflow-hidden rounded-[2rem] p-3">
          <img src="https://images.unsplash.com/photo-1535223289827-42f1e9919769?auto=format&fit=crop&w=1100&q=80" alt="Creator abstract portrait" className="aspect-[4/5] w-full rounded-[1.5rem] object-cover saturate-150" />
        </div>
        <div>
          <SectionKicker>Who We Are</SectionKicker>
          <h2 className="section-heading">NEXT-GEN CREATIVE POWERHOUSE.</h2>
          <p className="mt-6 font-body text-lg leading-8 text-white/60">
            bhakti.studio is a next-generation creative powerhouse at the intersection of artificial intelligence and cinematic storytelling. We fuse AI technology with human artistic vision to produce content that does not just get watched — it gets felt. From 30-second social media reels to full-length cinematic features, every frame we craft is intentional, immersive, and unforgettable.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ['50+', 'Projects Delivered'],
              ['3', 'Grade Tiers'],
              ['∞', 'Creative Vision'],
            ].map(([value, label]) => (
              <div key={label} className="glass rounded-3xl p-5">
                <div className="font-heading text-4xl font-black text-cyan">{value}</div>
                <div className="mt-2 font-body text-xs font-bold uppercase tracking-[0.18em] text-white/45">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function SectionKicker({ children }) {
  return <div className="font-body text-xs font-black uppercase tracking-[0.35em] text-cyan">{children}</div>
}

function TierCard({ tier }) {
  const Icon = tier.icon
  const tiltRef = useRef(null)
  const move = (event) => {
    const el = tiltRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 10
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * -10
    el.style.transform = `perspective(900px) rotateX(${y}deg) rotateY(${x}deg) translateY(-8px) scale(1.02)`
  }
  const leave = () => {
    if (tiltRef.current) tiltRef.current.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)'
  }
  return (
    <div ref={tiltRef} onMouseMove={move} onMouseLeave={leave} className="tier-card glass rounded-[2rem] p-6 transition duration-300" style={{ '--tier-color': tier.color }}>
      <div className="mb-6 flex items-center justify-between">
        <div className="grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/5" style={{ color: tier.color }}>
          <Icon />
        </div>
        {tier.badge ? <div className="rounded-full border border-white/10 px-3 py-1 font-body text-[10px] font-black uppercase tracking-[0.18em] text-ember"><Star size={12} className="mr-1 inline" />{tier.badge}</div> : null}
      </div>
      <h3 className="font-heading text-4xl font-black uppercase" style={{ color: tier.color }}>{tier.name}</h3>
      <p className="mt-3 font-body text-sm font-bold text-white">{tier.tagline}</p>
      <p className="mt-4 min-h-28 font-body text-sm leading-6 text-white/52">{tier.description}</p>
      <ul className="mt-6 space-y-3">
        {tier.features.map((feature) => (
          <li key={feature} className="flex gap-3 font-body text-sm text-white/68">
            <Check size={16} style={{ color: tier.color }} className="mt-0.5 shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
      <div className="mt-8 border-t border-white/10 pt-6">
        <div className="font-heading text-2xl font-black text-white">{tier.price}</div>
        <p className="mt-2 min-h-10 font-body text-xs text-white/38">{tier.note}</p>
        <LiquidButton onClick={() => scrollToId('#contact')} className="mt-5 w-full" >{tier.cta} →</LiquidButton>
      </div>
    </div>
  )
}

function Services() {
  return (
    <section id="services" className="public-section px-5 py-24 md:py-36">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <SectionKicker>Choose Your Grade</SectionKicker>
          <h2 className="section-heading">EVERY TIER IS A UNIVERSE.</h2>
          <p className="mt-4 font-body text-white/52">Find yours.</p>
        </div>
        <div className="grid gap-5 xl:grid-cols-3">
          {tiers.map((tier) => <TierCard key={tier.id} tier={tier} />)}
        </div>
      </div>
    </section>
  )
}

function Work() {
  const [active, setActive] = useState(null)
  return (
    <section id="work" className="public-section px-5 py-24 md:py-36">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <SectionKicker>Our Work Speaks</SectionKicker>
            <h2 className="section-heading">EVERY FRAME, A WORLD.</h2>
          </div>
          <a href="https://www.instagram.com/notshaam" target="_blank" rel="noreferrer" className="glass flex w-fit items-center gap-3 rounded-2xl px-4 py-3 font-body text-xs font-black uppercase tracking-[0.18em] text-magenta">
            <Camera size={18} /> @notshaam — Follow Us <ExternalLink size={14} />
          </a>
        </div>
        <div className="grid auto-rows-[260px] gap-5 md:grid-cols-3">
          {workItems.map((item, index) => (
            <button key={item.title} onClick={() => setActive(item)} className={`work-card glass group relative overflow-hidden rounded-[2rem] text-left ${index === 0 || index === 4 ? 'md:row-span-2' : ''}`}>
              <img src={item.image} alt={item.title} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 translate-y-6 p-5 opacity-85 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                <div className="font-body text-[10px] font-black uppercase tracking-[0.25em] text-cyan">{item.type}</div>
                <h3 className="mt-2 font-heading text-2xl font-black text-white">{item.title}</h3>
                <p className="mt-2 font-body text-sm text-white/55">{item.caption}</p>
                <span className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/15 px-3 py-2 font-body text-xs font-bold uppercase tracking-[0.16em] text-white">Watch <Play size={14} /></span>
              </div>
            </button>
          ))}
        </div>
        <div className="marquee glass mt-10 overflow-hidden rounded-2xl py-4">
          <div>AI FILMS · ADVERTISEMENTS · SHORT FILMS · REELS · BRAND VIDEOS · CINEMATIC CONTENT · SOCIAL MEDIA ADS · UGC · STORYTELLING ·&nbsp;</div>
        </div>
      </div>
      <ModalWork item={active} onClose={() => setActive(null)} />
    </section>
  )
}

function ModalWork({ item, onClose }) {
  return (
    <AnimatePresence>
      {item ? (
        <motion.div className="fixed inset-0 z-[70] grid place-items-center bg-black/75 p-5 backdrop-blur-2xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="glass max-w-5xl overflow-hidden rounded-[2rem]" initial={{ scale: 0.92, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 20 }}>
            <button onClick={onClose} className="absolute right-6 top-6 z-10 rounded-full bg-black/60 p-3 text-white"><X /></button>
            <img src={item.image} alt="" className="max-h-[70vh] w-full object-cover" />
            <div className="p-6">
              <h3 className="font-heading text-3xl font-black">{item.title}</h3>
              <p className="mt-2 font-body text-white/55">{item.caption}</p>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

function Pricing() {
  return (
    <section id="pricing" className="public-section px-5 py-24 md:py-36">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <SectionKicker>Transparent Pricing</SectionKicker>
          <h2 className="section-heading">NO HIDDEN COSTS.</h2>
          <p className="mt-4 font-body text-white/52">Just pure creative value.</p>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div key={tier.id} className="glass rounded-[2rem] p-6" style={{ boxShadow: `0 0 42px ${tier.color}18` }}>
              <h3 className="font-heading text-3xl font-black" style={{ color: tier.color }}>{tier.name}</h3>
              <div className="mt-6 space-y-4">
                {pricing[tier.id].map(([name, desc, price]) => (
                  <div key={name} className="border-b border-white/10 pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-body text-sm font-bold text-white">{name}</div>
                        <div className="mt-1 font-body text-xs text-white/38">{desc}</div>
                      </div>
                      <div className="font-heading text-lg font-black text-white">{price}</div>
                    </div>
                  </div>
                ))}
              </div>
              {tier.id === 'content' ? <div className="mt-6 rounded-2xl border border-ember/30 bg-ember/10 p-4 font-body text-sm text-ember">Order 10+ videos and save 20% or more. Recurring clients get priority production slots.</div> : null}
            </div>
          ))}
        </div>
        <p className="glass mt-8 rounded-2xl p-5 text-center font-body text-sm text-white/52">
          All prices are exclusive of GST. Final pricing depends on complexity, duration, and production requirements. Contact us for a custom quote.
        </p>
      </div>
    </section>
  )
}

function Contact({ settings }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()
  const [sent, setSent] = useState(false)
  const submit = async (values) => {
    const payload = {
      full_name: values.full_name,
      email: values.email,
      phone: values.phone,
      company: values.company,
      grade_selected: values.grade_selected,
      content_type: values.content_type,
      duration: values.duration,
      budget: values.budget,
      project_brief: values.project_brief,
      source: values.source,
      status: 'new',
    }
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('form_submissions').insert(payload)
        if (error) throw error
      }
      setSent(true)
      reset()
      toast.success("Your vision has been received. We'll be in touch within 24 hours.")
    } catch (error) {
      toast.error(error.message || 'Could not send your submission. Please try again.')
    }
  }
  return (
    <section id="contact" className="public-section px-5 py-24 md:py-36">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <SectionKicker>Book Your Package</SectionKicker>
          <h2 className="section-heading">LET'S BUILD SOMETHING LEGENDARY.</h2>
          <p className="mt-4 font-body text-white/52">Fill in your vision. We'll make it real.</p>
        </div>
        <form onSubmit={handleSubmit(submit)} className="glass pulse-border rounded-[2rem] p-5 md:p-8">
          {sent ? (
            <motion.div className="py-16 text-center" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}>
              <Check className="mx-auto h-16 w-16 rounded-full border border-green/40 p-3 text-green shadow-[0_0_40px_rgba(0,255,136,.35)]" />
              <h3 className="mt-6 font-heading text-3xl font-black">YOUR VISION HAS BEEN RECEIVED.</h3>
              <p className="mt-3 font-body text-white/52">We'll be in touch within 24 hours.</p>
              <LiquidButton onClick={() => setSent(false)} className="mt-8">Send Another Brief</LiquidButton>
            </motion.div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <SiteField label="Full Name"><input required {...register('full_name')} className="site-input" /></SiteField>
              <SiteField label="Email Address"><input required type="email" {...register('email')} className="site-input" /></SiteField>
              <SiteField label="Phone Number"><input type="tel" {...register('phone')} className="site-input" /></SiteField>
              <SiteField label="Company / Brand Name"><input {...register('company')} className="site-input" /></SiteField>
              <SiteField label="Select Grade"><select {...register('grade_selected')} className="site-input">{['Content Grade', 'Studio Grade', 'Cinema Grade', 'Not Sure - Advise Me'].map(v => <option key={v}>{v}</option>)}</select></SiteField>
              <SiteField label="Content Type"><select {...register('content_type')} className="site-input">{['Social Media Video / Reel', 'Brand Advertisement', 'Short Film', 'YouTube Video / Series', 'AI Feature Film', 'UGC Content', 'Other'].map(v => <option key={v}>{v}</option>)}</select></SiteField>
              <SiteField label="Estimated Duration"><select {...register('duration')} className="site-input">{['Under 60 seconds', '1-2 minutes', '3-10 minutes', '10-30 minutes', '30+ minutes / Feature Film'].map(v => <option key={v}>{v}</option>)}</select></SiteField>
              <SiteField label="Budget Range"><select {...register('budget')} className="site-input">{['₹10,000 - ₹30,000', '₹30,000 - ₹1,00,000', '₹1,00,000 - ₹5,00,000', '₹5,00,000+', 'Open to Discussion'].map(v => <option key={v}>{v}</option>)}</select></SiteField>
              <SiteField label="Project Brief / Message" className="md:col-span-2"><textarea required rows={6} {...register('project_brief')} className="site-input resize-none" placeholder="Tell us about your project, your vision, your references - the more detail, the better we can serve you." /></SiteField>
              <SiteField label="How did you hear about us?" className="md:col-span-2"><select {...register('source')} className="site-input">{['Instagram', 'Word of Mouth', 'Google Search', 'Other'].map(v => <option key={v}>{v}</option>)}</select></SiteField>
              <div className="md:col-span-2">
                <LiquidButton type="submit" className="w-full" >{isSubmitting ? 'Sending...' : <><Film size={18} /> Book Your Package</>}</LiquidButton>
              </div>
            </div>
          )}
        </form>
        <p className="mt-5 text-center font-body text-sm text-white/35">Business email: {settings.agency_email}</p>
      </div>
    </section>
  )
}

function SiteField({ label, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block font-body text-[11px] font-black uppercase tracking-[0.2em] text-white/42">{label}</span>
      {children}
    </label>
  )
}

function FounderStory() {
  const tags = ['AI Filmmaking', 'Video Editing', 'Motion Design', 'Brand Storytelling', 'Cinematography', 'AI Animation', 'Sound Design', 'Social Media Strategy', 'Character Creation', 'World-Building']
  return (
    <section className="public-section px-5 py-24 md:py-36">
      <div className="glass mx-auto max-w-6xl rounded-[2rem] p-6 md:p-10">
        <SectionKicker>The Mind Behind Bhakti.Studio</SectionKicker>
        <h2 className="section-heading mt-3">STORYTELLING, MADE LIMITLESS.</h2>
        <div className="mt-6 space-y-5 font-body text-lg leading-8 text-white/60">
          <p>bhakti.studio was born from a singular obsession — to make storytelling limitless. Founded by a multidisciplinary creator who shoots, edits, directs, and engineers AI-powered visuals, bhakti.studio operates at the bleeding edge of what content can be.</p>
          <p>We do not choose between technology and artistry. We use both — aggressively, deliberately, and beautifully.</p>
          <p>Our work spans social media campaigns for emerging brands, short films for independent storytellers, and cinematic universes for those who refuse to be average. Every frame we create carries one intent: to make the viewer feel something they cannot explain.</p>
          <p className="font-heading text-2xl font-black text-white">We are not a production house. We are a creative civilization.</p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          {tags.map((tag) => <span key={tag} className="rounded-full border border-cyan/25 bg-cyan/10 px-4 py-2 font-body text-xs font-bold uppercase tracking-[0.14em] text-cyan">{tag}</span>)}
        </div>
      </div>
    </section>
  )
}

function Footer({ settings }) {
  const links = ['Home', 'Work', 'Services', 'Pricing', 'About', 'Contact']
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-black px-5 py-12">
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan to-transparent" />
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-3">
        <div>
          <img src={logo} alt="" className="h-16 w-16 rounded-2xl object-cover logo-glow" />
          <p className="mt-4 font-body text-sm text-white/52">Crafting cinematic worlds, one frame at a time.</p>
        </div>
        <div className="flex flex-wrap gap-4 md:justify-center">
          {links.map((link) => <button key={link} onClick={() => scrollToId(`#${link.toLowerCase() === 'home' ? 'home' : link.toLowerCase()}`)} className="font-body text-xs font-bold uppercase tracking-[0.18em] text-white/45 hover:text-cyan">{link}</button>)}
        </div>
        <div className="md:text-right">
          <a href="https://www.instagram.com/notshaam" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-body text-sm font-bold text-magenta"><Camera size={18} /> {settings.instagram_handle || '@notshaam'}</a>
          <p className="mt-3 font-body text-sm text-white/42">{settings.agency_email}</p>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-center font-body text-xs text-white/32">
        © 2026 bhakti.studio. All rights reserved. Crafted with AI & Imagination.
      </div>
    </footer>
  )
}

export default function PublicSite() {
  const settings = useSiteSettings()
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    document.title = settings.site_title || 'bhakti.studio'
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', settings.meta_description || defaultSettings.meta_description)
  }, [settings])

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 1200)
    gsap.utils.toArray('.public-section').forEach((section) => {
      gsap.fromTo(section, { y: 90, opacity: 0 }, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 82%' },
      })
    })
    return () => {
      clearTimeout(t)
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  if (settings.maintenance_mode) {
    return (
      <main className="noise grid min-h-screen place-items-center bg-black p-5 text-center text-white">
        <div className="glass max-w-xl rounded-[2rem] p-8">
          <img src={logo} alt="" className="mx-auto h-24 w-auto object-contain logo-glow" />
          <h1 className="mt-6 font-heading text-4xl font-black">COMING SOON</h1>
          <p className="mt-3 font-body text-white/52">bhakti.studio is under maintenance while we refine the next cinematic layer.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="public-site noise min-h-screen bg-black text-white">
      <Loader done={loaded} />
      <CursorGlow />
      <Nav settings={settings} />
      <Hero />
      <AboutIntro />
      <Services />
      <Work />
      <Pricing />
      <Contact settings={settings} />
      <FounderStory />
      <Footer settings={settings} />
    </main>
  )
}
