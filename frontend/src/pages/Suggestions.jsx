import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import toast from "react-hot-toast"

import { getSuggestion } from "../api/suggestionApi"

export default function Suggestions() {
  const [form, setForm] = useState({
    mood: "neutral",
    energy: 3,
    availableTime: 30,
    soreness: "none",
  })

  const [goal, setGoal] = useState("") // 🔥 NEW (for highlighting + backend)

  const [suggestion, setSuggestion] = useState(null)
  const [loading, setLoading] = useState(false)

  const onChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const applyPreset = (preset) => {
    setGoal(preset) // 🔥 sync highlight

    if (preset === "high") {
      setForm({
        mood: "energetic",
        energy: 5,
        availableTime: 45,
        soreness: "none",
      })
    } else if (preset === "recovery") {
      setForm({
        mood: "tired",
        energy: 2,
        availableTime: 20,
        soreness: "moderate",
      })
    } else {
      setForm({
        mood: "motivated",
        energy: 4,
        availableTime: 30,
        soreness: "mild",
      })
    }
  }

  // 🔥 FIXED SUBMIT
  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSuggestion(null)

    try {
      const res = await getSuggestion({
        ...form,
        goal, // 🔥 IMPORTANT
      })

      console.log("🔥 RAW RESPONSE:", res)

      const normalized =
        res?.data || res?.plan || res?.suggestion || res || null

      setTimeout(() => {
        setSuggestion(normalized)
        setLoading(false)
        toast.success("Plan generated ✨")
      }, 400)

    } catch (err) {
      console.error(err)
      toast.error("Failed ❌")
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="suggestions-layout"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >

      {/* LEFT SIDE */}
      <section className="card suggestion-card">
        <div className="card-head">
          <h3>🤖 AI Workout Generator</h3>
          <p className="muted">Tell us how you feel</p>
        </div>

        {/* 🔥 NEW PREMIUM BUTTONS */}
        <div className="preset-row flex gap-2 mb-3">

          <button
            onClick={() => applyPreset("high")}
            className={`goal-btn ${goal === "high" ? "goal-yellow" : ""}`}
          >
            ⚡ High Energy
          </button>

          <button
            onClick={() => applyPreset("recovery")}
            className={`goal-btn ${goal === "recovery" ? "goal-green" : ""}`}
          >
            🧘 Recovery
          </button>

          <button
            onClick={() => applyPreset("fatburn")}
            className={`goal-btn ${goal === "fatburn" ? "goal-red" : ""}`}
          >
            🔥 Fat Burn
          </button>

        </div>

        {/* FORM */}
        <form className="form-grid-2" onSubmit={onSubmit}>
          <div>
            <label>Mood</label>
            <select name="mood" value={form.mood} onChange={onChange}>
              <option>energetic</option>
              <option>motivated</option>
              <option>neutral</option>
              <option>tired</option>
              <option>stressed</option>
            </select>
          </div>

          <div>
            <label>Energy</label>
            <input
              type="number"
              name="energy"
              value={form.energy}
              onChange={onChange}
            />
          </div>

          <div>
            <label>Time (min)</label>
            <input
              name="availableTime"
              value={form.availableTime}
              onChange={onChange}
            />
          </div>

          <div>
            <label>Soreness</label>
            <select
              name="soreness"
              value={form.soreness}
              onChange={onChange}
            >
              <option>none</option>
              <option>mild</option>
              <option>moderate</option>
              <option>severe</option>
            </select>
          </div>

          <button className="primary-btn full" disabled={loading}>
            {loading ? "⚡ Generating..." : "⚡ Generate Workout"}
          </button>
        </form>
      </section>

      {/* RIGHT SIDE */}
      <section className="card result-card">
        <h3>Your Plan</h3>

        <AnimatePresence mode="wait">

          {/* LOADING */}
          {loading && (
            <motion.div
              key="loading"
              className="center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="spinner"></div>
              <p className="muted">Building your workout...</p>
            </motion.div>
          )}

          {/* RESULT */}
          {!loading && suggestion && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1 }}
            >
              <h4 className="plan-title">
                {suggestion?.title || "Workout Plan"}
              </h4>

              <p className="muted plan-desc">
                {suggestion?.description || "Stay consistent 💪"}
              </p>

              <div className="exercise-list">
                {(suggestion?.exercises || []).map((ex, i) => (
                  <div key={i} className="exercise-row">
                    <span>
                      {typeof ex === "string" ? ex : ex?.name || "Exercise"}
                    </span>
                    <span className="tag">3 sets</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* EMPTY */}
          {!loading && !suggestion && (
            <motion.div key="empty" className="center">
              <p className="muted">⚡ Your AI workout will appear here</p>
            </motion.div>
          )}

        </AnimatePresence>
      </section>

    </motion.div>
  )
}
