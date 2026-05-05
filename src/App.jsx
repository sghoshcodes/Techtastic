import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import Header from './components/Header.jsx'
import BottomNav from './components/BottomNav.jsx'
import OnboardingScreen from './components/OnboardingScreen.jsx'
import ResumeUploadButton from './components/ResumeUploadButton.jsx'
import ForYou from './views/ForYou.jsx'
import Deadlines from './views/Deadlines.jsx'
import Buzz from './views/Buzz.jsx'
import { loadProfile, clearProfile } from './utils/parseResume.js'
import { clearAllCaches } from './utils/api.js'
import { usePullToRefresh } from './hooks/usePullToRefresh.js'

const TABS = ['foryou', 'deadlines', 'buzz']

export default function App() {
  const [profile, setProfile] = useState(() => loadProfile())
  const [tab, setTab] = useState('foryou')
  const [refreshNonce, setRefreshNonce] = useState(0)
  const [refreshedAt, setRefreshedAt] = useState(null)
  const [showResumeReupload, setShowResumeReupload] = useState(false)

  const { containerRef, pull, refreshing } = usePullToRefresh(async () => {
    clearAllCaches()
    setRefreshNonce((n) => n + 1)
    await new Promise((r) => setTimeout(r, 700))
    setRefreshedAt(Date.now())
  })

  useEffect(() => {
    if (containerRef.current) containerRef.current.scrollTop = 0
  }, [tab, containerRef])

  function handleParsed(p) {
    setProfile(p)
    setShowResumeReupload(false)
    clearAllCaches()
    setRefreshNonce((n) => n + 1)
  }

  function handleStartReupload() {
    setShowResumeReupload(true)
  }

  function handleCancelReupload() {
    setShowResumeReupload(false)
  }

  function handleManualRefresh() {
    clearAllCaches()
    setRefreshNonce((n) => n + 1)
    setRefreshedAt(Date.now())
  }

  if (!profile) {
    return <OnboardingScreen onParsed={handleParsed} />
  }

  return (
    <div className="h-full flex flex-col bg-bg">
      <Header refreshedAt={refreshedAt} onUpdateResume={handleStartReupload} />

      <main
        ref={containerRef}
        className="flex-1 overflow-y-auto overscroll-contain no-scrollbar relative"
      >
        {/* Pull-to-refresh visual indicator */}
        <div
          className="flex items-center justify-center text-xs text-gray-400 transition-all overflow-hidden"
          style={{ height: pull, opacity: pull / 70 }}
        >
          <RefreshCw
            className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`}
            style={{ transform: refreshing ? undefined : `rotate(${pull * 4}deg)` }}
          />
          {refreshing ? 'Refreshing...' : pull > 70 ? 'Release to refresh' : 'Pull to refresh'}
        </div>

        {tab === 'foryou' && <ForYou profile={profile} refreshNonce={refreshNonce} />}
        {tab === 'deadlines' && <Deadlines refreshNonce={refreshNonce} />}
        {tab === 'buzz' && <Buzz refreshNonce={refreshNonce} />}

        {/* Manual refresh affordance for desktop / non-touch users */}
        <div className="px-4 pb-24 pt-2 flex justify-center">
          <button
            type="button"
            onClick={handleManualRefresh}
            className="btn-ghost text-xs text-gray-400"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>
      </main>

      <BottomNav active={tab} onChange={(id) => TABS.includes(id) && setTab(id)} />

      {showResumeReupload && (
        <ResumeReuploadSheet
          onClose={handleCancelReupload}
          onParsed={handleParsed}
          profile={profile}
          onClear={() => {
            clearProfile()
            clearAllCaches()
            setProfile(null)
            setShowResumeReupload(false)
          }}
        />
      )}
    </div>
  )
}

function ResumeReuploadSheet({ onClose, onParsed, profile, onClear }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-cardHover p-6 safe-bottom animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-200 sm:hidden" />
        <h3 className="text-lg font-bold text-gray-900">Update your resume</h3>
        <p className="mt-1 text-sm text-gray-500">
          Re-upload to refresh your fit scores. Your current profile has{' '}
          {(profile.skills || []).length} skills detected.
        </p>

        <div className="mt-5 flex flex-col items-center">
          <ResumeUploadButton onParsed={onParsed} label="Choose new resume" />
        </div>

        <div className="mt-6 flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={onClear}
            className="text-red-600 hover:underline"
          >
            Clear profile
          </button>
          <button type="button" onClick={onClose} className="text-gray-500 hover:underline">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
