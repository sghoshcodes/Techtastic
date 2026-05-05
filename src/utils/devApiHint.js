/**
 * When /api/* fails on localhost, Vite often returns JS/HTML instead of JSON
 * (e.g. "Unexpected token 'I', \"import { p\"..."). Explain that npm run dev
 * does not run Vercel serverless routes.
 */
export function afterApiErrorCopy(apiError) {
  if (!apiError) return ' Pull down to refresh.'
  if (typeof window === 'undefined') return ' Pull down to refresh.'
  const h = window.location.hostname
  if (h !== 'localhost' && h !== '127.0.0.1') return ' Pull down to refresh.'
  return ' npm run dev does not run /api routes (that error is usually Vite returning JS). Run npx vercel dev in this project, or open your Vercel deployment.'
}
