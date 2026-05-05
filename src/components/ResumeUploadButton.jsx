import { useRef, useState } from 'react'
import { Upload, Loader2 } from 'lucide-react'
import { parseResume } from '../utils/parseResume.js'

export default function ResumeUploadButton({ onParsed, label = 'Upload your resume', variant = 'primary' }) {
  const inputRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(file) {
    if (!file) return
    if (!/pdf$/i.test(file.type) && !/\.pdf$/i.test(file.name)) {
      setError('Please upload a PDF resume.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const profile = await parseResume(file)
      onParsed?.(profile)
    } catch (err) {
      setError(err?.message || 'Could not parse your resume. Please try again.')
    } finally {
      setLoading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const baseClass =
    variant === 'primary'
      ? 'btn-primary w-full max-w-xs text-base'
      : 'btn-ghost text-sm'

  return (
    <div className="flex flex-col items-center gap-3">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <button
        type="button"
        disabled={loading}
        onClick={() => inputRef.current?.click()}
        className={`${baseClass} ${loading ? 'opacity-70 cursor-wait' : ''}`}
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Reading your resume...
          </>
        ) : (
          <>
            <Upload className="h-5 w-5" />
            {label}
          </>
        )}
      </button>
      {error && (
        <p className="text-sm text-red-600 text-center max-w-xs">{error}</p>
      )}
    </div>
  )
}
