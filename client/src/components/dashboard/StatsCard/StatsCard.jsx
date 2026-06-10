import React from 'react'
import styles from './StatsCard.module.scss'
import { motion } from 'framer-motion'

const StatsCard = ({ title, value, icon, color }) => {
  return (
    <motion.div className={styles.card} whileHover={{ y: -6 }}>
      <div className={styles.icon} style={{ background: color }}>
        {icon}
      </div>

      <div>
        <p>{title}</p>
        <h2>{value}</h2>
      </div>
    </motion.div>
  )
}

export default StatsCard
