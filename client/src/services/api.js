import axios from 'axios'
import { resolveApiBaseUrl } from './apiConfig'

const api = axios.create({
  baseURL: resolveApiBaseUrl({
    isProduction: import.meta.env.PROD,
    configuredUrl: import.meta.env.VITE_API_URL,
  }),
  timeout: 15000,
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || ''
    const isPublicAuthRequest = /\/auth\/(login|register)$/.test(requestUrl)
    if (error.response?.status === 401 && !isPublicAuthRequest) {
      try {
        const savedUser = JSON.parse(localStorage.getItem('user') || 'null')
        const currentToken = savedUser?.token
        const authorization = error.config?.headers?.Authorization || error.config?.headers?.authorization
        const failedToken = typeof authorization === 'string' ? authorization.replace(/^Bearer\s+/i, '') : null
        if (!currentToken || !failedToken || currentToken === failedToken) {
          localStorage.removeItem('user')
          localStorage.removeItem('token')
          window.dispatchEvent(new Event('taskflow:unauthorized'))
        }
      } catch (error) {
        void error
      }
    }
    return Promise.reject(error)
  }
)

export default api
