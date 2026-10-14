import styles from './Navbar.module.scss'
import { FiLogOut, FiSearch, FiSettings } from 'react-icons/fi'
import { useAuth } from '../../../context/useAuth'

const Navbar = ({ activeTab = 'dashboard', search = '', setSearch, searchScope = 'all', setSearchScope, onOpenSettings }) => {
  const { user, logout } = useAuth()
  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() || 'U'

  return (
    <header className={styles.navbar}>
      <label className={styles.search}>
        <FiSearch aria-hidden="true" />
        <input type="search" aria-label="Search tasks" placeholder="Search your tasks" value={search} onChange={(event) => setSearch(event.target.value)} />
        <select aria-label="Search within" value={searchScope} onChange={(event) => setSearchScope(event.target.value)}>
          <option value="all">All</option><option value="title">Title</option><option value="category">Category</option>
        </select>
      </label>
      <div className={styles.right}>
        <span className={styles.viewLabel}>{activeTab === 'dashboard' ? 'Workspace' : activeTab === 'pending' ? 'In progress' : activeTab === 'tasks' ? 'Task list' : 'Account'}</span>
        <button className={styles.iconBtn} type="button" onClick={onOpenSettings} title="Open settings" aria-label="Open settings"><FiSettings aria-hidden="true" /></button>
        <div className={styles.profile}>
          <div className={styles.avatar} aria-hidden="true">{initial}</div>
          <div className={styles.profileText}><strong>{user?.name || 'Your account'}</strong><span>Taskflow Pro</span></div>
        </div>
        <button className={`${styles.iconBtn} ${styles.logout}`} type="button" onClick={logout} title="Log out" aria-label="Log out"><FiLogOut aria-hidden="true" /></button>
      </div>
    </header>
  )
}

export default Navbar
