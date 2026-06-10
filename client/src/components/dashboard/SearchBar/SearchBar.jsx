import styles from './SearchBar.module.scss'

import {
  FiSearch,
  FiPlus,
  FiChevronDown
} from 'react-icons/fi'

const SearchBar = ({
  onNew,
  search,
  setSearch,
  filter,
  setFilter
}) => {

  return (

    <div className={styles.wrapper}>

      <div className={styles.searchBox}>

        <FiSearch />

        <input
          type='text'
          placeholder='Search tasks...'
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

      </div>

      <div className={styles.actions}>

        <div className={styles.selectWrapper}>

          <select
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value)
            }
          >

            <option value='All'>
              All Tasks
            </option>

            <option value='Pending'>
              Pending
            </option>

            <option value='Completed'>
              Completed
            </option>

          </select>

          <FiChevronDown className={styles.arrow} />

        </div>

        <button
          className={styles.newBtn}
          onClick={onNew}
        >

          <FiPlus />

          New Task

        </button>

      </div>

    </div>
  )
}
export default SearchBar