import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
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
        <ToastContainer
          position="top-right"
          autoClose={2600}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          draggable={false}
          theme="colored"
          toastClassName="taskflow-toast"
        />
      </TaskProvider>
    </AuthProvider>
  </StrictMode>
)

try {
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null')
  const saved = localStorage.getItem(`theme-${currentUser?.email}`) ?? localStorage.getItem('theme')
  document.documentElement.classList.toggle('theme-dark', saved === 'dark')
  document.documentElement.classList.toggle('light-theme', saved !== 'dark')
} catch {
  document.documentElement.classList.add('light-theme')
}
