import styles from './Sidebar.module.scss'
import { FiCalendar, FiCheckSquare, FiGrid, FiSettings, FiZap } from 'react-icons/fi'

const Sidebar = ({ activeTab, setActiveTab, onOpenMyDay }) => {
  const itemClass = (tab) => `${styles.item} ${activeTab === tab ? styles.active : ''}`

  return (
    <aside className={styles.sidebar}>
      <a className={styles.brand} href="/dashboard" onClick={(event) => { event.preventDefault(); setActiveTab('dashboard') }} aria-label="Taskflow Pro home">
        <span className={styles.brandMark}><svg viewBox="0 0 42 42" aria-hidden="true"><path d="M9 12h24M9 21h16M9 30h12" /><path d="m26 27 4 4 7-9" /></svg></span>
        <span className={styles.brandName}>taskflow<span>.</span><small>PRO</small></span>
      </a>

      <span className={styles.navLabel}>WORKSPACE</span>
      <nav className={styles.menu} aria-label="Primary">
        <button type="button" className={itemClass('dashboard')} onClick={() => setActiveTab('dashboard')} aria-current={activeTab === 'dashboard' ? 'page' : undefined}><FiGrid aria-hidden="true" /><span>Overview</span></button>
        <button type="button" className={itemClass('tasks')} onClick={() => setActiveTab('tasks')} aria-current={activeTab === 'tasks' ? 'page' : undefined}><FiCheckSquare aria-hidden="true" /><span>All tasks</span></button>
        <button type="button" className={itemClass('pending')} onClick={() => setActiveTab('pending')} aria-current={activeTab === 'pending' ? 'page' : undefined}><FiCalendar aria-hidden="true" /><span>In progress</span></button>
      </nav>

      <span className={styles.navLabel}>PERSONAL</span>
      <nav className={styles.menu} aria-label="Personal tools">
        <button type="button" className={styles.item} onClick={onOpenMyDay}><FiZap aria-hidden="true" /><span>My Day</span><i className={styles.liveDot} /></button>
        <button type="button" className={itemClass('settings')} onClick={() => setActiveTab('settings')} aria-current={activeTab === 'settings' ? 'page' : undefined}><FiSettings aria-hidden="true" /><span>Settings</span></button>
      </nav>

      <div className={styles.sideNote}><span className={styles.sideNoteRule} /><strong>GOOD WORK<br />STARTS HERE.</strong><small>One clear next step<br />at a time.</small><span className={styles.sideNoteNumber}>TF / 2026</span></div>
    </aside>
  )
}

export default Sidebar
