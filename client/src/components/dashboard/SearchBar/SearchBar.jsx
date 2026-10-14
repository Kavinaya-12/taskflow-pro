import styles from './SearchBar.module.scss'
import { FiChevronDown, FiSliders } from 'react-icons/fi'

const SearchBar = ({ filter, setFilter }) => (
  <div className={styles.wrapper}>
    <span className={styles.resultLabel}><FiSliders aria-hidden="true" /> Refine your list</span>
    <label className={styles.selectWrapper}>
      <span className={styles.visuallyHidden}>Filter tasks by status</span>
      <select aria-label="Filter tasks by status" value={filter} onChange={(event) => setFilter(event.target.value)}>
        <option value="All">Every status</option>
        <option value="Pending">In progress</option>
        <option value="Completed">Completed</option>
      </select>
      <FiChevronDown className={styles.arrow} aria-hidden="true" />
    </label>
  </div>
)

export default SearchBar
