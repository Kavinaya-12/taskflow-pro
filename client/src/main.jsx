import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import './styles/main.scss'

import { AuthProvider } from './context/AuthContext'
import { TaskProvider } from './context/TaskContext'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <TaskProvider>
        <App />
        <ToastContainer position="top-right" />
      </TaskProvider>
    </AuthProvider>
  </StrictMode>
)

// Apply saved theme on startup
try {
  const saved = localStorage.getItem('theme')
  if (saved === 'light') document.documentElement.classList.add('theme-light')
  else document.documentElement.classList.add('theme-dark')
} catch (e) {}
