import styles from './EmptyState.module.scss'
import { FiArrowUpRight, FiPlus } from 'react-icons/fi'

const EmptyState = ({ onCreate, title = 'Start with one good thing.', message }) => (
  <div className={styles.empty}>
    <div className={styles.art} aria-hidden="true"><span className={styles.artSquare} /><span className={styles.artCircle} /><span className={styles.artSlash} /></div>
    <span className={styles.eyebrow}>A fresh start</span>
    <h2>{title}</h2>
    <p>{message || 'No tasks are in this view yet. Add a clear next step to get moving.'}</p>
    {onCreate && <button type="button" className={styles.cta} onClick={onCreate}><FiPlus aria-hidden="true" /> Create a task <FiArrowUpRight aria-hidden="true" /></button>}
  </div>
)

export default EmptyState
