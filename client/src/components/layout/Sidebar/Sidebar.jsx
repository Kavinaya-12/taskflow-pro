import React from 'react'
import styles from './Sidebar.module.scss'
import { FiGrid, FiCheckSquare, FiClock, FiSettings, FiLayers } from 'react-icons/fi'

const Sidebar = ({ activeTab, setActiveTab }) => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}><FiLayers /></div>

      <nav className={styles.menu}>
        <button className={activeTab === 'dashboard' ? `${styles.item} ${styles.active}` : styles.item} onClick={() => setActiveTab('dashboard')}>
          <FiGrid />
          <span>Dashboard</span>
        </button>

        <button className={activeTab === 'tasks' ? `${styles.item} ${styles.active}` : styles.item} onClick={() => setActiveTab('tasks')}>
          <FiCheckSquare />
          <span>Tasks</span>
        </button>

        <button className={activeTab === 'pending' ? `${styles.item} ${styles.active}` : styles.item} onClick={() => setActiveTab('pending')}>
          <FiClock />
          <span>Pending</span>
        </button>

        <button className={activeTab === 'settings' ? `${styles.item} ${styles.active}` : styles.item} onClick={() => setActiveTab('settings')}>
          <FiSettings />
          <span>Settings</span>
        </button>
      </nav>
    </aside>
  )
}

export default Sidebar
