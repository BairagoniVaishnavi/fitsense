import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { motion } from "framer-motion"
import toast from "react-hot-toast"

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState({
    email: "",
    password: "",
  })

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const onChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const validate = () => {
    if (!form.email.trim()) return "Email is required"
    if (!form.email.includes("@")) return "Enter a valid email"
    if (!form.password) return "Password is required"
    if (form.password.length < 6) return "Password must be at least 6 characters"
    return null
  }

  const onSubmit = async (e) => {
    e.preventDefault()

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return toast.error(validationError)
    }

    setError("")
    setLoading(true)

    try {
      await login(form)

      toast.success("Welcome back ")
      navigate("/")
    } catch (err) {
      const msg = err?.message || "Login failed"
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <motion.div
        className="auth-panel"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="eyebrow">FitSense</p>
        <h1>Welcome Back </h1>
        <p className="muted">Let’s get you moving again.</p>

        <form className="form" onSubmit={onSubmit}>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
            />
          </label>

          {error && <div className="alert">{error}</div>}

          <button className="btn primary" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="muted">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </motion.div>
    </div>
  )
}
