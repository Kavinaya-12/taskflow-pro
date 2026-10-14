export function resolveApiBaseUrl({ isProduction, configuredUrl }) {
  const url = configuredUrl?.trim().replace(/\/+$/, '')
  if (isProduction) {
    if (!url) throw new Error('VITE_API_URL is required for production builds (include /api).')
    if (url.startsWith('/')) {
      if (url !== '/api') throw new Error('VITE_API_URL must use /api for same-origin production routing.')
    } else {
      let parsed
      try { parsed = new URL(url) } catch {
        throw new Error('VITE_API_URL must be /api or an absolute HTTPS API URL ending in /api.')
      }
      if (parsed.protocol !== 'https:' || !parsed.pathname.replace(/\/+$/, '').endsWith('/api') || /^(localhost|127(?:\.\d{1,3}){3}|\[::1\])$/i.test(parsed.hostname)) {
        throw new Error('VITE_API_URL must use HTTPS and end in /api; loopback hosts are not allowed in production.')
      }
    }
  }
  return url || '/api'
}
