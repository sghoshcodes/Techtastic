export default function EmptyState({ title, copy }) {
  return (
    <div className="px-6 pt-24 text-center animate-slideUp">
      <p className="text-base font-semibold text-gray-900">{title}</p>
      <p className="mt-1 text-sm text-gray-500 max-w-xs mx-auto">{copy}</p>
    </div>
  )
}
