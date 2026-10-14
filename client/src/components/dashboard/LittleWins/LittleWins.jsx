import { useEffect, useRef, useState } from 'react'
import styles from './LittleWins.module.scss'
import { useTasks } from '../../../context/useTasks'

const DURATION = 1800 // ms the celebration stays on screen


const LittleWins = () => {
  const { onTaskCompleted } = useTasks()
  const [win, setWin] = useState(null)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!onTaskCompleted) return undefined
    const unsubscribe = onTaskCompleted((task) => {
      setWin({ id: task?._id || Date.now(), title: task?.title || 'Task' })
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setWin(null), DURATION)
    })
    return () => {
      unsubscribe()
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [onTaskCompleted])

  if (!win) return null

  return (
    <div className={styles.layer} aria-hidden="true">
      <div className={styles.confetti}>
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} className={`${styles.piece} ${styles[`p${i % 6}`]}`} style={{ '--i': i }} />
        ))}
      </div>
    </div>
  )
}

export const LittleWinsAnnouncer = () => {
  const { onTaskCompleted } = useTasks()
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!onTaskCompleted) return undefined
    return onTaskCompleted((task) => {
      setMessage(`Nice! "${task?.title || 'Task'}" is complete.`)
    })
  }, [onTaskCompleted])

  return (
    <span className={styles.announcer} role="status" aria-live="polite">
      {message}
    </span>
  )
}

export default LittleWins
