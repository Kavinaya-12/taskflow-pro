import React from 'react'
import styles from './EmptyState.module.scss'
import { FiInbox } from 'react-icons/fi'

const EmptyState = ({ onCreate }) => {
  return (
    <div className={styles.empty}>
      <div className={styles.icon}>
        <FiInbox />
      </div>

      <h2>No tasks yet</h2>

      <p>Start creating tasks to boost your productivity workflow.</p>

      <button onClick={() => onCreate && onCreate()}>Create Task</button>
    </div>
  )
}

export default EmptyState
