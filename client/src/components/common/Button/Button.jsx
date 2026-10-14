import styles from './Button.module.scss'


const Button = ({
  children,
  icon,
  type = 'button',
  onClick,
  disabled = false,
  variant = 'primary',
  fullWidth = false,
  ...rest
}) => {
  const classes = [
    styles.button,
    styles[variant] || styles.primary,
    fullWidth ? styles.fullWidth : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} className={classes} onClick={onClick} disabled={disabled} {...rest}>
      {children}
      {icon && <span className={styles.icon} aria-hidden="true">{icon}</span>}
    </button>
  )
}

export default Button
