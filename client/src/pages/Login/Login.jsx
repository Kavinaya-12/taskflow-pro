import styles from "./Login.module.scss";

import {
  FiMail,
  FiLock,
  FiArrowRight,
} from "react-icons/fi";

import { motion } from "framer-motion";
import { useState } from "react";

import Input from "../../components/common/Input/Input";
import Button from "../../components/common/Button/Button";
import AuthLayout from "../../components/layout/AuthLayout/AuthLayout";

import {
  Link,
  useNavigate
} from "react-router-dom";

import { useAuth } from "../../context/useAuth";
import { toast } from "react-toastify";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = () => {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const validate = () => {
    const next = {}
    if (!email.trim()) next.email = "Email is required"
    else if (!EMAIL_REGEX.test(email.trim())) next.email = "Enter a valid email address"
    if (!password) next.password = "Password is required"
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    try {
      setLoading(true)
      setErrors({})
      await login({ email: email.trim(), password })
      toast.success("Welcome back")
      navigate('/dashboard')
    } catch (error) {
      const message = error.response?.data?.message || "We couldn't sign you in. Please try again."
      setErrors({ form: message })
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (

    <AuthLayout>

      <motion.div
        className={styles.loginCard}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
      >

        <div className={styles.logoSection}>
          <span className={styles.eyebrow}>Your work, in good hands</span>
          <h1>Welcome back.</h1>
          <p>Sign in and pick up right where you left off.</p>
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
            label="Email address"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            icon={FiMail}
          />

          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            icon={FiLock}
          />

          <Button
            type="submit"
            disabled={loading}
            fullWidth
            icon={<FiArrowRight />}
          >
            {loading ? "Signing in…" : "Sign In"}
          </Button>
        </form>

        <div className={styles.bottomText}>
          New to Taskflow?
          <Link to="/register">Create an account</Link>
        </div>

      </motion.div>

    </AuthLayout>
  );
};

export default Login;
