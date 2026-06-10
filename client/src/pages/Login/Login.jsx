import styles from "./Login.module.scss";

import {
  FiMail,
  FiLock,
  FiArrowRight,
  FiLayers
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

import { useAuth }
from "../../context/AuthContext";

import { toast }
from "react-toastify";

const Login = () => {

  const [email, setEmail] =
    useState("")

  const [password, setPassword] =
    useState("")

  const [loading, setLoading] =
    useState(false)

  const { login } = useAuth()

  const navigate = useNavigate()

  const handleSubmit = async (e) => {

    e.preventDefault()

    // EMPTY VALIDATION

    if (!email || !password) {

      toast.error(
        "Please fill all fields"
      )

      return
    }

    // EMAIL VALIDATION

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (
      !emailRegex.test(email)
    ) {

      toast.error(
        "Invalid email format"
      )

      return
    }

    try {

      setLoading(true)

      await login({
        email,
        password
      })

      toast.success(
        'Login successful'
      )

      navigate('/dashboard')

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        'Invalid credentials'
      )

    } finally {

      setLoading(false)
    }
  }

  return (

    <AuthLayout>

      <motion.div
        className={styles.loginCard}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >

        <div className={styles.logoSection}>

          <div className={styles.logoIcon}>
            <FiLayers />
          </div>

          <h1>
            TaskFlow <span>Pro</span>
          </h1>

          <p>
            Welcome back,
            sign in to continue
          </p>

        </div>

        <form
          className={styles.form}
          onSubmit={handleSubmit}
        >

          <Input
            placeholder="Enter your email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            icon={FiMail}
          />

          <Input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            icon={FiLock}
          />

          <Button
            type="submit"
            icon={<FiArrowRight />}
          >

            {
              loading
                ? "Signing In..."
                : "Sign In"
            }

          </Button>

        </form>

        <div className={styles.bottomText}>

          Don’t have an account?

          <Link to="/register">
            Create one
          </Link>

        </div>

      </motion.div>

    </AuthLayout>
  );
};

export default Login;