import { Rocket, Sparkles, Clock, MessageCircle } from 'lucide-react'
import ResumeUploadButton from './ResumeUploadButton.jsx'

function FeatureRow({ icon: Icon, title, copy }) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-full bg-emerald-50 p-2">
        <Icon className="h-5 w-5 text-accent" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-sm text-gray-500 leading-snug">{copy}</p>
      </div>
    </div>
  )
}

export default function OnboardingScreen({ onParsed }) {
  return (
    <div className="min-h-full safe-top safe-bottom flex flex-col items-center justify-between px-6 py-10">
      <div />
      <div className="flex flex-col items-center text-center max-w-md w-full">
        <div className="rounded-3xl bg-accent shadow-card p-5 mb-6 animate-slideUp">
          <Rocket className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
          Techtastic
        </h1>
        <p className="mt-2 text-base text-gray-500 max-w-xs">
          Your personalized new grad tech feed. Upload your resume and we'll rank every role and event for you.
        </p>

        <div className="mt-8 w-full grid gap-4 text-left card">
          <FeatureRow
            icon={Sparkles}
            title="Smart match"
            copy="We read your skills and projects, then score every opportunity for fit."
          />
          <FeatureRow
            icon={Clock}
            title="Urgency first"
            copy="Closing soon? Just opened? It's at the top of your feed."
          />
          <FeatureRow
            icon={MessageCircle}
            title="Live buzz"
            copy="Hot recruiting threads from r/csMajors and r/cscareerquestions."
          />
        </div>
      </div>

      <div className="mt-10 w-full flex flex-col items-center gap-3">
        <ResumeUploadButton onParsed={onParsed} label="Upload your resume to get started" />
        <p className="text-xs text-gray-400 text-center max-w-xs">
          PDF only. Parsed locally + with Gemini. We never store your resume on a server.
        </p>
      </div>
    </div>
  )
}
