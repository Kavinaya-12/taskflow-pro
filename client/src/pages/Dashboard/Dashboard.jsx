import { useCallback, useMemo, useState } from 'react'
import styles from './Dashboard.module.scss'
import Sidebar from '../../components/layout/Sidebar/Sidebar'
import Navbar from '../../components/layout/Navbar/Navbar'
import StatsCard from '../../components/dashboard/StatsCard/StatsCard'
import SearchBar from '../../components/dashboard/SearchBar/SearchBar'
import EmptyState from '../../components/dashboard/EmptyState/EmptyState'
import TaskModal from '../../components/dashboard/TaskModal/TaskModal'
import MyDay from '../../components/dashboard/MyDay/MyDay'
import LittleWins, { LittleWinsAnnouncer } from '../../components/dashboard/LittleWins/LittleWins'
import Settings from '../Settings/Settings'
import { useTasks } from '../../context/useTasks'
import { useAuth } from '../../context/useAuth'
import { classifyDueDate, getTodayKey, formatDueLabel } from '../../utils/dates'
import { FiArrowUpRight, FiCalendar, FiCheck, FiClock, FiEdit2, FiFlag, FiPlus, FiTrash2 } from 'react-icons/fi'

const Dashboard = () => {
  const { tasks = [], loading, error, deleteTask, toggleStatus } = useTasks()
  const { user } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [search, setSearch] = useState('')
  const [searchScope, setSearchScope] = useState('all')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [filter, setFilter] = useState('All')
  const [quickFilter, setQuickFilter] = useState('all')
  const [showMyDay, setShowMyDay] = useState(false)
  const todayKey = getTodayKey()
  const firstName = user?.name?.split(' ')[0]
  const todayLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    return tasks.filter((task) => {
      const title = (task.title || '').toLocaleLowerCase()
      const category = (task.category || '').toLocaleLowerCase()
      const searchable = `${title} ${category} ${(task.description || '').toLocaleLowerCase()}`
      const matchesSearch = !query || (searchScope === 'title' ? title.includes(query) : searchScope === 'category' ? category.includes(query) : searchable.includes(query))
      if (!matchesSearch) return false
      if (activeTab === 'pending' && task.status !== 'Pending') return false
      if (quickFilter === 'today' && classifyDueDate(task.dueDate, todayKey) !== 'today') return false
      if (quickFilter === 'overdue' && classifyDueDate(task.dueDate, todayKey) !== 'overdue') return false
      if (quickFilter === 'done' && task.status !== 'Completed') return false
      return filter === 'All' || task.status === filter
    })
  }, [tasks, search, searchScope, activeTab, filter, quickFilter, todayKey])

  const completedTasks = tasks.filter((task) => task.status === 'Completed').length
  const pendingTasks = tasks.filter((task) => task.status === 'Pending').length
  const productivity = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0
  const dueTodayCount = tasks.filter((task) => task.status !== 'Completed' && classifyDueDate(task.dueDate, todayKey) === 'today').length

  const weekActivity = useMemo(() => {
    const today = new Date()
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today)
      date.setDate(today.getDate() - (6 - index))
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      const count = tasks.filter((task) => {
        if (!task.createdAt) return false
        const created = new Date(task.createdAt)
        return Number.isNaN(created.getTime()) ? false : `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, '0')}-${String(created.getDate()).padStart(2, '0')}` === key
      }).length
      return { label: date.toLocaleDateString(undefined, { weekday: 'short' }), count, isToday: index === 6 }
    })
  }, [tasks])
  const peakActivity = Math.max(...weekActivity.map((day) => day.count), 1)

  const heading = activeTab === 'settings' ? 'Settings' : activeTab === 'pending' ? 'In progress' : activeTab === 'tasks' ? 'Your tasks' : 'Make today count.'
  const subtitle = activeTab === 'settings' ? 'Your account, your preferences.' : activeTab === 'pending' ? 'The work that is still moving forward.' : activeTab === 'tasks' ? 'Everything on your list, in one place.' : 'A clear view of what matters, and room to get it done.'
  const openNewTask = () => { setEditingTask(null); setShowModal(true) }
  const closeModal = useCallback(() => { setShowModal(false); setEditingTask(null) }, [])

  const quickFilters = [
    { id: 'all', label: 'Everything' },
    { id: 'today', label: `Due today${dueTodayCount ? ` · ${dueTodayCount}` : ''}` },
    { id: 'overdue', label: 'Overdue' },
    { id: 'done', label: 'Completed' },
  ]

  return (
    <div className={styles.dashboard}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onOpenMyDay={() => setShowMyDay(true)} />
      <main className={styles.main}>
        <div className={styles.section}>
          <Navbar activeTab={activeTab} search={search} setSearch={setSearch} searchScope={searchScope} setSearchScope={setSearchScope} onOpenSettings={() => setActiveTab('settings')} />

          {activeTab === 'settings' ? (
            <>
              <header className={styles.pageHeading}>
                <span className={styles.eyebrow}>Workspace / Account</span>
                <h1>{heading}</h1>
                <p>{subtitle}</p>
              </header>
              <Settings />
            </>
          ) : (
            <>
              {activeTab === 'dashboard' ? (
                <section className={styles.hero}>
                  <div className={styles.heroCopy}>
                    <span className={styles.heroDate}>{todayLabel} <i /></span>
                    <h1>{firstName ? <>Make today count,<br /><em>{firstName}.</em></> : heading}</h1>
                    <p>{subtitle}</p>
                    <div className={styles.heroActions}>
                      <button type="button" className={styles.heroPrimary} onClick={openNewTask}><FiPlus aria-hidden="true" /> Add a task</button>
                      <button type="button" className={styles.heroSecondary} onClick={() => setShowMyDay(true)}>Open My Day <FiArrowUpRight aria-hidden="true" /></button>
                    </div>
                  </div>
                  <div className={styles.heroArtwork} aria-hidden="true">
                    <svg viewBox="0 0 540 360" role="presentation">
                      <defs>
                        <linearGradient id="orbCoral" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#ffb078" /><stop offset="1" stopColor="#f04d62" /></linearGradient>
                        <linearGradient id="orbPink" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fa83bc" /><stop offset="1" stopColor="#bf2787" /></linearGradient>
                        <linearGradient id="orbLilac" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#ece5ff" /><stop offset="1" stopColor="#aa9df1" /></linearGradient>
                        <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="18" stdDeviation="18" floodColor="#76204d" floodOpacity=".18" /></filter>
                      </defs>
                      <circle cx="345" cy="167" r="134" fill="url(#orbLilac)" opacity=".8" />
                      <path d="M312 50c55-21 131 6 151 59 20 53-16 124-67 151-51 28-117 14-143-30-27-44 4-158 59-180Z" fill="url(#orbPink)" filter="url(#softShadow)" />
                      <ellipse cx="267" cy="222" rx="126" ry="74" transform="rotate(-31 267 222)" fill="url(#orbCoral)" filter="url(#softShadow)" />
                      <path d="M326 98c27 18 41 48 37 81" fill="none" stroke="rgba(255,255,255,.72)" strokeWidth="3" strokeLinecap="round" />
                      <path d="M198 226c35-33 81-49 126-43" fill="none" stroke="rgba(255,255,255,.62)" strokeWidth="3" strokeLinecap="round" />
                      <circle cx="426" cy="80" r="9" fill="#fff" opacity=".9" />
                      <circle cx="167" cy="117" r="5" fill="#ffdc72" />
                      <path d="m435 252 8 17 18 2-13 12 3 18-16-9-16 9 3-18-13-12 18-2 8-17Z" fill="#ffdc72" />
                      <rect x="90" y="266" width="102" height="8" rx="4" fill="#fff" opacity=".56" transform="rotate(-15 90 266)" />
                    </svg>
                    <div className={styles.artLabel}><span>01</span><span>Clear head<br />full focus</span></div>
                  </div>
                  <span className={styles.heroIndex}>TF—01</span>
                </section>
              ) : (
                <header className={styles.pageHeading}>
                  <span className={styles.eyebrow}>Workspace / Tasks</span>
                  <h1>{heading}</h1>
                  <p>{subtitle}</p>
                </header>
              )}

              {activeTab === 'dashboard' && (
                <>
                  <section className={styles.metrics} aria-label="Task overview">
                    <StatsCard title="Completion" value={`${productivity}%`} detail={`${completedTasks} of ${tasks.length} tasks`} icon={<FiCheck aria-hidden="true" />} tone="coral" />
                    <StatsCard title="In progress" value={pendingTasks} detail="Tasks still on your list" icon={<FiClock aria-hidden="true" />} tone="pink" />
                    <StatsCard title="Focus time" value="—" detail="Time tracking isn’t enabled" icon={<FiCalendar aria-hidden="true" />} tone="lavender" />
                  </section>
                  <div className={styles.overviewGrid}>
                    <section className={styles.weeklyPanel} aria-labelledby="weekly-title">
                      <div className={styles.panelHeading}>
                        <div><span className={styles.panelKicker}>Your rhythm</span><h2 id="weekly-title">Tasks added this week</h2></div>
                        <span className={styles.panelBadge}>Last 7 days</span>
                      </div>
                      <div className={styles.chart} role="img" aria-label={`Tasks added in the last seven days: ${weekActivity.map((day) => `${day.label} ${day.count}`).join(', ')}`}>
                        {weekActivity.map((day) => (
                          <div className={styles.chartColumn} key={day.label}>
                            <span className={styles.chartValue}>{day.count || ''}</span>
                            <div className={styles.chartTrack}><span className={`${styles.chartBar} ${day.isToday ? styles.chartBarToday : ''}`} style={{ height: `${Math.max(day.count / peakActivity * 100, 5)}%` }} /></div>
                            <span className={`${styles.chartLabel} ${day.isToday ? styles.chartLabelToday : ''}`}>{day.label}</span>
                          </div>
                        ))}
                      </div>
                      <p className={styles.chartFootnote}>Based on the tasks you’ve added. No tracked time is estimated.</p>
                    </section>
                    <aside className={styles.focusPanel}>
                      <span className={styles.focusMark}><FiCalendar aria-hidden="true" /></span>
                      <span className={styles.panelKicker}>On your radar</span>
                      <strong>{dueTodayCount}</strong>
                      <h2>{dueTodayCount === 1 ? 'task due today' : 'tasks due today'}</h2>
                      <p>Keep your attention on the next useful step.</p>
                      <button type="button" onClick={() => setShowMyDay(true)}>Focus in My Day <FiArrowUpRight aria-hidden="true" /></button>
                    </aside>
                  </div>
                </>
              )}

              <section className={styles.tasksSection} aria-labelledby="tasks-title">
                <div className={styles.taskSectionHeading}>
                  <div>
                    <span className={styles.panelKicker}>The work, in motion</span>
                    <h2 id="tasks-title">{activeTab === 'pending' ? 'In progress' : activeTab === 'tasks' ? 'All tasks' : 'Your task list'}</h2>
                    <p>{loading ? 'Loading your tasks…' : `${filteredTasks.length} ${filteredTasks.length === 1 ? 'task' : 'tasks'} showing`}</p>
                  </div>
                  <button type="button" className={styles.addTaskButton} onClick={openNewTask}><FiPlus aria-hidden="true" /> Add task</button>
                </div>
                <SearchBar filter={filter} setFilter={setFilter} />
                <div className={styles.quickFilters} role="group" aria-label="Quick filters">
                  {quickFilters.map((item) => <button key={item.id} type="button" className={`${styles.filterChip} ${quickFilter === item.id ? styles.filterChipActive : ''}`} onClick={() => setQuickFilter(item.id)} aria-pressed={quickFilter === item.id}>{item.label}</button>)}
                </div>

                {error ? <div className={styles.errorState} role="alert">{error}</div> : loading ? (
                  <div className={styles.loadingState} aria-live="polite"><span className={styles.spinner} aria-hidden="true" /><span>Getting things ready…</span></div>
                ) : filteredTasks.length ? (
                  <div className={styles.tableWrap}>
                    <table className={styles.taskTable}>
                      <thead><tr><th scope="col">Task</th><th scope="col">Priority</th><th scope="col">Due date</th><th scope="col">Status</th><th scope="col"><span className={styles.visuallyHidden}>Actions</span></th></tr></thead>
                      <tbody>
                        {filteredTasks.map((task) => {
                          const due = classifyDueDate(task.dueDate, todayKey)
                          const completed = task.status === 'Completed'
                          return (
                            <tr key={task._id} className={completed ? styles.completedRow : ''}>
                              <td data-label="Task">
                                <div className={styles.taskCell}>
                                  <button type="button" className={`${styles.checkTask} ${completed ? styles.checkedTask : ''}`} onClick={() => toggleStatus(task)} aria-label={completed ? `Reopen ${task.title}` : `Complete ${task.title}`}><FiCheck aria-hidden="true" /></button>
                                  <div className={styles.taskName}><strong>{task.title}</strong><span>{task.category || 'General'}{task.description ? ` · ${task.description}` : ''}</span></div>
                                </div>
                              </td>
                              <td data-label="Priority"><span className={`${styles.priority} ${styles[`priority${task.priority || 'Medium'}`]}`}><FiFlag aria-hidden="true" /> {task.priority || 'Medium'}</span></td>
                              <td data-label="Due date"><span className={`${styles.dueDate} ${due === 'overdue' ? styles.overdueDate : due === 'today' ? styles.todayDate : ''}`}>{task.dueDate ? <><FiCalendar aria-hidden="true" /> {formatDueLabel(task.dueDate, todayKey)}</> : '—'}</span></td>
                              <td data-label="Status"><span className={`${styles.status} ${completed ? styles.statusComplete : styles.statusPending}`}><i />{task.status}</span></td>
                              <td data-label="Actions"><div className={styles.rowActions}><button type="button" onClick={() => { setEditingTask(task); setShowModal(true) }} aria-label={`Edit ${task.title}`} title="Edit task"><FiEdit2 aria-hidden="true" /></button><button type="button" onClick={() => deleteTask(task._id)} aria-label={`Delete ${task.title}`} title="Delete task"><FiTrash2 aria-hidden="true" /></button></div></td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : <EmptyState onCreate={openNewTask} title={tasks.length === 0 ? 'Start with one good thing.' : 'No tasks match this view.'} message={tasks.length === 0 ? 'Add your first task and make a little momentum.' : 'Try another filter or search for a different task.'} />}
              </section>
            </>
          )}

          {showModal && <TaskModal task={editingTask} closeModal={closeModal} />}
        </div>
      </main>
      {showMyDay && <MyDay onClose={() => setShowMyDay(false)} />}
      <LittleWins />
      <LittleWinsAnnouncer />
    </div>
  )
}

export default Dashboard
