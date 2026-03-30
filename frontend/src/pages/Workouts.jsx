import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi"
import toast from "react-hot-toast"

import {
  getWorkouts,
  deleteWorkout,
  createWorkout
} from "../api/workoutApi"

export default function Workouts() {
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)

  // 🔥 MODAL STATE
  const [showModal, setShowModal] = useState(false)

  // 🔥 FORM STATE
  const [form, setForm] = useState({
    title: "",
    category: "cardio",
    intensity: "medium",
    duration: "",
    calories: "",
  })

  // ================= FETCH WORKOUTS =================
  const fetchWorkouts = async () => {
    try {
      setLoading(true)
      const res = await getWorkouts()
      setWorkouts(res?.data || [])
    } catch {
      toast.error("Failed to load workouts ❌")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkouts()
  }, [])

  // ================= DELETE =================
  const handleDelete = async (id) => {
    try {
      await deleteWorkout(id)
      toast.success("Workout deleted 🗑️")
      fetchWorkouts()
    } catch {
      toast.error("Failed to delete ❌")
    }
  }

  // ================= ADD WORKOUT =================
  const handleAddWorkout = async () => {
    try {
      if (!form.title || !form.duration || !form.calories) {
        return toast.error("Please fill all fields ⚠️")
      }

      await createWorkout(form)

      toast.success("Workout added 💪")

      // reset form
      setForm({
        title: "",
        category: "cardio",
        intensity: "medium",
        duration: "",
        calories: "",
      })

      setShowModal(false)
      fetchWorkouts()
    } catch {
      toast.error("Failed to add workout ❌")
    }
  }

  // ================= DATE FORMAT =================
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  // ================= LOADING =================
  if (loading) {
    return <div className="card">Loading workouts...</div>
  }

  return (
    <motion.div
      className="stack"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >

      {/* 🔥 HEADER */}
      <div className="workout-header">
        <div>
          <h2>🏋️ Your Workouts</h2>
          <span className="muted">{workouts.length} sessions</span>
        </div>

        <button
          className="primary-btn"
          onClick={() => setShowModal(true)}
        >
          <FiPlus style={{ marginRight: "6px" }} />
          Add Workout
        </button>
      </div>

      {/* EMPTY STATE */}
      {workouts.length === 0 ? (
        <div className="card">
          <p className="muted">No workouts yet. Start your journey 💪</p>
        </div>
      ) : (
        <div className="grid-2">
          {workouts.map((w) => (
            <motion.div
              key={w._id}
              className="card workout-card"
              whileHover={{ scale: 1.02 }}
            >
              <div className="recent-top">
                <div>
                  <h3>{w.title}</h3>
                  <p className="muted">
                    {w.category} • {w.intensity}
                  </p>
                </div>

                <div className="date-pill">
                  {formatDate(w.date)}
                </div>
              </div>

              <div className="recent-meta">
                <span>⏱ {w.duration} min</span>
                <span>🔥 {w.calories} cal</span>
              </div>

              <div className="workout-actions">
                <button className="icon-btn">
                  <FiEdit />
                </button>

                <button
                  className="icon-btn danger"
                  onClick={() => handleDelete(w._id)}
                >
                  <FiTrash2 />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* 🔥 ADD WORKOUT MODAL */}
      {showModal && (
        <div className="modal">
          <div className="modal-box">

            <h3>Add Workout</h3>

            <input
              placeholder="Workout Title"
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
            />

            <input
              placeholder="Duration (minutes)"
              value={form.duration}
              onChange={(e) =>
                setForm({ ...form, duration: e.target.value })
              }
            />

            <input
              placeholder="Calories"
              value={form.calories}
              onChange={(e) =>
                setForm({ ...form, calories: e.target.value })
              }
            />

            <select
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value })
              }
            >
              <option value="cardio">Cardio</option>
              <option value="strength">Strength</option>
            </select>

            <select
              value={form.intensity}
              onChange={(e) =>
                setForm({ ...form, intensity: e.target.value })
              }
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <div className="modal-actions">
              <button
                className="primary-btn"
                onClick={handleAddWorkout}
              >
                Save
              </button>

              <button
                className="icon-btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

    </motion.div>
  )
}
