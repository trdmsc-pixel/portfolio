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

import { useCmsStore, logo } from './lib/store'

function scrollToId(id) {
  document.querySelector(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
  const hero = useCmsStore((s) => s.hero)
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
      <nav className="fixed left-0 right-0 top-0 z-50 px-4 py-4" style={{ opacity: hero.header_opacity !== undefined ? hero.header_opacity / 100 : 1 }}>
        <div className="glass mx-auto flex max-w-7xl items-center justify-between rounded-3xl px-4 py-3">
          <button onClick={() => scrollToId('#home')} className="flex items-center">
            <img 
              src={settings.site_logo || logo} 
              alt={settings.site_title} 
              className={`h-12 w-auto object-contain ${!settings.site_logo ? 'logo-glow rounded-2xl' : ''}`} 
              style={{
                padding: `${settings.logo_padding || 0}px`,
                margin: `${settings.logo_margin || 0}px`,
              }}
            />
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
  const hero = useCmsStore((s) => s.hero)
  const words = (hero.primary || "WE DON'T JUST CREATE CONTENT.").split(' ')
  const textAlign = hero.hero_text_align || 'center'
  return (
    <section id="home" className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-5 pt-28 text-center">
      {hero.hero_bg_video_upload ? (
        <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline>
          <source src={hero.hero_bg_video_upload} />
        </video>
      ) : (
        <video className="absolute inset-0 h-full w-full object-cover opacity-35" autoPlay muted loop playsInline poster="https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1800&q=80">
          {hero.background_video_url && <source src={hero.background_video_url} type="video/mp4" />}
        </video>
      )}
      <div 
        className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0),rgba(0,0,0,1))]" 
        style={{ opacity: hero.hero_bg_video_upload ? (hero.hero_bg_video_opacity / 100) : 0.8 }} 
      />
      <div className="pointer-events-none absolute inset-0 public-stars" />
      <motion.div className={`relative z-10 max-w-6xl w-full flex flex-col ${textAlign === 'left' ? 'items-start text-left' : textAlign === 'right' ? 'items-end text-right' : 'items-center text-center'}`} initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.025 } } }}>
        {hero.hero_image_url && (
          <motion.img 
            src={hero.hero_image_url} 
            alt="Hero Visual" 
            className={`max-w-full ${hero.hero_image_glow ? 'drop-shadow-[0_0_40px_rgba(0,245,255,0.6)]' : ''}`}
            style={{ 
              padding: `${hero.hero_image_padding || 0}px`,
              borderRadius: `${hero.hero_image_radius || 0}px`,
              maxHeight: '40vh',
              objectFit: 'contain'
            }}
            variants={{ hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1 } }}
            animate={hero.hero_image_animate ? { y: [0, -15, 0] } : {}}
            transition={hero.hero_image_animate ? { duration: 4, repeat: Infinity, ease: 'easeInOut' } : {}}
          />
        )}
        <div className="mb-6 font-body text-xs font-black uppercase tracking-[0.5em] text-cyan mt-4">Premium AI filmmaking studio</div>
        <h1 className={`font-heading text-[clamp(3rem,8vw,8.6rem)] font-black leading-[0.9] tracking-normal text-white text-${textAlign}`}>
          {words.map((word, wIndex) => (
            <span key={wIndex} className="inline-block whitespace-nowrap">
              {word.split('').map((letter, index) => (
                <motion.span key={`${letter}-${index}`} className="inline-block" variants={{ hidden: { opacity: 0, y: 45, filter: 'blur(10px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)' } }}>
                  {letter}
                </motion.span>
              ))}
              {wIndex < words.length - 1 && <span className="inline-block">&nbsp;</span>}
            </span>
          ))}
        </h1>
        <motion.h2 className={`mt-3 font-heading text-[clamp(2.6rem,7vw,7.4rem)] font-black leading-[0.92] text-gradient-rainbow text-${textAlign}`} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
          {hero.secondary || 'WE BUILD CINEMATIC WORLDS.'}
        </motion.h2>
        <motion.p className={`mt-7 max-w-3xl font-body text-base leading-relaxed text-white/62 md:text-xl text-${textAlign} ${textAlign === 'center' ? 'mx-auto' : textAlign === 'right' ? 'ml-auto' : 'mr-auto'}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.15 }}>
          {hero.subtext || 'AI Films · Advertisements · Short Films · Social Media · Cinema — crafted at bhakti.studio'}
        </motion.p>
        <motion.div className={`mt-10 flex flex-col gap-4 sm:flex-row ${textAlign === 'center' ? 'justify-center' : textAlign === 'right' ? 'justify-end' : 'justify-start'}`} initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.28 }}>
          <LiquidButton onClick={() => scrollToId(hero.cta2_target || '#work')}><Play size={17} /> {hero.cta2_label || 'View Work'}</LiquidButton>
          <LiquidButton onClick={() => scrollToId(hero.cta1_target || '#contact')} className="!bg-black/30"><Sparkles size={17} /> {hero.cta1_label || 'Start a Project'}</LiquidButton>
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
  const hero = useCmsStore((s) => s.hero)
  return (
    <section id="about" className="public-section px-5 py-24 md:py-36">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
        <div className="glass neon-frame relative overflow-hidden rounded-[2rem] p-3">
          <img src="https://images.unsplash.com/photo-1535223289827-42f1e9919769?auto=format&fit=crop&w=1100&q=80" alt="Creator abstract portrait" className="aspect-[4/5] w-full rounded-[1.5rem] object-cover saturate-150" />
        </div>
        <div>
          <SectionKicker>Who We Are</SectionKicker>
          <h2 className="section-heading">{hero.about_heading || 'NEXT-GEN CREATIVE POWERHOUSE.'}</h2>
          <p className="mt-6 font-body text-lg leading-8 text-white/60">
            {hero.about_body || 'bhakti.studio is a next-generation creative powerhouse at the intersection of artificial intelligence and cinematic storytelling. We fuse AI technology with human artistic vision to produce content that does not just get watched — it gets felt.'}
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
  const Icon = tier.id === 'content' ? Zap : tier.id === 'studio' ? Clapperboard : Crown

  if (!tier.is_visible) return null

  return (
    <div ref={tiltRef} onMouseMove={move} onMouseLeave={leave} className="tier-card glass rounded-[2rem] p-6 transition duration-300" style={{ '--tier-color': tier.accent_color }}>
      <div className="mb-6 flex items-center justify-between">
        <div className="grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/5" style={{ color: tier.accent_color }}>
          <Icon />
        </div>
        {tier.badge ? <div className="rounded-full border border-white/10 px-3 py-1 font-body text-[10px] font-black uppercase tracking-[0.18em] text-ember"><Star size={12} className="mr-1 inline" />{tier.badge}</div> : null}
      </div>
      <h3 className="font-heading text-4xl font-black uppercase" style={{ color: tier.accent_color }}>{tier.name}</h3>
      <p className="mt-3 font-body text-sm font-bold text-white">{tier.tagline}</p>
      <p className="mt-4 min-h-28 font-body text-sm leading-6 text-white/52">{tier.description}</p>
      <ul className="mt-6 space-y-3">
        {(tier.features || []).filter(f => f.enabled).map((feature) => (
          <li key={feature.id} className="flex gap-3 font-body text-sm text-white/68">
            <Check size={16} style={{ color: tier.accent_color }} className="mt-0.5 shrink-0" />
            {feature.text}
          </li>
        ))}
      </ul>
      <div className="mt-8 border-t border-white/10 pt-6">
        <div className="font-heading text-2xl font-black text-white">{tier.starting_price}</div>
        <LiquidButton onClick={() => scrollToId('#contact')} className="mt-5 w-full" >{tier.cta_label || 'Book'} →</LiquidButton>
      </div>
    </div>
  )
}

function Services() {
  const tiers = useCmsStore((s) => s.tiers)
  const hero = useCmsStore((s) => s.hero)
  
  if (!tiers || tiers.length === 0) return null

  return (
    <section id="services" className="public-section px-5 py-24 md:py-36">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <SectionKicker>{hero.pricing_heading || 'Choose Your Grade'}</SectionKicker>
          <h2 className="section-heading">EVERY TIER IS A UNIVERSE.</h2>
          <p className="mt-4 font-body text-white/52">{hero.pricing_subheading || 'Find yours.'}</p>
        </div>
        <div className="grid gap-5 xl:grid-cols-3">
          {tiers.map((tier) => <TierCard key={tier.id} tier={tier} />)}
        </div>
      </div>
    </section>
  )
}

function getEmbedUrl(videoUrl) {
  if (!videoUrl) return null
  // YouTube
  const ytMatch = videoUrl.match(/(?:youtube\.com\/(?:watch\?.*v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/)
  if (ytMatch) return { type: 'youtube', url: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1&loop=1&controls=0&playlist=${ytMatch[1]}&playsinline=1&showinfo=0&modestbranding=1&rel=0` }
  // Vimeo
  const vmMatch = videoUrl.match(/vimeo\.com\/(\d+)/)
  if (vmMatch) return { type: 'vimeo', url: `https://player.vimeo.com/video/${vmMatch[1]}?autoplay=1&muted=1&loop=1&background=1` }
  
  // Direct Video
  if (videoUrl.match(/\.(mp4|webm|mov)$/i) || videoUrl.includes('res.cloudinary.com')) {
    return { type: 'native', url: videoUrl }
  }
  
  return null
}

function getLightboxUrl(videoUrl) {
  if (!videoUrl) return null
  const ytMatch = videoUrl.match(/(?:youtube\.com\/(?:watch\?.*v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/)
  if (ytMatch) return { type: 'youtube', url: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&controls=1&rel=0` }
  
  const vmMatch = videoUrl.match(/vimeo\.com\/(\d+)/)
  if (vmMatch) return { type: 'vimeo', url: `https://player.vimeo.com/video/${vmMatch[1]}?autoplay=1` }
  
  if (videoUrl.match(/\.(mp4|webm|mov)$/i) || videoUrl.includes('res.cloudinary.com')) {
    return { type: 'native', url: videoUrl }
  }
  return null
}

function PortfolioCard({ item, index, onClick }) {
  const hasVideo = item.video_url && item.autoplay_preview !== false
  const embed = hasVideo ? getEmbedUrl(item.video_url) : null

  return (
    <button
      key={item.id}
      onClick={onClick}
      className="work-card glass group relative mb-5 block w-full overflow-hidden rounded-[2rem] text-left break-inside-avoid"
      style={{ aspectRatio: item.aspect_ratio || '16/9' }}
    >
      {embed ? (
        embed.type === 'native' ? (
          <video
            src={embed.url}
            className="pointer-events-none absolute inset-0 h-full w-full border-0 object-cover"
            autoPlay
            loop
            muted
            playsInline
          />
        ) : (
          <iframe
            src={embed.url}
            className="pointer-events-none absolute inset-0 h-full w-full scale-[1.3] border-0 object-cover"
            allow="autoplay; encrypted-media"
            loading="lazy"
            title={item.title}
          />
        )
      ) : (
        <img src={item.thumbnail} alt={item.title} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 translate-y-6 p-5 opacity-85 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
        <div className="font-body text-[10px] font-black uppercase tracking-[0.25em] text-cyan">{item.category}</div>
        <h3 className="mt-2 font-heading text-2xl font-black text-white">{item.title}</h3>
        <p className="mt-2 font-body text-sm text-white/55">{item.description}</p>
        <span className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/15 px-3 py-2 font-body text-xs font-bold uppercase tracking-[0.16em] text-white">
          Watch <ExternalLink size={14} />
        </span>
      </div>
    </button>
  )
}

function Work() {
  const portfolio = useCmsStore((s) => s.portfolio)
  const hero = useCmsStore((s) => s.hero)
  const settings = useCmsStore((s) => s.settings)
  const [activeItem, setActiveItem] = useState(null)
  
  if (!portfolio || portfolio.length === 0) return null

  return (
    <>
      <section id="work" className="public-section px-5 py-24 md:py-36">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <SectionKicker>Our Work Speaks</SectionKicker>
              <h2 className="section-heading">{hero.portfolio_heading || 'EVERY FRAME, A WORLD.'}</h2>
            </div>
            <a href={`https://www.instagram.com/${settings.instagram_handle?.replace('@', '') || 'notshaam'}`} target="_blank" rel="noreferrer" className="glass flex w-fit items-center gap-3 rounded-2xl px-4 py-3 font-body text-xs font-black uppercase tracking-[0.18em] text-magenta">
              <Camera size={18} /> {settings.instagram_handle || '@notshaam'} — Follow Us <ExternalLink size={14} />
            </a>
          </div>
          <div className="columns-1 gap-5 sm:columns-2 md:columns-3">
            {portfolio.filter(p => p.is_visible).map((item, index) => (
              <PortfolioCard 
                key={item.id} 
                item={item} 
                index={index} 
                onClick={() => {
                  if (item.video_url) {
                    setActiveItem(item)
                  } else if (item.thumbnail) {
                    // Fallback to opening thumbnail if there's no video but user clicks
                    window.open(item.thumbnail, '_blank', 'noopener,noreferrer')
                  }
                }} 
              />
            ))}
          </div>
          <div className="marquee glass mt-10 overflow-hidden rounded-2xl py-4">
            <div>{hero.marquee_text || 'AI FILMS · ADVERTISEMENTS · SHORT FILMS · REELS · BRAND VIDEOS · CINEMATIC CONTENT · SOCIAL MEDIA ADS · UGC · STORYTELLING ·'}&nbsp;</div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {activeItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl md:p-10" 
            onClick={() => setActiveItem(null)}
          >
            <button onClick={() => setActiveItem(null)} className="absolute right-6 top-6 text-white/50 hover:text-white transition-colors z-10">
              <X size={32} />
            </button>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative aspect-video w-full max-w-6xl overflow-hidden rounded-3xl bg-black shadow-2xl" 
              onClick={e => e.stopPropagation()}
            >
              {(() => {
                const lb = getLightboxUrl(activeItem.video_url)
                if (!lb) return null
                if (lb.type === 'native') {
                  return <video src={lb.url} controls controlsList="nodownload" onContextMenu={(e) => e.preventDefault()} autoPlay className="h-full w-full object-contain" />
                }
                return <iframe src={lb.url} className="h-full w-full border-0" allow="autoplay; fullscreen; encrypted-media" allowFullScreen title={activeItem.title} />
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}


function Pricing() {
  const tiers = useCmsStore((s) => s.tiers)
  const pricing = useCmsStore((s) => s.pricing)
  
  if (!tiers || tiers.length === 0 || !pricing) return null

  return (
    <section id="pricing" className="public-section px-5 py-24 md:py-36">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <SectionKicker>Transparent Pricing</SectionKicker>
          <h2 className="section-heading">NO HIDDEN COSTS.</h2>
          <p className="mt-4 font-body text-white/52">Just pure creative value.</p>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {tiers.filter(t => t.is_visible).map((tier) => (
            <div key={tier.id} className="glass rounded-[2rem] p-6" style={{ boxShadow: `0 0 42px ${tier.accent_color}18` }}>
              <h3 className="font-heading text-3xl font-black" style={{ color: tier.accent_color }}>{tier.name}</h3>
              {pricing[tier.id]?.note && <p className="mt-2 font-body text-sm text-white/55">{pricing[tier.id].note}</p>}
              <div className="mt-6 space-y-4">
                {(pricing[tier.id]?.rows || []).filter(r => r.is_visible).map((row) => (
                  <div key={row.id} className="border-b border-white/10 pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-body text-sm font-bold text-white">{row.service}</div>
                        <div className="mt-1 font-body text-xs text-white/38">{row.description}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-heading text-lg font-black text-white">
                           {typeof row.price === 'number' ? `₹${row.price.toLocaleString()}` : row.price}
                        </div>
                        {row.suffix && <div className="font-body text-[10px] uppercase text-white/40">{row.suffix}</div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="glass mt-8 rounded-2xl p-5 text-center font-body text-sm text-white/52">
          {pricing.global_note || 'All prices are exclusive of GST. Final pricing depends on complexity, duration, and production requirements.'}
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

        // Send email notification (fire-and-forget, don't block the UI)
        try {
          await supabase.functions.invoke('notify-submission', {
            body: {
              name: values.full_name,
              email: values.email,
              phone: values.phone || 'N/A',
              company: values.company || 'N/A',
              grade: values.grade_selected,
              content_type: values.content_type,
              budget: values.budget,
              brief: values.project_brief,
            },
          })
        } catch (emailErr) {
          console.warn('Email notification skipped:', emailErr.message)
        }
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
  const hero = useCmsStore((s) => s.hero)
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
  const hero = useCmsStore((s) => s.hero)
  const links = ['Home', 'Work', 'Services', 'Pricing', 'About', 'Contact']
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-black px-5 py-12">
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan to-transparent" />
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-3">
        <div>
          <img src={logo} alt="" className="h-16 w-16 rounded-2xl object-cover logo-glow" />
          <p className="mt-4 font-body text-sm text-white/52">{hero.footer_tagline || 'Crafting cinematic worlds, one frame at a time.'}</p>
        </div>
        <div className="flex flex-wrap gap-4 md:justify-center">
          {links.map((link) => <button key={link} onClick={() => scrollToId(`#${link.toLowerCase() === 'home' ? 'home' : link.toLowerCase()}`)} className="font-body text-xs font-bold uppercase tracking-[0.18em] text-white/45 hover:text-cyan">{link}</button>)}
        </div>
        <div className="md:text-right">
          <a href={`https://www.instagram.com/${settings.instagram_handle?.replace('@', '') || 'notshaam'}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-body text-sm font-bold text-magenta"><Camera size={18} /> {settings.instagram_handle || '@notshaam'}</a>
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
  const settings = useCmsStore((s) => s.settings)
  const loadedStore = useCmsStore((s) => s._loaded)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    document.title = settings.site_title || 'bhakti.studio'
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', settings.meta_description || 'Premium AI filmmaking and content creation studio.')
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
