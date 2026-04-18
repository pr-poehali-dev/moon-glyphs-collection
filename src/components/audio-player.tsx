import { useState, useRef, useEffect, useCallback } from "react"
import Icon from "@/components/ui/icon"

interface Track {
  key: string
  name: string
  url: string
  size: number
}

const GET_TRACKS_URL = "https://functions.poehali.dev/1cec9f6a-0cf5-4482-826b-d85c1ef0f401"

export function AudioPlayer() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [loading, setLoading] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    fetch(GET_TRACKS_URL)
      .then((r) => r.json())
      .then((data) => setTracks(data.tracks || []))
      .catch(() => setTracks([]))
  }, [])

  const current = tracks[currentIndex]

  const next = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % tracks.length)
    setIsPlaying(false)
  }, [tracks.length])

  const prev = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + tracks.length) % tracks.length)
    setIsPlaying(false)
  }, [tracks.length])

  const togglePlay = async () => {
    if (!audioRef.current || !current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      setLoading(true)
      try {
        await audioRef.current.play()
        setIsPlaying(true)
      } catch (err) {
        console.error(err)
      }
      setLoading(false)
    }
  }

  const onTimeUpdate = () => {
    if (!audioRef.current) return
    setProgress(audioRef.current.currentTime)
  }

  const onLoadedMetadata = () => {
    if (!audioRef.current) return
    setDuration(audioRef.current.duration)
  }

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    audioRef.current.currentTime = ratio * duration
  }

  const fmt = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, "0")}`
  }

  useEffect(() => {
    if (audioRef.current && current) {
      audioRef.current.load()
      setProgress(0)
      setDuration(0)
    }
  }, [currentIndex, current])

  if (tracks.length === 0) return null

  return (
    <>
      {current && (
        <audio
          ref={audioRef}
          src={current.url}
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
          onEnded={next}
          preload="metadata"
        />
      )}

      {/* Кнопка-триггер в hero */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-3 bg-red-600/90 hover:bg-red-600 text-white rounded-full px-6 py-3 font-orbitron font-bold text-sm uppercase tracking-widest transition-all duration-300 backdrop-blur-sm border border-red-500/50 hover:scale-105 shadow-lg shadow-red-900/40"
        >
          <Icon name="Play" size={18} />
          Слушать
        </button>
      )}

      {/* Плеер */}
      {isOpen && (
        <div className="w-full max-w-sm bg-black/80 backdrop-blur-md border border-red-500/30 rounded-2xl p-5 shadow-2xl shadow-red-900/30">
          {/* Заголовок */}
          <div className="flex items-center justify-between mb-4">
            <span className="font-orbitron text-xs uppercase tracking-widest text-red-400">Сейчас играет</span>
            <button
              onClick={() => { setIsOpen(false); audioRef.current?.pause(); setIsPlaying(false) }}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <Icon name="X" size={16} />
            </button>
          </div>

          {/* Название трека */}
          <div className="mb-5">
            <p className="text-white font-bold font-orbitron text-base truncate">{current?.name}</p>
            <p className="text-gray-500 text-xs mt-1">{currentIndex + 1} / {tracks.length}</p>
          </div>

          {/* Прогресс-бар */}
          <div
            className="h-1.5 bg-white/10 rounded-full mb-2 cursor-pointer relative overflow-hidden"
            onClick={seek}
          >
            <div
              className="h-full bg-red-500 rounded-full transition-all duration-100"
              style={{ width: duration ? `${(progress / duration) * 100}%` : "0%" }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mb-5">
            <span>{fmt(progress)}</span>
            <span>{fmt(duration)}</span>
          </div>

          {/* Управление */}
          <div className="flex items-center justify-center gap-6">
            <button onClick={prev} disabled={tracks.length < 2} className="text-gray-400 hover:text-white transition-colors disabled:opacity-30">
              <Icon name="SkipBack" size={22} />
            </button>
            <button
              onClick={togglePlay}
              className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg shadow-red-900/50"
            >
              {loading
                ? <Icon name="Loader2" size={20} />
                : isPlaying
                  ? <Icon name="Pause" size={20} />
                  : <Icon name="Play" size={20} />
              }
            </button>
            <button onClick={next} disabled={tracks.length < 2} className="text-gray-400 hover:text-white transition-colors disabled:opacity-30">
              <Icon name="SkipForward" size={22} />
            </button>
          </div>

          {/* Список треков */}
          {tracks.length > 1 && (
            <div className="mt-5 space-y-1 max-h-32 overflow-y-auto">
              {tracks.map((t, i) => (
                <button
                  key={t.key}
                  onClick={() => { setCurrentIndex(i); setIsPlaying(false) }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors truncate ${
                    i === currentIndex ? "bg-red-600/30 text-red-300" : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {i === currentIndex && isPlaying ? "▶ " : ""}{t.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
