import React from 'react'
import styles from './TaskCard.module.scss'

import { FiEdit2, FiTrash2, FiCheck, FiCalendar } from 'react-icons/fi'
import { motion } from 'framer-motion'

const TaskCard = ({ title, description, priority, status, category, date, onDelete, onToggle }) => {
  const statusClass = status === 'Completed' ? styles.completed : styles.pending
  const priorityClass = priority === 'High' ? styles.high : priority === 'Medium' ? styles.medium : styles.low

  return (
    <motion.div className={styles.card} whileHover={{ y: -6 }}>
      <div className={styles.top}>
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>

        <div className={`${styles.status} ${statusClass}`}>{status}</div>
      </div>

      <div className={styles.middle}>
        <div className={`${styles.priority} ${priorityClass}`}>{priority}</div>
        <div className={styles.category}>{category}</div>
      </div>

      <div className={styles.bottom}>
        <div className={styles.date}>
          <FiCalendar /> <span>{date}</span>
        </div>

        <div className={styles.actions}>
          <button className={styles.complete} title='Complete' onClick={() => onToggle && onToggle()}>
            <FiCheck />
          </button>

          <button className={styles.edit} title='Edit'>
            <FiEdit2 />
          </button>

          <button className={styles.delete} title='Delete' onClick={() => onDelete && onDelete()}>
            <FiTrash2 />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default TaskCard
