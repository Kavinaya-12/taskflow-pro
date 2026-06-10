import React from 'react'
import styles from './Button.module.scss'

const Button = ({ children, icon, type = 'button', onClick }) => {
  return (
    <button type={type} className={styles.button} onClick={onClick}>
      {children}
      {icon && <span className={styles.icon}>{icon}</span>}
    </button>
  )
}

export default Button
