import { useEffect, useRef, useState } from 'react'
import { BarChart3, Heart, Menu, ShoppingCart, X } from 'lucide-react'

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260611_183632_c311af08-e4b7-458f-81e7-79847a49b3d3.mp4'

const NAV_LINKS = ['Anthology', 'Talents', 'Sound diary', 'Playback salon']

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
        // Keep the original video playing if the remote server disallows canvas capture.
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
          if (frame) {
            context.drawImage(frame, 0, 0, outputWidth, outputHeight)
          }

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

    const handleLoadedMetadata = () => {
      configureDimensions()
    }

    const handlePlaying = () => {
      startCapture()
    }

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

    void video.play().catch(() => {
      // Muted autoplay is normally permitted; controls are intentionally omitted.
    })

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

      if (loopRequestRef.current !== null) {
        cancelAnimationFrame(loopRequestRef.current)
      }

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
      <div className="absolute inset-0 bg-black/15" aria-hidden="true" />
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

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="absolute inset-x-0 top-0 z-20 px-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 md:px-10">
      <div className="relative flex items-center justify-between">
        <a href="#" className="flex items-center gap-2" aria-label="quietpress home">
          <BrandMark />
          <span className="text-base tracking-tight text-white">quietpress</span>
        </a>

        <nav
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex"
          aria-label="Primary navigation"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase().replaceAll(' ', '-')}`}
              className="whitespace-nowrap text-sm text-white/90 transition-colors hover:text-white"
            >
              {link}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl bg-white p-1 pr-3 text-gray-900 transition-transform duration-200 hover:scale-105 active:scale-95 sm:pr-4"
            aria-label="Open cart, 0 items"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-700 text-white">
              <ShoppingCart size={14} strokeWidth={2} />
            </span>
            <span className="hidden text-sm sm:inline">Cart (0)</span>
            <span className="text-sm sm:hidden">(0)</span>
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
          className="liquid-glass mx-0 mt-3 rounded-2xl p-2 md:hidden"
          aria-label="Mobile navigation"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase().replaceAll(' ', '-')}`}
              onClick={() => setMenuOpen(false)}
              className="block rounded-xl px-4 py-3 text-sm text-white/90 transition-colors hover:bg-white/10 hover:text-white"
            >
              {link}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}

function HeroContent() {
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
          className="rounded-xl bg-white px-7 py-2.5 text-sm text-gray-900 transition-transform duration-200 hover:scale-105 active:scale-95"
        >
          Browse the shelves
        </button>
        <button
          type="button"
          className="liquid-glass rounded-xl px-7 py-2.5 text-sm text-white transition-transform duration-200 hover:scale-105 active:scale-95"
        >
          Newest arrivals
        </button>
      </div>
    </main>
  )
}

function NowPlaying() {
  const [liked, setLiked] = useState(false)

  return (
    <section
      className="animate-fade-up delay-5 absolute bottom-4 right-4 z-20 w-[min(270px,calc(100vw-2rem))] sm:bottom-6 sm:right-6 sm:w-72 md:bottom-8 md:right-10"
      aria-label="Now playing"
    >
      <div className="flex items-center gap-3 rounded-2xl bg-white p-2.5 pr-4 shadow-lg">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white">
          <BarChart3 size={20} strokeWidth={2.5} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-gray-900">Helia Marsh -- Fern Light</p>
          <div className="mt-2 h-1 rounded-full bg-gray-200">
            <div className="h-full w-[30%] rounded-full bg-blue-700" />
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] text-gray-500">
            <span>0:33</span>
            <span>-1:21</span>
          </div>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          className="flex-1 rounded-2xl bg-white py-2 text-sm text-gray-900 shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95"
        >
          Prev
        </button>
        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-blue-700 shadow-lg transition-transform duration-200 hover:scale-110 active:scale-95"
          onClick={() => setLiked((value) => !value)}
          aria-label={liked ? 'Unlike track' : 'Like track'}
          aria-pressed={liked}
        >
          <Heart size={16} className={liked ? 'fill-blue-700' : ''} />
        </button>
        <button
          type="button"
          className="flex-1 rounded-2xl bg-white py-2 text-sm text-gray-900 shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95"
        >
          Next
        </button>
      </div>
    </section>
  )
}

export default function App() {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      <BoomerangVideoBg />
      <Header />
      <HeroContent />
      <NowPlaying />
    </div>
  )
}
