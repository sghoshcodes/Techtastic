import { ArrowUpRight, ArrowBigUp, MessageSquare } from 'lucide-react'

function timeAgo(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const sec = Math.max(1, Math.floor((Date.now() - d.getTime()) / 1000))
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  return `${day}d ago`
}

export default function BuzzCard({ post }) {
  return (
    <a
      href={post.url}
      target="_blank"
      rel="noopener noreferrer"
      className="card card-hover block"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-base font-semibold text-gray-900 leading-snug line-clamp-3">
          {post.title}
        </p>
        <ArrowUpRight className="h-4 w-4 text-accent shrink-0 mt-1" />
      </div>
      <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
        <span className="pill bg-emerald-50 text-emerald-700">r/{post.subreddit}</span>
        <span className="inline-flex items-center gap-1">
          <ArrowBigUp className="h-4 w-4" /> {post.score}
        </span>
        <span className="inline-flex items-center gap-1">
          <MessageSquare className="h-3.5 w-3.5" /> {post.numComments}
        </span>
        <span className="ml-auto">{timeAgo(post.datePosted)}</span>
      </div>
      <div className="mt-3 text-sm font-semibold text-accent">View thread →</div>
    </a>
  )
}
