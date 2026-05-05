import { Flame, Calendar, MessageCircle } from 'lucide-react'

const TABS = [
  { id: 'foryou', label: 'For You', icon: Flame },
  { id: 'deadlines', label: 'Deadlines', icon: Calendar },
  { id: 'buzz', label: 'Buzz', icon: MessageCircle }
]

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-100">
      <div className="grid grid-cols-3">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className="relative flex flex-col items-center justify-center py-2.5 active:scale-95 transition-transform"
            >
              <Icon
                className={`h-5 w-5 ${isActive ? 'text-accent' : 'text-gray-400'}`}
                strokeWidth={isActive ? 2.4 : 2}
              />
              <span
                className={`mt-0.5 text-[11px] font-semibold ${
                  isActive ? 'text-accent' : 'text-gray-500'
                }`}
              >
                {label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 h-[3px] w-8 rounded-full bg-accent" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
