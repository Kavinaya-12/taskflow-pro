import React from 'react'
import styles from './Input.module.scss'

const Input = ({ type = 'text', placeholder = '', icon: Icon, name, value, onChange }) => {
  return (
    <div className={styles.inputGroup}>
      {Icon && (
        <span className={styles.icon}>
          <Icon />
        </span>
      )}

      <input
        type={type}
        placeholder={placeholder}
        name={name}
        value={value}
        onChange={onChange}
      />
    </div>
  )
}

export default Input
