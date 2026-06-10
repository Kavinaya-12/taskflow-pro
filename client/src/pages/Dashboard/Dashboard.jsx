import React from 'react'
import styles from './Dashboard.module.scss'
import Sidebar from '../../components/layout/Sidebar/Sidebar'
import Navbar from '../../components/layout/Navbar/Navbar'
import BackgroundEffects from '../../components/layout/BackgroundEffects/BackgroundEffects'
import { FiCheck, FiClock, FiList, FiTrendingUp } from 'react-icons/fi'
import StatsCard from '../../components/dashboard/StatsCard/StatsCard'
import SearchBar from '../../components/dashboard/SearchBar/SearchBar'
import TaskCard from '../../components/dashboard/TaskCard/TaskCard'
import EmptyState from '../../components/dashboard/EmptyState/EmptyState'
import TaskModal from '../../components/dashboard/TaskModal/TaskModal'
import Settings from '../Settings/Settings'
import { useState, useEffect } from 'react'
import { useTasks } from '../../context/TaskContext'

const Dashboard = () => {
  const { tasks, deleteTask, toggleStatus } = useTasks()

  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [filter, setFilter] = useState('All')
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'dark'
    } catch (e) {
      return 'dark'
    }
  })

  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    try {
      const v = localStorage.getItem('notifications')
      return v === null ? true : v === 'true'
    } catch (e) {
      return true
    }
  })

 const filteredTasks = tasks
  ? tasks.filter((task) => {

      const matchesSearch =
        task.title
          .toLowerCase()
          .includes(search.toLowerCase())

      if (!matchesSearch) {
        return false
      }

      if (activeTab === 'pending') {
        return task.status === 'Pending'
      }

      if (activeTab === 'tasks') {
        return true
      }

      if (filter === 'Pending') {
        return task.status === 'Pending'
      }

      if (filter === 'Completed') {
        return task.status === 'Completed'
      }

      return true
    })
  : []
  
  const totalTasks = tasks ? tasks.length : 0

  const completedTasks = tasks
    ? tasks.filter((task) => task.status === 'Completed').length
    : 0

  const pendingTasks = tasks
    ? tasks.filter((task) => task.status === 'Pending').length
    : 0

  const productivity = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'light') {
      root.classList.add('theme-light')
      root.classList.remove('theme-dark')
    } else {
      root.classList.add('theme-dark')
      root.classList.remove('theme-light')
    }
  }, [theme])

  return (
    <div className={styles.dashboard}>
      <BackgroundEffects />

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className={styles.main}>
        <Navbar />

        <section>
          <div className={styles.statsGrid}>
            <StatsCard title='Tasks' value={totalTasks} icon={<FiList />} color='linear-gradient(135deg,#8F4FFF,#C78DFF)' />
            <StatsCard title='Completed' value={completedTasks} icon={<FiCheck />} color='linear-gradient(135deg,#22C55E,#4ADE80)' />
            <StatsCard title='Pending' value={pendingTasks} icon={<FiClock />} color='linear-gradient(135deg,#FBBF24,#F59E0B)' />
            <StatsCard title='Productivity' value={`${productivity}%`} icon={<FiTrendingUp />} color='linear-gradient(135deg,#2F80ED,#56CCF2)' />
          </div>

          <SearchBar onNew={() => setShowModal(true)} search={search} setSearch={setSearch}   filter={filter}
  setFilter={setFilter} />

          {activeTab === 'settings' ? (
            <Settings />
          ) : filteredTasks && filteredTasks.length > 0 ? (
            <div className={styles.taskGrid}>
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  title={task.title}
                  description={task.description}
                  priority={task.priority}
                  status={task.status}
                  category={task.category}
                  date={new Date(task.createdAt).toLocaleDateString()}
                  onDelete={() => deleteTask(task._id)}
                  onToggle={() => toggleStatus(task)}
                />
              ))}
            </div>
          ) : (
            <EmptyState onCreate={() => setShowModal(true)} />
          )}

          {showModal && <TaskModal closeModal={() => setShowModal(false)} />}
        </section>
      </main>
    </div>
  )
}

export default Dashboard