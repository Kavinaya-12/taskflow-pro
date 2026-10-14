import { useId, useState } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import styles from './Input.module.scss'


const Input = ({
  type = 'text',
  label,
  placeholder = '',
  icon: Icon,
  name,
  value,
  onChange,
  error,
  hint,
  id,
  className = '',
  ...inputProps
}) => {
  const autoId = useId()
  const inputId = id || (name ? `${name}-${autoId}` : autoId)
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
  const isPassword = type === 'password'
  const [revealed, setRevealed] = useState(false)
  const resolvedType = isPassword && revealed ? 'text' : type

  return (
    <div className={`${styles.field} ${className}`}>
      {label && (
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
      )}

      <div className={`${styles.inputGroup} ${error ? styles.hasError : ''}`}>
        {Icon && (
          <span className={styles.icon} aria-hidden="true">
            <Icon />
          </span>
        )}

        <input
          id={inputId}
          type={resolvedType}
          placeholder={placeholder}
          name={name}
          value={value}
          onChange={onChange}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          {...inputProps}
        />

        {isPassword && (
          <button
            type="button"
            className={styles.reveal}
            onClick={() => setRevealed((v) => !v)}
            aria-label={revealed ? 'Hide password' : 'Show password'}
            aria-pressed={revealed}
          >
            {revealed ? <FiEyeOff /> : <FiEye />}
          </button>
        )}
      </div>

      {error ? (
        <p className={styles.error} id={`${inputId}-error`} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className={styles.hint} id={`${inputId}-hint`}>
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export default Input
