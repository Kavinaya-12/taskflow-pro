import styles from './StatsCard.module.scss'
import { motion } from 'framer-motion'

const TONES = { coral: 'coral', pink: 'pink', lavender: 'lavender' }

const StatsCard = ({ title, value, detail, icon, tone = 'coral' }) => (
  <motion.article className={`${styles.card} ${styles[TONES[tone] || 'coral']}`} whileHover={{ y: -2 }} transition={{ duration: 0.18 }}>
    <span className={styles.icon}>{icon}</span>
    <div className={styles.body}><p>{title}</p><strong>{value}</strong><small>{detail}</small></div>
    <span className={styles.accentLine} aria-hidden="true" />
  </motion.article>
)

export default StatsCard
