import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveApiBaseUrl } from '../src/services/apiConfig.js'

test('development uses the same-origin API path so Vite can proxy it', () => {
  assert.equal(resolveApiBaseUrl({ isProduction: false }), '/api')
})

test('production requires an explicit API base and never falls back to localhost', () => {
  assert.throws(
    () => resolveApiBaseUrl({ isProduction: true }),
    /VITE_API_URL is required/
  )
  assert.equal(
    resolveApiBaseUrl({ isProduction: true, configuredUrl: 'https://api.example.test/api/' }),
    'https://api.example.test/api'
  )
  assert.equal(resolveApiBaseUrl({ isProduction: true, configuredUrl: '/api' }), '/api')
  assert.throws(() => resolveApiBaseUrl({ isProduction: true, configuredUrl: 'http://localhost:5000/api' }), /loopback hosts/)
  assert.throws(() => resolveApiBaseUrl({ isProduction: true, configuredUrl: 'https://api.example.test' }), /HTTPS and end in \/api/)
})
