import React from 'react'
import styles from './Navbar.module.scss'
import { FiBell, FiLogOut } from 'react-icons/fi'
import { useAuth } from '../../../context/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()

  return (
    <header className={styles.navbar}>
   <div className={styles.left}>
  <h2>Dashboard</h2>
  <p>
    Welcome back, {user?.name || "user"}
  </p>
</div>

      <div className={styles.right}>
        <button className={styles.notification} title='Notifications'>
                    <FiBell />

        </button>

        <div className={styles.profile}>
          <div className={styles.avatar}>{user?.name?.charAt(0) || 'U'}</div>

          <div>
            <h4>{user?.name || 'User'}</h4>
            <span>Pro Plan</span>
          </div>
        </div>

        <button className={styles.logout} onClick={logout} title='Logout'>
          <FiLogOut />
        </button>
      </div>
    </header>
  )
}

export default Navbar
