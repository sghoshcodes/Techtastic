export default function SkeletonCard() {
  return (
    <div className="card">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-gray-200 animate-pulseSoft" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-gray-200 animate-pulseSoft" />
          <div className="h-3 w-1/2 rounded bg-gray-200 animate-pulseSoft" />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-5 w-16 rounded-full bg-gray-200 animate-pulseSoft" />
        <div className="h-5 w-20 rounded-full bg-gray-200 animate-pulseSoft" />
      </div>
    </div>
  )
}

export function SkeletonList({ count = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
