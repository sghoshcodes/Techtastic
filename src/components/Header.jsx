import { Rocket, FileText } from 'lucide-react'

function relTime(ts) {
  if (!ts) return 'Just now'
  const sec = Math.floor((Date.now() - ts) / 1000)
  if (sec < 30) return 'Just now'
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  return new Date(ts).toLocaleDateString()
}

export default function Header({ refreshedAt, onUpdateResume }) {
  return (
    <header className="safe-top sticky top-0 z-30 bg-bg/80 backdrop-blur-md border-b border-gray-100">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-accent p-1.5 shadow-card">
            <Rocket className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-gray-900">
            Techtastic
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 hidden sm:inline">
            Updated {relTime(refreshedAt)}
          </span>
          <button
            type="button"
            onClick={onUpdateResume}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 active:scale-95 transition-all"
            aria-label="Update resume"
          >
            <FileText className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
