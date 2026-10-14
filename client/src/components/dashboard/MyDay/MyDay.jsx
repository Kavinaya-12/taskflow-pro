import { useEffect, useMemo, useState } from 'react'
import styles from './MyDay.module.scss'
import { FiX, FiCheck, FiSunrise, FiAlertCircle, FiCalendar, FiTarget } from 'react-icons/fi'
import { useTasks } from '../../../context/useTasks'
import { useAuth } from '../../../context/useAuth'
import { classifyDueDate, getTodayKey, formatDueLabel } from '../../../utils/dates'


const MyDay = ({ onClose }) => {
  const { tasks = [], loading, error, toggleStatus } = useTasks()
  const { user } = useAuth()
  const [focusId, setFocusId] = useState(null)
  const todayKey = getTodayKey()

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const { overdue, dueToday, completedToday } = useMemo(() => {
    const overdueList = []
    const todayList = []
    const completedList = []
    for (const task of tasks) {
      if (!task.dueDate) continue
      const bucket = classifyDueDate(task.dueDate, todayKey)
      if (task.status === 'Completed') {
        if (task.dueDate === todayKey) completedList.push(task)
        continue
      }
      if (bucket === 'overdue') overdueList.push(task)
      else if (bucket === 'today') todayList.push(task)
    }
    overdueList.sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    return { overdue: overdueList, dueToday: todayList, completedToday: completedList }
  }, [tasks, todayKey])

  const active = [...overdue, ...dueToday]
  const totalCount = active.length + completedToday.length
  const doneCount = completedToday.length
  const progress = totalCount ? Math.round((doneCount / totalCount) * 100) : 0

  const focusTask = active.find((t) => t._id === focusId) || active[0] || null
  const focusBucket = focusTask ? classifyDueDate(focusTask.dueDate, todayKey) : 'none'
  const firstName = user?.name?.split(' ')[0] || 'friend'

  const handleComplete = async () => {
    if (!focusTask) return
    await toggleStatus(focusTask)
    const remaining = active.filter((t) => t._id !== focusTask._id)
    setFocusId(remaining[0]?._id || null)
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="myday-title">
      <div className={styles.sheet}>
        <header className={styles.header}>
          <div className={styles.headerText}>
            <span className={styles.eyebrow}><FiSunrise aria-hidden="true" /> My Day</span>
            <h2 id="myday-title">A gentle focus for {firstName}</h2>
            <p className={styles.dateLine}>
              <FiCalendar aria-hidden="true" />
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Exit focus mode and return to workspace" title="Exit focus mode">
            <FiX aria-hidden="true" />
          </button>
        </header>

        {loading ? (
          <div className={styles.stateBox} aria-live="polite">
            <span className={styles.spinner} aria-hidden="true" />
            <p>Gathering your day…</p>
          </div>
        ) : error ? (
          <div className={`${styles.stateBox} ${styles.errorBox}`} role="alert">
            <FiAlertCircle aria-hidden="true" />
            <p>We couldn't load your tasks. {error}</p>
            <button type="button" className={styles.retry} onClick={onClose}>Back to workspace</button>
          </div>
        ) : (
          <>
            <section className={styles.progressRow}>
              <div
                className={styles.ring}
                style={{ '--progress': `${progress}` }}
                role="img"
                aria-label={`${progress}% of today's tasks complete`}
              >
                <div className={styles.ringInner}>
                  <span className={styles.ringValue}>{progress}%</span>
                  <span className={styles.ringLabel}>done</span>
                </div>
              </div>
              <div className={styles.counts}>
                <div className={`${styles.count} ${styles.countOverdue}`}>
                  <span className={styles.countValue}>{overdue.length}</span>
                  <span className={styles.countLabel}>Overdue</span>
                </div>
                <div className={`${styles.count} ${styles.countToday}`}>
                  <span className={styles.countValue}>{dueToday.length}</span>
                  <span className={styles.countLabel}>Due today</span>
                </div>
                <div className={`${styles.count} ${styles.countDone}`}>
                  <span className={styles.countValue}>{doneCount}</span>
                  <span className={styles.countLabel}>Completed</span>
                </div>
              </div>
            </section>
            {focusTask ? (
              <section className={`${styles.focusCard} ${styles[`focus_${focusBucket}`]}`}>
                <span className={styles.focusTag}>
                  <FiTarget aria-hidden="true" />
                  {focusBucket === 'overdue' ? 'Needs attention' : 'Focus now'}
                </span>
                <h3>{focusTask.title}</h3>
                {focusTask.description ? <p>{focusTask.description}</p> : null}
                <div className={styles.focusMeta}>
                  <span className={`${styles.duePill} ${styles[`due_${focusBucket}`]}`}>
                    <FiCalendar aria-hidden="true" /> {formatDueLabel(focusTask.dueDate, todayKey)}
                  </span>
                  {focusTask.category ? <span className={styles.catPill}>{focusTask.category}</span> : null}
                </div>
                <button type="button" className={styles.completeBtn} onClick={handleComplete}>
                  <FiCheck aria-hidden="true" /> Mark complete
                </button>
              </section>
            ) : (
              <div className={styles.allDone}>
                <div className={styles.allDoneMark} aria-hidden="true">
                  <span /><span />
                </div>
                <h3>{totalCount === 0 ? 'Nothing due today' : 'Your day is complete'}</h3>
                <p>
                  {totalCount === 0
                    ? 'Add a due date to a task and it will appear here for gentle focus.'
                    : 'Beautifully done. Every task due today is checked off.'}
                </p>
              </div>
            )}
            {active.length > 0 && (
              <section className={styles.listSection}>
                <h4 className={styles.listHeading}>The rest of your day</h4>
                <ul className={styles.taskList}>
                  {active.map((task) => {
                    const bucket = classifyDueDate(task.dueDate, todayKey)
                    const isFocus = task._id === focusTask?._id
                    return (
                      <li key={task._id}>
                        <button
                          type="button"
                          className={`${styles.taskItem} ${isFocus ? styles.taskItemActive : ''}`}
                          onClick={() => setFocusId(task._id)}
                          aria-current={isFocus ? 'true' : undefined}
                        >
                          <span className={`${styles.taskDue} ${styles[`due_${bucket}`]}`}>
                            {bucket === 'overdue' ? <FiAlertCircle aria-hidden="true" /> : <FiCalendar aria-hidden="true" />}
                            {formatDueLabel(task.dueDate, todayKey)}
                          </span>
                          <span className={styles.taskTitle}>{task.title}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default MyDay
