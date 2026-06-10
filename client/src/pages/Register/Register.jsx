import styles from './Register.module.scss'
import AuthLayout from '../../components/layout/AuthLayout/AuthLayout'

import Input from '../../components/common/Input/Input'
import Button from '../../components/common/Button/Button'

import {
  FiUser,
  FiMail,
  FiLock,
  FiLayers,
  FiArrowRight
} from 'react-icons/fi'

import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-toastify'

const Register = () => {

  const navigate = useNavigate()
  const { register } = useAuth()

  const [loading, setLoading] =
    useState(false)

  const [formData, setFormData] =
    useState({
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

  const handleSubmit = async (e) => {

    e.preventDefault()

    // EMPTY FIELDS

    if (
      !formData.name ||
      !formData.email ||
      !formData.password
    ) {

      toast.error(
        'All fields are required'
      )

      return
    }

    // EMAIL VALIDATION

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (
      !emailRegex.test(
        formData.email
      )
    ) {

      toast.error(
        'Enter a valid email'
      )

      return
    }

    // PASSWORD VALIDATION

    if (
      formData.password.length < 6
    ) {

      toast.error(
        'Password must be at least 6 characters'
      )

      return
    }

    try {

      setLoading(true)

      await register(formData)

      toast.success(
        'Account created successfully'
      )

      navigate('/dashboard')

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        'Something went wrong'
      )

    } finally {

      setLoading(false)
    }
  }

  return (

    <AuthLayout>

      <motion.div
        className={styles.registerCard}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >

        <div className={styles.logoSection}>

          <div className={styles.logoIcon}>
            <FiLayers />
          </div>

          <h2>Create Account</h2>

          <p>
            Start managing your productivity
          </p>

        </div>

        <form
          className={styles.form}
          onSubmit={handleSubmit}
        >

          <Input
            name="name"
            placeholder="Full name"
            icon={FiUser}
            value={formData.name}
            onChange={handleChange}
          />

          <Input
            name="email"
            placeholder="Email"
            icon={FiMail}
            value={formData.email}
            onChange={handleChange}
          />

          <Input
            name="password"
            type="password"
            placeholder="Password"
            icon={FiLock}
            value={formData.password}
            onChange={handleChange}
          />

          <Button
            type="submit"
            icon={<FiArrowRight />}
          >

            {
              loading
                ? 'Creating Account...'
                : 'Create Account'
            }

          </Button>

        </form>

        <div className={styles.bottomText}>

          Already have an account?

          <Link to="/">
            Login
          </Link>

        </div>

      </motion.div>

    </AuthLayout>
  )
}

export default Register