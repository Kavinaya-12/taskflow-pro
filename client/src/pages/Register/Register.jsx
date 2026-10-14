import styles from './Register.module.scss'
import AuthLayout from '../../components/layout/AuthLayout/AuthLayout'

import Input from '../../components/common/Input/Input'
import Button from '../../components/common/Button/Button'

import {
  FiUser,
  FiMail,
  FiLock,
  FiArrowRight
} from 'react-icons/fi'

import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useAuth } from '../../context/useAuth'
import { toast } from 'react-toastify'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Register = () => {

  const navigate = useNavigate()
  const { register } = useAuth()

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const validate = () => {
    const next = {}
    if (!formData.name.trim()) next.name = "Please tell us your name"
    if (!formData.email.trim()) next.email = "Email is required"
    else if (!EMAIL_REGEX.test(formData.email.trim())) next.email = "Enter a valid email address"
    if (!formData.password) next.password = "Password is required"
    else if (formData.password.length < 6) next.password = "Use at least 6 characters"
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    try {
      setLoading(true)
      setErrors({})
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      })
      toast.success('Your workspace is ready')
      navigate('/dashboard')
    } catch (error) {
      const message = error.response?.data?.message || "We couldn't create your account. Please try again."
      setErrors({ form: message })
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (

    <AuthLayout>

      <motion.div
        className={styles.registerCard}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
      >

        <div className={styles.logoSection}>
          <span className={styles.eyebrow}>A better rhythm starts here</span>
          <h2>Build your workspace.</h2>
          <p>Create an account and make room for focused, meaningful progress.</p>
        </div>

        <form
          className={styles.form}
          onSubmit={handleSubmit}
          noValidate
        >
          {errors.form && (
            <p className={styles.formError} role="alert">{errors.form}</p>
          )}

          <Input
            label="Full name"
            name="name"
            autoComplete="name"
            maxLength={100}
            required
            placeholder="Ada Lovelace"
            icon={FiUser}
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
          />

          <Input
            label="Email address"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            icon={FiMail}
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          />

          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={6}
            required
            placeholder="At least 6 characters"
            icon={FiLock}
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
          />

          <Button
            type="submit"
            disabled={loading}
            fullWidth
            icon={<FiArrowRight />}
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </Button>
        </form>

        <div className={styles.bottomText}>
          Already have an account?
          <Link to="/">Sign in</Link>
        </div>

      </motion.div>

    </AuthLayout>
  )
}

export default Register
