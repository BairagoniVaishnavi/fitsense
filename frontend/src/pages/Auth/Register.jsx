import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { motion } from "framer-motion"
import toast from "react-hot-toast"

const goals = [
  "weight_loss",
  "muscle_gain",
  "endurance",
  "flexibility",
  "general_fitness",
]

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    fitnessGoal: "general_fitness",
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
    if (!form.name.trim()) return "Name is required"
    if (form.name.length < 2) return "Name must be at least 2 characters"
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
      await register(form)

      toast.success("Account created 🎉")
      navigate("/")
    } catch (err) {
      const msg = err?.message || "Registration failed"
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
        <h1>Create Account ✨</h1>
        <p className="muted">Start your fitness journey today.</p>

        <form className="form" onSubmit={onSubmit}>
          <label>
            Name
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={onChange}
            />
          </label>

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

          <label>
            Fitness goal
            <select
              name="fitnessGoal"
              value={form.fitnessGoal}
              onChange={onChange}
            >
              {goals.map((goal) => (
                <option key={goal} value={goal}>
                  {goal.replace("_", " ")}
                </option>
              ))}
            </select>
          </label>

          {error && <div className="alert">{error}</div>}

          <button className="btn primary" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="muted">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </motion.div>
    </div>
  )
}
