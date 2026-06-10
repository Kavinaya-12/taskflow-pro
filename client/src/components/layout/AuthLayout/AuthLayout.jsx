import styles from './AuthLayout.module.scss'
import BackgroundEffects from '../BackgroundEffects/BackgroundEffects'

const AuthLayout = ({ children }) => {
  return (
    <div className={styles.authPage}>
      <BackgroundEffects />

      <div className={styles.authContainer}>{children}</div>
    </div>
  )
}

export default AuthLayout
