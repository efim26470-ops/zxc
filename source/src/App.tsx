import {
  ArrowLeft,
  AudioLines,
  BookOpen,
  Check,
  Copy,
  CreditCard,
  Download,
  Disc3,
  ExternalLink,
  Heart,
  Menu,
  Minus,
  Music2,
  Pause,
  Play,
  Plus,
  QrCode,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  SkipBack,
  SkipForward,
  Sparkles,
  Trash2,
  UserRound,
  Volume2,
  Waves,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import QRCode from 'qrcode'

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260611_183632_c311af08-e4b7-458f-81e7-79847a49b3d3.mp4'

const ARCHIVE_SOURCE = 'https://archive.org/details/New_Midnight_Cassette_System'
const TRACK_SOURCE_BASE = 'https://archive.org/download/New_Midnight_Cassette_System'

const SBP_RECIPIENT = {
  bank: 'Т-Банк',
  phone: '+79529262155',
  phoneDisplay: '+7 952 926-21-55',
  recipientHint: 'Имя получателя покажет банк перед подтверждением',
} as const

const TBANK_TRANSFER_URL = 'https://www.tbank.ru/payments/transfers/'
// Paste an official personal/merchant payment link issued by the bank here for one-tap payment.
const SBP_OFFICIAL_PAYMENT_URL = ''
const PAYMENT_TARGET_URL = SBP_OFFICIAL_PAYMENT_URL.trim() || TBANK_TRANSFER_URL

type View = 'home' | 'anthology' | 'talents' | 'sound-diary' | 'playback-salon' | 'cart'
type CatalogMode = 'all' | 'latest'

type Track = {
  id: string
  title: string
  artist: string
  genre: string
  note: string
  url: string
  sourceTitle: string
  startAt: number
  endAt: number
}

type Pressing = {
  id: string
  title: string
  artist: string
  edition: string
  year: number
  price: number
  latest: boolean
  gradient: string
}

type DiaryEntry = {
  id: string
  text: string
  mood: string
  createdAt: string
}

type PaymentReceipt = {
  id: string
  amount: number
  createdAt: string
  bank: string
  phone: string
  recipient: string
}

const TRACK_LIBRARY = [
  ['neo-hip-hop-01', 'Neo Hip-Hop Tape No. 01', 'Hip-hop', 'Airy beats and algorithmic sample cuts', '01_NeoHipHop'],
  ['neo-rap-02', 'Neo Rap Tape No. 02', 'Rap', 'Forward electronic rap patterns', '02_NeoRap'],
  ['neo-hard-rap-03', 'Neo Hard Rap Tape No. 03', 'Hard rap', 'Heavier drums and angular low-end', '03_NeoHardRap'],
  ['neo-rnb-04', 'Neo R&B Tape No. 04', 'R&B', 'Smooth synthetic soul sketches', '04_NeoRnB'],
  ['old-hip-hop-05', 'Old Hip-Hop Tape No. 05', 'Old-school hip-hop', 'Dusty boom-bap inspired loops', '05_OldHipHop'],
  ['old-rap-06', 'Old Rap Tape No. 06', 'Old-school rap', 'Classic drum-machine cadence', '06_OldRap'],
  ['old-hard-rap-07', 'Old Hard Rap Tape No. 07', 'Hardcore rap', 'Raw, forceful rhythm studies', '07_OldHardRap'],
  ['old-rnb-08', 'Old R&B Tape No. 08', 'Classic R&B', 'Warm chords and relaxed grooves', '08_OldRnB'],
  ['downbeat-09', 'Downbeat Tape No. 09', 'Downbeat', 'Slow pulse and muted electronics', '09_Downbeat'],
  ['drum-bass-10', 'Drum & Bass Tape No. 10', 'Drum & bass', 'Fast breaks with rolling sub-bass', '10_DnBass'],
  ['electro-dnb-11', 'Electro D&B Tape No. 11', 'Electro D&B', 'Bright circuitry and rapid breaks', '11_ElectroDnB'],
  ['dirty-dnb-12', 'Dirty D&B Tape No. 12', 'Dirty D&B', 'Distorted bass pressure and hard breaks', '12_DirtyDnB'],
  ['jungle-13', 'Jungle Tape No. 13', 'Jungle', 'Chopped breaks and restless momentum', '13_Jungle'],
  ['house-14', 'House Tape No. 14', 'House', 'Four-on-the-floor generative club motion', '14_House'],
  ['easy-house-15', 'Easy House Tape No. 15', 'Easy house', 'Soft house grooves for daylight listening', '15_EzHouse'],
  ['hard-house-16', 'Hard House Tape No. 16', 'Hard house', 'Sharper kicks and energetic synth stabs', '16_HardHouse'],
  ['garage-17', 'Garage Tape No. 17', 'Garage', 'Loose swing and compact bass figures', '17_Garage'],
  ['uk-garage-18', 'UK Garage Tape No. 18', 'UK garage', 'Skippy percussion and elastic rhythm', '18_UKGarage'],
  ['trance-19', 'Trance Tape No. 19', 'Trance', 'Wide pads and continuous propulsion', '19_Trance'],
  ['manga-20', 'Manga Tape No. 20', 'Manga pop', 'Bright melodic electronic vignettes', '20_Manga'],
  ['ragga-21', 'Ragga Tape No. 21', 'Ragga', 'Digital dancehall-inspired motion', '21_Ragga'],
  ['classic-rock-22', 'Classic Rock Tape No. 22', 'Classic rock', 'Generative riffs and steady live-band energy', '22_ClassicRock'],
  ['pop-rock-23', 'Pop Rock Tape No. 23', 'Pop rock', 'Accessible hooks and bright guitar shapes', '23_PopRock'],
  ['ballad-24', 'Ballad Tape No. 24', 'Ballad', 'Slow melodic arrangements and open space', '24_Ballad'],
  ['bossa-25', 'Bossa Tape No. 25', 'Bossa nova', 'Warm, unhurried rhythm', '25_Bossa'],
  ['new-age-26', 'New Age Tape No. 26', 'New age', 'Soft synthesizer drift', '26_NewAge'],
  ['ambient-27', 'Ambient Tape No. 27', 'Ambient', 'Long-form generative ambience', '27_Ambient'],
  ['trip-hop-28', 'Trip-Hop Tape No. 28', 'Trip-hop', 'Dusty nocturnal beat study', '28_TripHop'],
  ['mad-metal-29', 'Mad Metal Tape No. 29', 'Metal', 'Aggressive algorithmic guitar textures', '29_MadMetal'],
  ['mad-30', 'Mad Tape No. 30', 'Experimental', 'Unpredictable genre-crossing structures', '30_Mad'],
  ['urban-mix-31', 'Urban Mix Tape No. 31', 'Urban mix', 'Hybrid beats moving across city styles', '31_UrbanMix'],
  ['dub-mix-32', 'Dub Mix Tape No. 32', 'Dub', 'Echo-heavy low-end and spacious rhythm', '32_DubMix'],
  ['techno-mix-33', 'Techno Mix Tape No. 33', 'Techno', 'Mechanical pulse and dark repetition', '33_TechnoMix'],
  ['cool-mix-34', 'Cool Mix Tape No. 34', 'Electronic mix', 'A loose late-night sequence', '34_CoolMix'],
] as const

const CUT_NAMES = [
  'First light',
  'Low tide',
  'Pine signal',
  'Blue hour',
  'Soft circuit',
  'Rain index',
  'Quiet engine',
  'Glass field',
  'Night garden',
  'Open window',
  'Distant rooms',
  'Slow current',
  'Moss radio',
  'Silver path',
  'Afterimage',
  'Warm static',
  'Cloud archive',
  'Last lantern',
  'Coastal wire',
  'Stone memory',
  'Hidden station',
  'Lunar shelf',
  'Green corridor',
  'Paper horizon',
  'Faint orbit',
  'Winter signal',
  'Blackwater bloom',
  'Echo chamber',
  'Final clearing',
  'Dawn return',
] as const

const CUTS_PER_TAPE = CUT_NAMES.length
const CUT_LENGTH_SECONDS = 3 * 60

const TRACKS: Track[] = TRACK_LIBRARY.flatMap(([id, sourceTitle, genre, note, file]) => {
  const tapeName = sourceTitle.replace(/\s+Tape No\.\s+\d+$/i, '')
  const url = `${TRACK_SOURCE_BASE}/New_Midnight_Cassette_${file}.mp3`

  return CUT_NAMES.map((cutName, cutIndex) => ({
    id: `${id}-cut-${String(cutIndex + 1).padStart(2, '0')}`,
    title: `${tapeName} · ${cutName}`,
    artist: 'Frank Edward Nora',
    genre,
    note: `${note} · cut ${cutIndex + 1}/${CUTS_PER_TAPE}`,
    url,
    sourceTitle,
    startAt: cutIndex * CUT_LENGTH_SECONDS,
    endAt: (cutIndex + 1) * CUT_LENGTH_SECONDS,
  }))
})

const PRESSINGS: Pressing[] = [
  {
    id: 'vernal-woods',
    title: 'Vernal woods',
    artist: 'Helia Marsh',
    edition: 'Press 04 · 120 copies',
    year: 2026,
    price: 10,
    latest: true,
    gradient: 'radial-gradient(circle at 28% 20%, #d9f99d 0, #4d7c0f 34%, #071a13 78%)',
  },
  {
    id: 'still-water',
    title: 'Still water index',
    artist: 'North Window',
    edition: 'Press 03 · 180 copies',
    year: 2026,
    price: 35,
    latest: true,
    gradient: 'radial-gradient(circle at 72% 22%, #bae6fd 0, #1d4ed8 35%, #07152d 78%)',
  },
  {
    id: 'lichen-letters',
    title: 'Lichen letters',
    artist: 'Mara Low',
    edition: 'Press 02 · 150 copies',
    year: 2025,
    price: 70,
    latest: false,
    gradient: 'radial-gradient(circle at 26% 28%, #fef3c7 0, #a16207 38%, #201407 82%)',
  },
  {
    id: 'night-orchard',
    title: 'Night orchard',
    artist: 'Ivo Vale',
    edition: 'Press 01 · 90 copies',
    year: 2025,
    price: 100,
    latest: false,
    gradient: 'radial-gradient(circle at 66% 22%, #ddd6fe 0, #6d28d9 38%, #16072d 80%)',
  },
]

const ARTISTS = [
  {
    name: 'Helia Marsh',
    role: 'Field recordings · drone',
    bio: 'Moss-level recordings, low strings and patient tape loops gathered along the Baltic coast.',
    trackIndex: 26 * CUTS_PER_TAPE,
    monogram: 'HM',
  },
  {
    name: 'North Window',
    role: 'Ambient electronics',
    bio: 'Slow voltage studies shaped around weather reports, room tone and small analogue systems.',
    trackIndex: 25 * CUTS_PER_TAPE,
    monogram: 'NW',
  },
  {
    name: 'Mara Low',
    role: 'Acoustic minimalism',
    bio: 'Sparse guitar figures and close-mic textures that leave silence in the foreground.',
    trackIndex: 24 * CUTS_PER_TAPE,
    monogram: 'ML',
  },
  {
    name: 'Ivo Vale',
    role: 'Nocturnal rhythm',
    bio: 'Dusty percussion, dub-space and low-lit melodic fragments for late playback sessions.',
    trackIndex: 27 * CUTS_PER_TAPE,
    monogram: 'IV',
  },
]

const NAV_ITEMS: Array<{ label: string; view: Exclude<View, 'home' | 'cart'> }> = [
  { label: 'Anthology', view: 'anthology' },
  { label: 'Talents', view: 'talents' },
  { label: 'Sound diary', view: 'sound-diary' },
  { label: 'Playback salon', view: 'playback-salon' },
]

const VIEW_HASH: Record<View, string> = {
  home: '',
  anthology: 'anthology',
  talents: 'talents',
  'sound-diary': 'sound-diary',
  'playback-salon': 'playback-salon',
  cart: 'cart',
}

const HASH_VIEW: Record<string, View> = {
  anthology: 'anthology',
  talents: 'talents',
  'sound-diary': 'sound-diary',
  'playback-salon': 'playback-salon',
  cart: 'cart',
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeStorage<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // The site remains usable when storage is unavailable.
  }
}

function formatRubles(value: number) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value)
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  textarea.remove()
}

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return '--:--'
  const hours = Math.floor(value / 3600)
  const minutes = Math.floor((value % 3600) / 60)
  const seconds = Math.floor(value % 60)
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    : `${minutes}:${String(seconds).padStart(2, '0')}`
}

type VideoFrameApi = {
  requestVideoFrameCallback?: (
    callback: (now: DOMHighResTimeStamp, metadata: VideoFrameCallbackMetadata) => void,
  ) => number
  cancelVideoFrameCallback?: (handle: number) => void
}

function BoomerangVideoBg() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const outputCanvasRef = useRef<HTMLCanvasElement>(null)
  const framesRef = useRef<HTMLCanvasElement[]>([])
  const captureRequestRef = useRef<number | null>(null)
  const loopRequestRef = useRef<number | null>(null)
  const fallbackLastTimeRef = useRef(-1)
  const captureDisabledRef = useRef(false)
  const [isBoomerang, setIsBoomerang] = useState(false)
  const [videoUnavailable, setVideoUnavailable] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    const outputCanvas = outputCanvasRef.current
    if (!video || !outputCanvas) return

    const videoFrameApi = video as HTMLVideoElement & VideoFrameApi
    const supportsVideoFrameCallback =
      typeof videoFrameApi.requestVideoFrameCallback === 'function'

    let disposed = false
    let captureStarted = false
    let outputWidth = 0
    let outputHeight = 0

    const configureDimensions = () => {
      if (!video.videoWidth || !video.videoHeight) return false

      const scale = Math.min(1, 960 / video.videoWidth)
      outputWidth = Math.max(1, Math.round(video.videoWidth * scale))
      outputHeight = Math.max(1, Math.round(video.videoHeight * scale))
      outputCanvas.width = outputWidth
      outputCanvas.height = outputHeight
      return true
    }

    const captureFrame = () => {
      if (
        disposed ||
        captureDisabledRef.current ||
        video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
        !outputWidth ||
        !outputHeight
      ) {
        return
      }

      const frame = document.createElement('canvas')
      frame.width = outputWidth
      frame.height = outputHeight
      const context = frame.getContext('2d', { alpha: false })
      if (!context) return

      try {
        context.drawImage(video, 0, 0, outputWidth, outputHeight)
        framesRef.current.push(frame)
      } catch {
        captureDisabledRef.current = true
        framesRef.current.length = 0
      }
    }

    const scheduleVideoFrameCapture = () => {
      if (disposed || captureDisabledRef.current || video.ended || video.paused) return

      if (supportsVideoFrameCallback) {
        captureRequestRef.current = videoFrameApi.requestVideoFrameCallback!(() => {
          captureFrame()
          scheduleVideoFrameCapture()
        })
        return
      }

      const captureWithAnimationFrame = () => {
        if (disposed || captureDisabledRef.current || video.ended || video.paused) return
        if (video.currentTime !== fallbackLastTimeRef.current) {
          fallbackLastTimeRef.current = video.currentTime
          captureFrame()
        }
        captureRequestRef.current = requestAnimationFrame(captureWithAnimationFrame)
      }

      captureRequestRef.current = requestAnimationFrame(captureWithAnimationFrame)
    }

    const startCapture = () => {
      if (captureStarted || disposed) return
      if (!configureDimensions()) return
      captureStarted = true
      captureFrame()
      scheduleVideoFrameCapture()
    }

    const startBoomerang = () => {
      if (disposed || captureDisabledRef.current || framesRef.current.length === 0) {
        video.loop = true
        void video.play().catch(() => setVideoUnavailable(true))
        return
      }

      setIsBoomerang(true)
      const context = outputCanvas.getContext('2d', { alpha: false })
      if (!context) return

      let frameIndex = 0
      let direction = 1
      let previousTimestamp = 0
      const frameDuration = 1000 / 30

      const drawLoop = (timestamp: number) => {
        if (disposed) return

        if (timestamp - previousTimestamp >= frameDuration) {
          const frames = framesRef.current
          const frame = frames[frameIndex]
          if (frame) context.drawImage(frame, 0, 0, outputWidth, outputHeight)

          if (frames.length > 1) {
            frameIndex += direction
            if (frameIndex >= frames.length - 1) {
              frameIndex = frames.length - 1
              direction = -1
            } else if (frameIndex <= 0) {
              frameIndex = 0
              direction = 1
            }
          }

          previousTimestamp = timestamp - ((timestamp - previousTimestamp) % frameDuration)
        }

        loopRequestRef.current = requestAnimationFrame(drawLoop)
      }

      loopRequestRef.current = requestAnimationFrame(drawLoop)
    }

    const handleLoadedMetadata = () => configureDimensions()
    const handlePlaying = () => startCapture()
    const handleEnded = () => {
      if (supportsVideoFrameCallback && captureRequestRef.current !== null) {
        videoFrameApi.cancelVideoFrameCallback?.(captureRequestRef.current)
      } else if (captureRequestRef.current !== null) {
        cancelAnimationFrame(captureRequestRef.current)
      }
      captureRequestRef.current = null
      startBoomerang()
    }
    const handleError = () => setVideoUnavailable(true)

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('playing', handlePlaying)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('error', handleError)

    void video.play().catch(() => undefined)

    return () => {
      disposed = true
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('playing', handlePlaying)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('error', handleError)

      if (captureRequestRef.current !== null) {
        if (supportsVideoFrameCallback) {
          videoFrameApi.cancelVideoFrameCallback?.(captureRequestRef.current)
        } else {
          cancelAnimationFrame(captureRequestRef.current)
        }
      }

      if (loopRequestRef.current !== null) cancelAnimationFrame(loopRequestRef.current)
      framesRef.current.length = 0
    }
  }, [])

  return (
    <div className="absolute inset-0 z-0 scale-[1.08] origin-center overflow-hidden bg-slate-950">
      {!videoUnavailable && (
        <video
          ref={videoRef}
          className={`h-full w-full object-cover ${isBoomerang ? 'hidden' : 'block'}`}
          src={VIDEO_URL}
          autoPlay
          muted
          playsInline
          crossOrigin="anonymous"
          preload="auto"
          aria-hidden="true"
        />
      )}
      <canvas
        ref={outputCanvasRef}
        className={`h-full w-full object-cover ${isBoomerang ? 'block' : 'hidden'}`}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-black/[0.15]" aria-hidden="true" />
    </div>
  )
}

function BrandMark() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 256 256"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fill="white"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M 256 256 L 128 256 C 198.692 256 256 198.692 256 128 C 256 57.308 198.692 0 128 0 C 57.308 0 0 57.308 0 128 C 0 198.692 57.308 256 128 256 L 0 256 L 0 0 L 256 0 Z M 128 104 C 141.255 104 152 114.745 152 128 C 152 141.255 141.255 152 128 152 C 114.745 152 104 141.255 104 128 C 104 114.745 114.745 104 128 104 Z"
      />
    </svg>
  )
}

type HeaderProps = {
  currentView: View
  cartCount: number
  navigate: (view: View) => void
}

function Header({ currentView, cartCount, navigate }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => setMenuOpen(false), [currentView])

  return (
    <header className="absolute inset-x-0 top-0 z-20 px-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 md:px-10">
      <div className="relative flex items-center justify-between">
        <button
          type="button"
          className="flex items-center gap-2 transition-transform duration-200 hover:scale-[1.03] active:scale-95"
          aria-label="quietpress home"
          onClick={() => navigate('home')}
        >
          <BrandMark />
          <span className="text-base tracking-tight text-white">quietpress</span>
        </button>

        <nav
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex"
          aria-label="Primary navigation"
        >
          {NAV_ITEMS.map((item) => (
            <button
              key={item.view}
              type="button"
              onClick={() => navigate(item.view)}
              className={`whitespace-nowrap text-sm transition-colors ${
                currentView === item.view ? 'text-white' : 'text-white/90 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('cart')}
            className="flex items-center gap-2 rounded-xl bg-white p-1 pr-3 text-gray-900 transition-transform duration-200 hover:scale-105 active:scale-95 sm:pr-4"
            aria-label={`Open cart, ${cartCount} items`}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-700 text-white">
              <ShoppingCart size={14} strokeWidth={2} />
            </span>
            <span className="hidden text-sm sm:inline">Cart ({cartCount})</span>
            <span className="text-sm sm:hidden">({cartCount})</span>
          </button>

          <button
            type="button"
            className="liquid-glass flex h-9 w-9 items-center justify-center rounded-xl text-white transition-transform duration-200 hover:scale-105 active:scale-95 md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="mobile-navigation"
          className="liquid-glass mt-3 rounded-2xl p-2 md:hidden"
          aria-label="Mobile navigation"
        >
          {NAV_ITEMS.map((item) => (
            <button
              key={item.view}
              type="button"
              onClick={() => navigate(item.view)}
              className="block w-full rounded-xl px-4 py-3 text-left text-sm text-white/90 transition-colors hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  )
}

type HeroContentProps = {
  openCatalog: (mode: CatalogMode) => void
}

function HeroContent({ openCatalog }: HeroContentProps) {
  return (
    <main className="relative z-10 flex h-full flex-col items-center px-4 pt-28 text-center sm:px-6 sm:pt-36 md:pt-44">
      <div
        className="liquid-glass animate-fade-up delay-1 mb-5 rounded-lg px-4 py-1.5 text-xs text-white sm:mb-6 sm:text-sm"
        style={{ background: 'rgba(255, 255, 255, 0.16)' }}
      >
        Press 04 . Vernal woods
      </div>

      <h1 className="animate-fade-up delay-2 max-w-3xl text-4xl leading-[1.1] text-white sm:text-5xl md:text-6xl lg:text-7xl">
        records cut for the
        <br />
        calm listener.
      </h1>

      <p className="animate-fade-up delay-3 mt-5 max-w-md text-sm leading-relaxed text-white/90 sm:mt-6 sm:text-base md:text-lg">
        Drone, roots, and nature-captured sound on wax LPs. Every disc cut just once, snag it or
        miss.
      </p>

      <div className="animate-fade-up delay-4 mt-8 flex w-full max-w-sm flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row">
        <button
          type="button"
          onClick={() => openCatalog('all')}
          className="rounded-xl bg-white px-7 py-2.5 text-sm text-gray-900 transition-transform duration-200 hover:scale-105 active:scale-95"
        >
          Browse the shelves
        </button>
        <button
          type="button"
          onClick={() => openCatalog('latest')}
          className="liquid-glass rounded-xl px-7 py-2.5 text-sm text-white transition-transform duration-200 hover:scale-105 active:scale-95"
        >
          Newest arrivals
        </button>
      </div>
    </main>
  )
}

type NowPlayingProps = {
  track: Track
  isPlaying: boolean
  liked: boolean
  currentTime: number
  duration: number
  loading: boolean
  togglePlayback: () => void
  previousTrack: () => void
  nextTrack: () => void
  toggleLike: () => void
  seek: (time: number) => void
  openSalon: () => void
}

function NowPlaying({
  track,
  isPlaying,
  liked,
  currentTime,
  duration,
  loading,
  togglePlayback,
  previousTrack,
  nextTrack,
  toggleLike,
  seek,
  openSalon,
}: NowPlayingProps) {
  return (
    <section
      className="animate-fade-up delay-5 absolute bottom-4 right-4 z-20 w-[min(292px,calc(100vw-2rem))] sm:bottom-6 sm:right-6 sm:w-72 md:bottom-8 md:right-10"
      aria-label="Now playing"
    >
      <div className="rounded-2xl bg-white p-2.5 pr-4 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={togglePlayback}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white transition-transform duration-200 hover:scale-105 active:scale-95"
            aria-label={isPlaying ? 'Pause track' : 'Play track'}
          >
            {loading ? <AudioLines size={20} className="animate-pulse" /> : isPlaying ? <Pause size={18} /> : <Play size={18} className="translate-x-px" />}
          </button>
          <button type="button" onClick={openSalon} className="min-w-0 flex-1 text-left">
            <p className="truncate text-sm text-gray-900">{track.title}</p>
            <p className="truncate text-[10px] text-gray-500">{track.artist}</p>
          </button>
        </div>

        <input
          type="range"
          min={0}
          max={duration || 0}
          value={Math.min(currentTime, duration || 0)}
          onChange={(event) => seek(Number(event.target.value))}
          className="player-range mt-2 w-full"
          aria-label="Track progress"
          disabled={!duration}
        />
        <div className="mt-1 flex items-center justify-between text-[10px] text-gray-500">
          <span>{formatTime(currentTime)}</span>
          <span>{duration ? `-${formatTime(Math.max(0, duration - currentTime))}` : '--:--'}</span>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={previousTrack}
          className="flex flex-1 items-center justify-center gap-1 rounded-2xl bg-white py-2 text-sm text-gray-900 shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95"
        >
          <SkipBack size={14} /> Prev
        </button>
        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-blue-700 shadow-lg transition-transform duration-200 hover:scale-110 active:scale-95"
          onClick={toggleLike}
          aria-label={liked ? 'Remove track from favorites' : 'Add track to favorites'}
          aria-pressed={liked}
        >
          <Heart size={16} className={liked ? 'fill-blue-700' : ''} />
        </button>
        <button
          type="button"
          onClick={nextTrack}
          className="flex flex-1 items-center justify-center gap-1 rounded-2xl bg-white py-2 text-sm text-gray-900 shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95"
        >
          Next <SkipForward size={14} />
        </button>
      </div>
    </section>
  )
}

type PanelShellProps = {
  eyebrow: string
  title: string
  icon: React.ReactNode
  close: () => void
  children: React.ReactNode
}

function PanelShell({ eyebrow, title, icon, close, children }: PanelShellProps) {
  return (
    <section
      className="fixed inset-0 z-30 bg-slate-950/40 p-3 pt-[max(.75rem,env(safe-area-inset-top))] backdrop-blur-md sm:p-5 md:p-8"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close()
      }}
    >
      <div className="panel-glass animate-panel-in mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-[28px] text-white shadow-2xl">
        <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-4 sm:px-6 md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white">
              {icon}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.24em] text-white/55">{eyebrow}</p>
              <h2 className="truncate text-xl tracking-tight sm:text-2xl">{title}</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-gray-900 transition-transform duration-200 hover:scale-105 active:scale-95"
            aria-label="Close panel"
          >
            <X size={18} />
          </button>
        </header>
        <div className="panel-scroll min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 md:px-8 md:py-7">
          {children}
        </div>
      </div>
    </section>
  )
}

function RecordArtwork({ pressing }: { pressing: Pressing }) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-2xl" style={{ background: pressing.gradient }}>
      <div className="absolute -bottom-[18%] -right-[9%] h-[76%] w-[76%] rounded-full bg-neutral-950 shadow-2xl">
        <div className="absolute inset-[8%] rounded-full border border-white/10" />
        <div className="absolute inset-[19%] rounded-full border border-white/10" />
        <div className="absolute inset-[31%] rounded-full border border-white/10" />
        <div className="absolute inset-[39%] rounded-full bg-amber-200/80" />
        <div className="absolute inset-[48%] rounded-full bg-neutral-950" />
      </div>
      <div className="absolute left-4 top-4 max-w-[68%]">
        <p className="text-[10px] uppercase tracking-[0.22em] text-white/65">quietpress</p>
        <p className="mt-1 text-lg leading-tight text-white">{pressing.title}</p>
      </div>
    </div>
  )
}

type AnthologyPanelProps = {
  mode: CatalogMode
  setMode: (mode: CatalogMode) => void
  cart: Record<string, number>
  addToCart: (id: string) => void
  close: () => void
}

function AnthologyPanel({ mode, setMode, cart, addToCart, close }: AnthologyPanelProps) {
  const pressings = mode === 'latest' ? PRESSINGS.filter((pressing) => pressing.latest) : PRESSINGS

  return (
    <PanelShell eyebrow="The catalogue" title="Anthology" icon={<Disc3 size={19} />} close={close}>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <p className="max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
          Small-run vinyl editions cut for attentive listening. The cart is stored locally and no
          account is required.
        </p>
        <div className="flex rounded-2xl bg-white/10 p-1">
          <button
            type="button"
            onClick={() => setMode('all')}
            className={`flex-1 rounded-xl px-4 py-2 text-sm transition-colors sm:flex-none ${
              mode === 'all' ? 'bg-white text-gray-900' : 'text-white/70 hover:text-white'
            }`}
          >
            All pressings
          </button>
          <button
            type="button"
            onClick={() => setMode('latest')}
            className={`flex-1 rounded-xl px-4 py-2 text-sm transition-colors sm:flex-none ${
              mode === 'latest' ? 'bg-white text-gray-900' : 'text-white/70 hover:text-white'
            }`}
          >
            New arrivals
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {pressings.map((pressing) => (
          <article key={pressing.id} className="rounded-3xl bg-white/[0.08] p-3 ring-1 ring-white/10">
            <RecordArtwork pressing={pressing} />
            <div className="px-1 pb-1 pt-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-base">{pressing.title}</h3>
                  <p className="truncate text-xs text-white/55">{pressing.artist}</p>
                </div>
                <span className="rounded-lg bg-white/10 px-2 py-1 text-xs">{formatRubles(pressing.price)}</span>
              </div>
              <p className="mt-3 text-xs text-white/50">{pressing.edition}</p>
              <button
                type="button"
                onClick={() => addToCart(pressing.id)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-sm text-gray-900 transition-transform duration-200 hover:scale-[1.02] active:scale-[.98]"
              >
                {cart[pressing.id] ? <Check size={15} /> : <Plus size={15} />}
                {cart[pressing.id] ? `Add another · ${cart[pressing.id]} in cart` : 'Add to cart'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </PanelShell>
  )
}

type TalentsPanelProps = {
  followed: string[]
  toggleFollow: (name: string) => void
  playArtist: (trackIndex: number) => void
  close: () => void
}

function TalentsPanel({ followed, toggleFollow, playArtist, close }: TalentsPanelProps) {
  return (
    <PanelShell eyebrow="The roster" title="Talents" icon={<UserRound size={19} />} close={close}>
      <div className="mb-6 max-w-2xl">
        <p className="text-sm leading-relaxed text-white/70 sm:text-base">
          Artists working between field sound, slow electronics and tactile acoustic recording.
          Followed profiles are remembered on this device.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {ARTISTS.map((artist, index) => {
          const isFollowed = followed.includes(artist.name)
          return (
            <article
              key={artist.name}
              className="group rounded-3xl bg-white/[0.08] p-4 ring-1 ring-white/10 sm:p-5"
            >
              <div className="flex items-start gap-4">
                <div
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl text-xl text-white shadow-lg"
                  style={{
                    background: `linear-gradient(145deg, rgba(255,255,255,.25), rgba(37,99,235,.8)), hsl(${205 + index * 38} 62% 24%)`,
                  }}
                >
                  {artist.monogram}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg">{artist.name}</h3>
                      <p className="text-xs text-white/50">{artist.role}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleFollow(artist.name)}
                      className={`rounded-xl px-3 py-1.5 text-xs transition-transform duration-200 hover:scale-105 active:scale-95 ${
                        isFollowed ? 'bg-blue-700 text-white' : 'bg-white text-gray-900'
                      }`}
                    >
                      {isFollowed ? 'Following' : 'Follow'}
                    </button>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-white/65">{artist.bio}</p>
                  <button
                    type="button"
                    onClick={() => playArtist(artist.trackIndex)}
                    className="mt-4 flex items-center gap-2 text-sm text-white transition-transform duration-200 hover:translate-x-1"
                  >
                    <Play size={14} className="fill-white" /> Play a related session
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </PanelShell>
  )
}

type SoundDiaryPanelProps = {
  entries: DiaryEntry[]
  addEntry: (text: string, mood: string) => void
  removeEntry: (id: string) => void
  close: () => void
}

function SoundDiaryPanel({ entries, addEntry, removeEntry, close }: SoundDiaryPanelProps) {
  const [text, setText] = useState('')
  const [mood, setMood] = useState('still')

  const submit = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    addEntry(trimmed, mood)
    setText('')
  }

  return (
    <PanelShell eyebrow="Private listening notes" title="Sound diary" icon={<BookOpen size={19} />} close={close}>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)]">
        <section className="rounded-3xl bg-white/[0.08] p-4 ring-1 ring-white/10 sm:p-6">
          <p className="text-sm leading-relaxed text-white/65">
            Capture a phrase, a room tone or how a record felt. Entries remain only in this
            browser.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {['still', 'open', 'earthy', 'nocturnal'].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setMood(option)}
                className={`rounded-xl px-3 py-2 text-xs capitalize transition-colors ${
                  mood === option ? 'bg-white text-gray-900' : 'bg-white/10 text-white/70 hover:text-white'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') submit()
            }}
            rows={7}
            maxLength={420}
            placeholder="Today the room sounded like…"
            className="mt-4 w-full resize-none rounded-2xl border border-white/10 bg-black/[0.15] p-4 text-sm leading-relaxed text-white outline-none placeholder:text-white/35 focus:border-white/30"
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-[11px] text-white/40">{text.length}/420 · Ctrl/⌘ + Enter</span>
            <button
              type="button"
              onClick={submit}
              disabled={!text.trim()}
              className="rounded-xl bg-white px-4 py-2 text-sm text-gray-900 transition-transform duration-200 enabled:hover:scale-105 enabled:active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Save note
            </button>
          </div>
        </section>

        <section className="min-w-0">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm text-white/70">Recent entries</h3>
            <span className="text-xs text-white/40">{entries.length} saved</span>
          </div>
          <div className="space-y-3">
            {entries.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/15 px-6 py-14 text-center">
                <Waves className="mx-auto text-white/35" size={26} />
                <p className="mt-3 text-sm text-white/55">Your first listening note will appear here.</p>
              </div>
            ) : (
              entries.map((entry) => (
                <article key={entry.id} className="rounded-2xl bg-white/[0.08] p-4 ring-1 ring-white/10">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-white/40">
                        <span>{entry.mood}</span>
                        <span>·</span>
                        <time dateTime={entry.createdAt}>
                          {new Date(entry.createdAt).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </time>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-white/80">{entry.text}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeEntry(entry.id)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white/55 transition-colors hover:bg-red-500/20 hover:text-red-100"
                      aria-label="Delete diary entry"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </PanelShell>
  )
}

type PlaybackSalonProps = {
  currentTrackIndex: number
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  favorites: string[]
  loading: boolean
  audioError: string
  selectTrack: (index: number) => void
  togglePlayback: () => void
  previousTrack: () => void
  nextTrack: () => void
  toggleLike: (id: string) => void
  seek: (time: number) => void
  setVolume: (value: number) => void
  close: () => void
}

function PlaybackSalon({
  currentTrackIndex,
  isPlaying,
  currentTime,
  duration,
  volume,
  favorites,
  loading,
  audioError,
  selectTrack,
  togglePlayback,
  previousTrack,
  nextTrack,
  toggleLike,
  seek,
  setVolume,
  close,
}: PlaybackSalonProps) {
  const [query, setQuery] = useState('')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [genreFilter, setGenreFilter] = useState('All')
  const [visibleCount, setVisibleCount] = useState(72)
  const currentTrack = TRACKS[currentTrackIndex]
  const genres = useMemo(() => ['All', ...Array.from(new Set(TRACKS.map((track) => track.genre)))], [])

  const filteredTracks = TRACKS.map((track, index) => ({ track, index })).filter(({ track }) => {
    const matchesQuery = `${track.title} ${track.artist} ${track.genre}`
      .toLowerCase()
      .includes(query.toLowerCase())
    const matchesFavorites = !favoritesOnly || favorites.includes(track.id)
    const matchesGenre = genreFilter === 'All' || track.genre === genreFilter
    return matchesQuery && matchesFavorites && matchesGenre
  })

  useEffect(() => setVisibleCount(72), [query, favoritesOnly, genreFilter])
  const visibleTracks = filteredTracks.slice(0, visibleCount)

  return (
    <PanelShell eyebrow={`${TRACKS.length} public-domain cuts across 34 genres`} title="Playback salon" icon={<Music2 size={19} />} close={close}>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,.9fr)_minmax(320px,.55fr)]">
        <section className="min-w-0">
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex flex-1 items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/10">
              <Search size={16} className="text-white/45" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search the library"
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35"
              />
            </label>
            <button
              type="button"
              onClick={() => setFavoritesOnly((value) => !value)}
              className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm transition-colors ${
                favoritesOnly ? 'bg-blue-700 text-white' : 'bg-white/10 text-white/70 hover:text-white'
              }`}
            >
              <Heart size={15} className={favoritesOnly ? 'fill-white' : ''} /> Favorites
            </button>
          </div>

          <div className="genre-scroll mt-3 flex gap-2 overflow-x-auto pb-2" aria-label="Genre filters">
            {genres.map((genre) => (
              <button
                key={genre}
                type="button"
                onClick={() => setGenreFilter(genre)}
                className={`shrink-0 rounded-xl px-3 py-2 text-xs transition-colors ${
                  genreFilter === genre
                    ? 'bg-white text-gray-900'
                    : 'bg-white/10 text-white/65 hover:bg-white/[0.15] hover:text-white'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>

          <div className="mb-3 mt-1 flex items-center justify-between text-xs text-white/45">
            <span>{filteredTracks.length} of {TRACKS.length} tracks</span>
            <span>{favorites.length} favorites</span>
          </div>

          <div className="space-y-2">
            {filteredTracks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/15 px-5 py-12 text-center text-sm text-white/50">
                No tracks match this view.
              </div>
            ) : (
              visibleTracks.map(({ track, index }) => {
                const active = index === currentTrackIndex
                const liked = favorites.includes(track.id)
                return (
                  <article
                    key={track.id}
                    className={`flex items-center gap-3 rounded-2xl p-3 ring-1 transition-colors ${
                      active ? 'bg-white/[0.15] ring-white/25' : 'bg-white/[0.07] ring-white/10 hover:bg-white/10'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => (active ? togglePlayback() : selectTrack(index))}
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 hover:scale-105 active:scale-95 ${
                        active ? 'bg-blue-700 text-white' : 'bg-white text-gray-900'
                      }`}
                      aria-label={active && isPlaying ? 'Pause track' : 'Play track'}
                    >
                      {active && loading ? (
                        <AudioLines size={18} className="animate-pulse" />
                      ) : active && isPlaying ? (
                        <Pause size={17} />
                      ) : (
                        <Play size={17} className="translate-x-px" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => selectTrack(index)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <h3 className="truncate text-sm text-white">{track.title}</h3>
                      <p className="truncate text-xs text-white/45">{track.genre} · {track.note}</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleLike(track.id)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white transition-transform duration-200 hover:scale-105 active:scale-95"
                      aria-label={liked ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Heart size={15} className={liked ? 'fill-white' : ''} />
                    </button>
                  </article>
                )
              })
            )}
          </div>

          {visibleCount < filteredTracks.length && (
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + 72)}
              className="mt-3 w-full rounded-2xl bg-white/10 px-4 py-3 text-sm text-white ring-1 ring-white/10 transition-colors hover:bg-white/[0.16]"
            >
              Load 72 more · {filteredTracks.length - visibleCount} remaining
            </button>
          )}
        </section>

        <aside className="h-fit rounded-3xl bg-white p-4 text-gray-900 shadow-2xl sm:p-5 lg:sticky lg:top-0">
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-800 to-slate-950">
            <div className="absolute inset-[12%] animate-slow-spin rounded-full bg-neutral-950 shadow-2xl">
              <div className="absolute inset-[9%] rounded-full border border-white/10" />
              <div className="absolute inset-[20%] rounded-full border border-white/10" />
              <div className="absolute inset-[31%] rounded-full border border-white/10" />
              <div className="absolute inset-[39%] rounded-full bg-blue-600" />
              <div className="absolute inset-[48%] rounded-full bg-white" />
            </div>
            <div className="absolute left-4 top-4 rounded-xl bg-white/[0.15] px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-white backdrop-blur-md">
              CC0 session
            </div>
          </div>

          <div className="mt-5 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="truncate text-lg">{currentTrack.title}</h3>
              <p className="truncate text-xs text-gray-500">{currentTrack.artist} · {currentTrack.genre}</p>
            </div>
            <button
              type="button"
              onClick={() => toggleLike(currentTrack.id)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-blue-700 transition-transform duration-200 hover:scale-110 active:scale-95"
              aria-label="Toggle favorite"
            >
              <Heart size={17} className={favorites.includes(currentTrack.id) ? 'fill-blue-700' : ''} />
            </button>
          </div>

          <input
            type="range"
            min={0}
            max={duration || 0}
            value={Math.min(currentTime, duration || 0)}
            onChange={(event) => seek(Number(event.target.value))}
            className="player-range mt-5 w-full"
            aria-label="Track progress"
            disabled={!duration}
          />
          <div className="mt-1 flex justify-between text-[10px] text-gray-500">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          <div className="mt-5 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={previousTrack}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 transition-transform duration-200 hover:scale-105 active:scale-95"
              aria-label="Previous track"
            >
              <SkipBack size={18} />
            </button>
            <button
              type="button"
              onClick={togglePlayback}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-700 text-white shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95"
              aria-label={isPlaying ? 'Pause track' : 'Play track'}
            >
              {loading ? <AudioLines size={22} className="animate-pulse" /> : isPlaying ? <Pause size={21} /> : <Play size={21} className="translate-x-px" />}
            </button>
            <button
              type="button"
              onClick={nextTrack}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 transition-transform duration-200 hover:scale-105 active:scale-95"
              aria-label="Next track"
            >
              <SkipForward size={18} />
            </button>
          </div>

          <label className="mt-5 flex items-center gap-3 rounded-2xl bg-gray-100 px-3 py-2.5">
            <Volume2 size={16} className="text-gray-500" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(event) => setVolume(Number(event.target.value))}
              className="volume-range min-w-0 flex-1"
              aria-label="Volume"
            />
            <span className="w-8 text-right text-[10px] text-gray-500">{Math.round(volume * 100)}%</span>
          </label>

          {audioError && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">{audioError}</p>}

          <a
            href={ARCHIVE_SOURCE}
            target="_blank"
            rel="noreferrer"
            className="mt-4 flex items-center justify-between rounded-2xl border border-gray-200 px-3 py-3 text-xs text-gray-600 transition-colors hover:bg-gray-50"
          >
            <span>CC0 1.0 · 55 hours sliced into 1,020 playable cuts</span>
            <ExternalLink size={14} />
          </a>
        </aside>
      </div>
    </PanelShell>
  )
}

type CartPanelProps = {
  cart: Record<string, number>
  changeQuantity: (id: string, delta: number) => void
  clearCart: () => void
  close: () => void
}

function CartPanel({ cart, changeQuantity, clearCart, close }: CartPanelProps) {
  const [complete, setComplete] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [qrError, setQrError] = useState('')
  const [copied, setCopied] = useState<'phone' | 'amount' | 'details' | ''>('')
  const [orderId] = useState(() => `QP-${Date.now().toString(36).toUpperCase().slice(-7)}`)
  const items = PRESSINGS.filter((pressing) => cart[pressing.id])
  const total = items.reduce((sum, pressing) => sum + pressing.price * cart[pressing.id], 0)
  const itemCount = items.reduce((sum, item) => sum + cart[item.id], 0)

  const paymentPayload = useMemo(
    () =>
      [
        'quietpress · тестовый перевод по СБП',
        `Заказ: ${orderId}`,
        `Сумма: ${total} RUB`,
        `Банк получателя: ${SBP_RECIPIENT.bank}`,
        `Телефон: ${SBP_RECIPIENT.phone}`,
        `Получатель: определяется банком перед подтверждением`,
        'Назначение: quietpress order',
      ].join('\n'),
    [orderId, total],
  )

  useEffect(() => {
    if (!paymentOpen || total <= 0) return

    let active = true
    setQrDataUrl('')
    setQrError('')

    void QRCode.toDataURL(PAYMENT_TARGET_URL, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 640,
      color: {
        dark: '#111827',
        light: '#ffffff',
      },
    })
      .then((dataUrl) => {
        if (active) setQrDataUrl(dataUrl)
      })
      .catch(() => {
        if (active) setQrError('Не удалось создать QR-код. Используйте кнопку копирования реквизитов.')
      })

    return () => {
      active = false
    }
  }, [paymentOpen, total])

  const handleCopy = async (kind: 'phone' | 'amount' | 'details') => {
    try {
      const value = kind === 'phone'
        ? SBP_RECIPIENT.phone
        : kind === 'amount'
          ? String(total)
          : paymentPayload
      await copyText(value)
      setCopied(kind)
      window.setTimeout(() => setCopied(''), 1600)
    } catch {
      setCopied('')
    }
  }

  const confirmPayment = () => {
    const receipts = readStorage<PaymentReceipt[]>('quietpress-sbp-receipts-v1', [])
    const receipt: PaymentReceipt = {
      id: orderId,
      amount: total,
      createdAt: new Date().toISOString(),
      bank: SBP_RECIPIENT.bank,
      phone: SBP_RECIPIENT.phone,
      recipient: SBP_RECIPIENT.recipientHint,
    }
    writeStorage('quietpress-sbp-receipts-v1', [receipt, ...receipts].slice(0, 20))
    clearCart()
    setPaymentOpen(false)
    setComplete(true)
  }

  return (
    <PanelShell eyebrow="Basket and test checkout" title="Cart" icon={<ShoppingBag size={19} />} close={close}>
      {complete ? (
        <div className="mx-auto flex max-w-lg flex-col items-center rounded-3xl bg-white/10 px-6 py-14 text-center ring-1 ring-white/10">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-blue-700">
            <Check size={24} />
          </div>
          <h3 className="mt-5 text-2xl">Payment marked as sent</h3>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/60">
            Order {orderId} was saved locally. Because this site has no banking backend, the receipt
            is not automatically verified.
          </p>
          <button
            type="button"
            onClick={close}
            className="mt-6 rounded-xl bg-white px-5 py-2.5 text-sm text-gray-900 transition-transform duration-200 hover:scale-105 active:scale-95"
          >
            Return home
          </button>
        </div>
      ) : paymentOpen ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,.85fr)_minmax(320px,.65fr)]">
          <section className="rounded-3xl bg-white/[0.08] p-4 ring-1 ring-white/10 sm:p-6">
            <button
              type="button"
              onClick={() => setPaymentOpen(false)}
              className="mb-5 flex items-center gap-2 text-sm text-white/65 transition-colors hover:text-white"
            >
              <ArrowLeft size={15} /> Back to cart
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-700 text-white">
                <CreditCard size={19} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">СБП · ручной перевод</p>
                <h3 className="text-xl">Перевод по номеру телефона</h3>
              </div>
            </div>

            <div className="mt-6 space-y-3 rounded-2xl bg-black/[0.15] p-4 ring-1 ring-white/10">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-white/45">Сумма</span>
                <strong className="text-lg">{formatRubles(total)}</strong>
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-white/45">Банк</span>
                <span>{SBP_RECIPIENT.bank}</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-white/45">Телефон</span>
                <span>{SBP_RECIPIENT.phoneDisplay}</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-white/45">Получатель</span>
                <span className="max-w-[220px] text-right text-white/70">{SBP_RECIPIENT.recipientHint}</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-white/45">Заказ</span>
                <span>{orderId}</span>
              </div>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => void handleCopy('phone')}
                className="flex items-center justify-center gap-2 rounded-xl bg-white px-3 py-3 text-sm text-gray-900 transition-transform duration-200 hover:scale-[1.02] active:scale-[.98]"
              >
                {copied === 'phone' ? <Check size={15} /> : <Copy size={15} />}
                {copied === 'phone' ? 'Номер готов' : 'Номер'}
              </button>
              <button
                type="button"
                onClick={() => void handleCopy('amount')}
                className="flex items-center justify-center gap-2 rounded-xl bg-white px-3 py-3 text-sm text-gray-900 transition-transform duration-200 hover:scale-[1.02] active:scale-[.98]"
              >
                {copied === 'amount' ? <Check size={15} /> : <Copy size={15} />}
                {copied === 'amount' ? 'Сумма готова' : 'Сумма'}
              </button>
              <button
                type="button"
                onClick={() => void handleCopy('details')}
                className="flex items-center justify-center gap-2 rounded-xl bg-white/10 px-3 py-3 text-sm text-white ring-1 ring-white/10 transition-transform duration-200 hover:scale-[1.02] active:scale-[.98]"
              >
                {copied === 'details' ? <Check size={15} /> : <Copy size={15} />}
                {copied === 'details' ? 'Всё готово' : 'Все данные'}
              </button>
            </div>

            <a
              href={PAYMENT_TARGET_URL}
              target="_blank"
              rel="noreferrer"
              onClick={() => void handleCopy('phone')}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-300 px-4 py-3 text-sm text-gray-950 transition-transform duration-200 hover:scale-[1.02] active:scale-[.98]"
            >
              Скопировать номер и открыть перевод в Т-Банке <ExternalLink size={14} />
            </a>

            <div className="mt-5 flex items-start gap-3 rounded-2xl bg-amber-300/10 p-4 text-xs leading-relaxed text-amber-50 ring-1 ring-amber-200/20">
              <ShieldCheck size={17} className="mt-0.5 shrink-0" />
              <p>
                Перед переводом обязательно проверьте имя получателя в банковском приложении. Это
                ручной перевод: сначала сверьте имя, затем сумму и только после этого подтверждайте операцию. Сайт не видит банковскую транзакцию.
              </p>
            </div>
          </section>

          <aside className="h-fit rounded-3xl bg-white p-5 text-gray-900 shadow-2xl sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Official T-Bank transfer page</p>
                <h3 className="mt-1 text-lg">Scan to open the bank</h3>
              </div>
              <QrCode size={22} className="text-blue-700" />
            </div>

            <div className="mt-5 aspect-square overflow-hidden rounded-3xl bg-gray-100 p-3 ring-1 ring-gray-200">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR code opening the official T-Bank transfer page" className="h-full w-full rounded-2xl object-contain qr-crisp" />
              ) : qrError ? (
                <div className="flex h-full items-center justify-center p-5 text-center text-sm text-red-600">{qrError}</div>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">Creating QR…</div>
              )}
            </div>

            <p className="mt-4 text-xs leading-relaxed text-gray-500">
              Этот QR открывает официальную страницу переводов Т-Банка. После сканирования введите
              скопированный номер и сумму. Автоматический СБП-QR может выдать только банк или эквайринг.
            </p>

            {qrDataUrl && (
              <a
                href={qrDataUrl}
                download={`quietpress-${orderId}.png`}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-gray-50"
              >
                <Download size={15} /> Скачать QR входа в Т-Банк
              </a>
            )}

            <button
              type="button"
              onClick={confirmPayment}
              className="mt-2 w-full rounded-xl bg-blue-700 py-3 text-sm text-white transition-transform duration-200 hover:scale-[1.02] active:scale-[.98]"
            >
              Я оплатил · сохранить заказ
            </button>
          </aside>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="space-y-3">
            {items.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center">
                <ShoppingCart size={28} className="mx-auto text-white/35" />
                <h3 className="mt-4 text-lg">The cart is quiet</h3>
                <p className="mt-1 text-sm text-white/50">Add a pressing from the anthology.</p>
              </div>
            ) : (
              items.map((pressing) => (
                <article key={pressing.id} className="flex items-center gap-4 rounded-2xl bg-white/[0.08] p-3 ring-1 ring-white/10">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl">
                    <RecordArtwork pressing={pressing} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm">{pressing.title}</h3>
                    <p className="truncate text-xs text-white/45">{pressing.artist}</p>
                    <p className="mt-2 text-xs text-white/65">{formatRubles(pressing.price)} each</p>
                  </div>
                  <div className="flex items-center rounded-xl bg-white text-gray-900">
                    <button
                      type="button"
                      onClick={() => changeQuantity(pressing.id, -1)}
                      className="flex h-9 w-9 items-center justify-center transition-transform duration-200 hover:scale-110 active:scale-95"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-7 text-center text-sm">{cart[pressing.id]}</span>
                    <button
                      type="button"
                      onClick={() => changeQuantity(pressing.id, 1)}
                      className="flex h-9 w-9 items-center justify-center transition-transform duration-200 hover:scale-110 active:scale-95"
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </article>
              ))
            )}
          </section>

          <aside className="h-fit rounded-3xl bg-white p-5 text-gray-900 shadow-xl">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-gray-500">
              <Sparkles size={14} /> Test order
            </div>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Items</span><span>{itemCount}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Price range</span><span>10–100 ₽</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Payment</span><span>СБП · Т-Банк</span></div>
              <div className="h-px bg-gray-200" />
              <div className="flex justify-between text-base"><span>Total</span><strong>{formatRubles(total)}</strong></div>
            </div>
            <button
              type="button"
              onClick={() => setPaymentOpen(true)}
              disabled={items.length === 0}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 py-3 text-sm text-white transition-transform duration-200 enabled:hover:scale-[1.02] enabled:active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <QrCode size={16} /> Оплатить через СБП
            </button>
            <p className="mt-3 text-center text-[10px] leading-relaxed text-gray-400">
              Тестовые цены. Перевод выполняется вручную в банковском приложении; сайт не проверяет поступление.
            </p>
          </aside>
        </div>
      )}
    </PanelShell>
  )
}


export default function App() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const segmentAdvanceRef = useRef(false)
  const [view, setView] = useState<View>(() => HASH_VIEW[window.location.hash.slice(1)] ?? 'home')
  const [catalogMode, setCatalogMode] = useState<CatalogMode>('all')
  const [cart, setCart] = useState<Record<string, number>>(() => readStorage('quietpress-cart-v2', {}))
  const [favorites, setFavorites] = useState<string[]>(() => readStorage('quietpress-favorites-v2', []))
  const [followed, setFollowed] = useState<string[]>(() => readStorage('quietpress-followed-v1', []))
  const [entries, setEntries] = useState<DiaryEntry[]>(() => readStorage('quietpress-diary-v1', []))
  const [currentTrackIndex, setCurrentTrackIndex] = useState(() => {
    const stored = readStorage('quietpress-track-index-v1', 0)
    return Number.isInteger(stored) && stored >= 0 && stored < TRACKS.length ? stored : 0
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(() => readStorage('quietpress-volume-v1', 0.72))
  const [loading, setLoading] = useState(false)
  const [audioError, setAudioError] = useState('')

  const currentTrack = TRACKS[currentTrackIndex]
  const cartCount = useMemo(() => Object.values(cart).reduce((sum, quantity) => sum + quantity, 0), [cart])

  useEffect(() => {
    const syncView = () => setView(HASH_VIEW[window.location.hash.slice(1)] ?? 'home')
    window.addEventListener('hashchange', syncView)
    window.addEventListener('popstate', syncView)
    return () => {
      window.removeEventListener('hashchange', syncView)
      window.removeEventListener('popstate', syncView)
    }
  }, [])

  const navigate = useCallback((nextView: View) => {
    const hash = VIEW_HASH[nextView]
    const target = hash ? `#${hash}` : `${window.location.pathname}${window.location.search}`
    window.history.pushState({}, '', target)
    setView(nextView)
  }, [])

  useEffect(() => {
    if (view === 'home') return
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') navigate('home')
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [navigate, view])

  useEffect(() => writeStorage('quietpress-cart-v2', cart), [cart])
  useEffect(() => writeStorage('quietpress-favorites-v2', favorites), [favorites])
  useEffect(() => writeStorage('quietpress-followed-v1', followed), [followed])
  useEffect(() => writeStorage('quietpress-diary-v1', entries), [entries])
  useEffect(() => writeStorage('quietpress-track-index-v1', currentTrackIndex), [currentTrackIndex])
  useEffect(() => writeStorage('quietpress-volume-v1', volume), [volume])

  const nextTrack = useCallback(() => {
    setCurrentTrackIndex((index) => (index + 1) % TRACKS.length)
    setCurrentTime(0)
    setIsPlaying(true)
  }, [])

  const previousTrack = useCallback(() => {
    const audio = audioRef.current
    if (audio && audio.currentTime > currentTrack.startAt + 4) {
      audio.currentTime = currentTrack.startAt
      setCurrentTime(0)
      return
    }
    setCurrentTrackIndex((index) => (index - 1 + TRACKS.length) % TRACKS.length)
    setCurrentTime(0)
    setIsPlaying(true)
  }, [currentTrack.startAt])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    segmentAdvanceRef.current = false
    setAudioError('')
    setCurrentTime(0)
    setDuration(currentTrack.endAt - currentTrack.startAt)
    audio.src = currentTrack.url
    audio.load()
    audio.volume = volume
  }, [currentTrack.id, currentTrack.url, currentTrack.startAt, currentTrack.endAt])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = volume
  }, [volume])

  const togglePlayback = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    if (audio.paused) {
      if (audio.currentTime < currentTrack.startAt || audio.currentTime >= currentTrack.endAt) {
        audio.currentTime = currentTrack.startAt
      }
      setLoading(true)
      setAudioError('')
      void audio.play().then(() => setIsPlaying(true)).catch(() => {
        setLoading(false)
        setIsPlaying(false)
        setAudioError('The remote audio stream could not be started. Check the connection and try again.')
      })
    } else {
      audio.pause()
      setIsPlaying(false)
      setLoading(false)
    }
  }, [currentTrack.startAt, currentTrack.endAt])

  const selectTrack = useCallback((index: number) => {
    if (index === currentTrackIndex) {
      const audio = audioRef.current
      if (audio?.paused) {
        setLoading(true)
        void audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
      }
      return
    }
    setCurrentTrackIndex(index)
    setCurrentTime(0)
    setIsPlaying(true)
  }, [currentTrackIndex])

  const seek = useCallback((time: number) => {
    const audio = audioRef.current
    if (!audio || !Number.isFinite(time)) return
    const segmentDuration = currentTrack.endAt - currentTrack.startAt
    const relativeTime = Math.max(0, Math.min(segmentDuration, time))
    audio.currentTime = currentTrack.startAt + relativeTime
    setCurrentTime(relativeTime)
  }, [currentTrack.startAt, currentTrack.endAt])

  const setVolume = useCallback((value: number) => {
    setVolumeState(Math.max(0, Math.min(1, value)))
  }, [])

  const toggleLike = useCallback((trackId: string) => {
    setFavorites((items) => items.includes(trackId) ? items.filter((id) => id !== trackId) : [...items, trackId])
  }, [])

  const addToCart = useCallback((id: string) => {
    setCart((items) => ({ ...items, [id]: (items[id] ?? 0) + 1 }))
  }, [])

  const changeQuantity = useCallback((id: string, delta: number) => {
    setCart((items) => {
      const quantity = (items[id] ?? 0) + delta
      if (quantity <= 0) {
        const next = { ...items }
        delete next[id]
        return next
      }
      return { ...items, [id]: quantity }
    })
  }, [])

  const openCatalog = useCallback((mode: CatalogMode) => {
    setCatalogMode(mode)
    navigate('anthology')
  }, [navigate])

  const playArtist = useCallback((trackIndex: number) => {
    selectTrack(trackIndex)
    navigate('playback-salon')
  }, [navigate, selectTrack])

  const toggleFollow = useCallback((name: string) => {
    setFollowed((items) => items.includes(name) ? items.filter((item) => item !== name) : [...items, name])
  }, [])

  const addEntry = useCallback((text: string, mood: string) => {
    setEntries((items) => [
      { id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, text, mood, createdAt: new Date().toISOString() },
      ...items,
    ])
  }, [])

  const removeEntry = useCallback((id: string) => {
    setEntries((items) => items.filter((entry) => entry.id !== id))
  }, [])

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <audio
        ref={audioRef}
        preload="metadata"
        onLoadStart={() => setLoading(true)}
        onLoadedMetadata={(event) => {
          const audio = event.currentTarget
          audio.currentTime = currentTrack.startAt
          setCurrentTime(0)
          setDuration(currentTrack.endAt - currentTrack.startAt)
          if (isPlaying) {
            setLoading(true)
            void audio.play().catch(() => {
              setLoading(false)
              setIsPlaying(false)
              setAudioError('Playback was blocked. Press play once to start the stream.')
            })
          }
        }}
        onCanPlay={() => setLoading(false)}
        onPlaying={() => {
          setIsPlaying(true)
          setLoading(false)
        }}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={(event) => {
          const absoluteTime = event.currentTarget.currentTime
          if (absoluteTime >= currentTrack.endAt - 0.15 && !segmentAdvanceRef.current) {
            segmentAdvanceRef.current = true
            nextTrack()
            return
          }
          setCurrentTime(Math.max(0, Math.min(currentTrack.endAt - currentTrack.startAt, absoluteTime - currentTrack.startAt)))
        }}
        onDurationChange={() => setDuration(currentTrack.endAt - currentTrack.startAt)}
        onEnded={nextTrack}
        onError={() => {
          setLoading(false)
          setIsPlaying(false)
          setAudioError('The Internet Archive stream is temporarily unavailable. Try another track or reload later.')
        }}
      />

      <BoomerangVideoBg />
      <Header currentView={view} cartCount={cartCount} navigate={navigate} />
      <HeroContent openCatalog={openCatalog} />
      <NowPlaying
        track={currentTrack}
        isPlaying={isPlaying}
        liked={favorites.includes(currentTrack.id)}
        currentTime={currentTime}
        duration={duration}
        loading={loading}
        togglePlayback={togglePlayback}
        previousTrack={previousTrack}
        nextTrack={nextTrack}
        toggleLike={() => toggleLike(currentTrack.id)}
        seek={seek}
        openSalon={() => navigate('playback-salon')}
      />

      {view === 'anthology' && (
        <AnthologyPanel
          mode={catalogMode}
          setMode={setCatalogMode}
          cart={cart}
          addToCart={addToCart}
          close={() => navigate('home')}
        />
      )}
      {view === 'talents' && (
        <TalentsPanel
          followed={followed}
          toggleFollow={toggleFollow}
          playArtist={playArtist}
          close={() => navigate('home')}
        />
      )}
      {view === 'sound-diary' && (
        <SoundDiaryPanel
          entries={entries}
          addEntry={addEntry}
          removeEntry={removeEntry}
          close={() => navigate('home')}
        />
      )}
      {view === 'playback-salon' && (
        <PlaybackSalon
          currentTrackIndex={currentTrackIndex}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          favorites={favorites}
          loading={loading}
          audioError={audioError}
          selectTrack={selectTrack}
          togglePlayback={togglePlayback}
          previousTrack={previousTrack}
          nextTrack={nextTrack}
          toggleLike={toggleLike}
          seek={seek}
          setVolume={setVolume}
          close={() => navigate('home')}
        />
      )}
      {view === 'cart' && (
        <CartPanel
          cart={cart}
          changeQuantity={changeQuantity}
          clearCart={() => setCart({})}
          close={() => navigate('home')}
        />
      )}
    </div>
  )
}
