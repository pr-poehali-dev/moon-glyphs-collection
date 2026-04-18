import { useState, useRef, useEffect } from "react"
import Icon from "@/components/ui/icon"

const URLS = {
  login: "https://functions.poehali.dev/0d66d551-78ec-46d1-a2d6-ab52409c3091",
  upload: "https://functions.poehali.dev/41f97c10-35d1-443b-81ce-bca9952311a2",
  files: "https://functions.poehali.dev/af1a5474-784a-44ea-bfe4-4380a534e8d0",
}

const SESSION_KEY = "melmann_admin_pw"

type FileType = "audio" | "image" | "text"

interface RemoteFile {
  key: string
  filename: string
  type: string
  size: number
  url: string
}

const TYPE_LABELS: Record<FileType, string> = {
  audio: "Музыка",
  image: "Изображение",
  text: "Текст стихов",
}

const TYPE_ACCEPT: Record<FileType, string> = {
  audio: ".mp3,.wav,.ogg,.flac,.m4a,.aac",
  image: ".jpg,.jpeg,.png,.webp,.gif",
  text: ".txt,.md",
}

const TYPE_ICON: Record<string, string> = {
  audio: "Music",
  image: "Image",
  text: "FileText",
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} Б`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`
}

export default function Admin() {
  const [password, setPassword] = useState("")
  const [authed, setAuthed] = useState(false)
  const [loginError, setLoginError] = useState("")
  const [loginLoading, setLoginLoading] = useState(false)

  const [fileType, setFileType] = useState<FileType>("audio")
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [files, setFiles] = useState<RemoteFile[]>([])
  const [filesLoading, setFilesLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const savedPw = useRef("")

  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY)
    if (saved) {
      savedPw.current = saved
      setAuthed(true)
      loadFiles(saved)
    }
  }, [])

  const login = async () => {
    setLoginLoading(true)
    setLoginError("")
    try {
      const res = await fetch(URLS.login, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        sessionStorage.setItem(SESSION_KEY, password)
        savedPw.current = password
        setAuthed(true)
        loadFiles(password)
      } else {
        setLoginError("Неверный пароль")
      }
    } catch {
      setLoginError("Ошибка соединения")
    }
    setLoginLoading(false)
  }

  const loadFiles = async (pw: string) => {
    setFilesLoading(true)
    try {
      const res = await fetch(URLS.files, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      })
      const data = await res.json()
      setFiles(data.files || [])
    } catch (e) {
      console.error(e)
    }
    setFilesLoading(false)
  }

  const upload = async () => {
    const file = fileInputRef.current?.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadResult(null)

    try {
      const arrayBuffer = await file.arrayBuffer()
      const bytes = new Uint8Array(arrayBuffer)
      let binary = ""
      bytes.forEach((b) => (binary += String.fromCharCode(b)))
      const base64 = btoa(binary)

      const res = await fetch(URLS.upload, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: savedPw.current,
          filename: file.name,
          type: fileType,
          data: base64,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setUploadResult({ ok: true, message: `Файл загружен: ${file.name}` })
        if (fileInputRef.current) fileInputRef.current.value = ""
        loadFiles(savedPw.current)
      } else {
        setUploadResult({ ok: false, message: data.error || "Ошибка загрузки" })
      }
    } catch {
      setUploadResult({ ok: false, message: "Ошибка соединения" })
    }
    setUploading(false)
  }

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY)
    setAuthed(false)
    setPassword("")
    setFiles([])
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-zinc-950 border border-red-500/20 rounded-2xl p-8 shadow-2xl">
          <h1 className="font-orbitron text-white text-2xl font-bold mb-2">МелоMann</h1>
          <p className="text-gray-500 text-sm mb-8">Панель администратора</p>

          <label className="block text-gray-400 text-xs uppercase tracking-widest mb-2">Пароль</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-red-500 transition-colors mb-4"
            placeholder="Введите пароль"
            autoFocus
          />
          {loginError && <p className="text-red-400 text-sm mb-4">{loginError}</p>}
          <button
            onClick={login}
            disabled={loginLoading || !password}
            className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-orbitron font-bold py-3 rounded-lg transition-colors text-sm uppercase tracking-widest"
          >
            {loginLoading ? "Вход..." : "Войти"}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Шапка */}
      <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <h1 className="font-orbitron font-bold text-lg">МелоMann <span className="text-red-400 text-sm">/ Админ</span></h1>
        <button onClick={logout} className="text-gray-500 hover:text-white text-sm flex items-center gap-2 transition-colors">
          <Icon name="LogOut" size={16} />
          Выйти
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">

        {/* Загрузка файла */}
        <section>
          <h2 className="font-orbitron text-white text-lg font-bold mb-6">Загрузить файл</h2>

          {/* Выбор типа */}
          <div className="flex gap-3 mb-6">
            {(["audio", "image", "text"] as FileType[]).map((t) => (
              <button
                key={t}
                onClick={() => { setFileType(t); if (fileInputRef.current) fileInputRef.current.value = "" }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  fileType === t ? "bg-red-600 text-white" : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon name={TYPE_ICON[t] as "Music" | "Image" | "FileText"} size={15} />
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>

          {/* Дроп-зона */}
          <div
            className="border-2 border-dashed border-white/10 hover:border-red-500/50 rounded-xl p-10 text-center cursor-pointer transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Icon name="Upload" size={32} />
            <p className="mt-3 text-gray-400 text-sm">Нажмите или перетащите файл</p>
            <p className="text-gray-600 text-xs mt-1">{TYPE_ACCEPT[fileType].toUpperCase()}</p>
            <input
              ref={fileInputRef}
              type="file"
              accept={TYPE_ACCEPT[fileType]}
              className="hidden"
              onChange={() => setUploadResult(null)}
            />
          </div>

          <button
            onClick={upload}
            disabled={uploading}
            className="mt-4 w-full bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-orbitron font-bold py-3 rounded-lg transition-colors text-sm uppercase tracking-widest flex items-center justify-center gap-2"
          >
            {uploading ? <><Icon name="Loader2" size={16} /> Загружаю...</> : <><Icon name="Upload" size={16} /> Загрузить</>}
          </button>

          {uploadResult && (
            <div className={`mt-3 px-4 py-3 rounded-lg text-sm ${uploadResult.ok ? "bg-green-900/30 text-green-400 border border-green-500/20" : "bg-red-900/30 text-red-400 border border-red-500/20"}`}>
              {uploadResult.message}
            </div>
          )}
        </section>

        {/* Список файлов */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-orbitron text-white text-lg font-bold">Загруженные файлы</h2>
            <button onClick={() => loadFiles(savedPw.current)} className="text-gray-500 hover:text-white text-sm flex items-center gap-1 transition-colors">
              <Icon name="RefreshCw" size={14} />
              Обновить
            </button>
          </div>

          {filesLoading ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <Icon name="Loader2" size={24} />
            </div>
          ) : files.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-12">Файлов пока нет</p>
          ) : (
            <div className="space-y-2">
              {files.map((f) => (
                <div key={f.key} className="flex items-center gap-4 bg-white/5 rounded-xl px-4 py-3 hover:bg-white/8 transition-colors">
                  <Icon name={TYPE_ICON[f.type] as "Music" | "Image" | "FileText"} size={18} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate font-medium">{f.filename}</p>
                    <p className="text-gray-500 text-xs">{TYPE_LABELS[f.type as FileType] ?? f.type} · {formatSize(f.size)}</p>
                  </div>
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-white transition-colors"
                  >
                    <Icon name="ExternalLink" size={16} />
                  </a>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}