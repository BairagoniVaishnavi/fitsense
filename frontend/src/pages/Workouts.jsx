import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { FiEdit, FiTrash2 } from "react-icons/fi"
import toast from "react-hot-toast"

import { getWorkouts, deleteWorkout } from "../api/workoutApi"

export default function Workouts() {
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)

  // ================= FETCH WORKOUTS =================
  const fetchWorkouts = async () => {
    try {
      setLoading(true)
      const res = await getWorkouts()

      // ✅ FIX: handle API response properly
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
      <div className="card-head">
        <h2>🏋️ Your Workouts</h2>
        <span className="muted">{workouts.length} sessions</span>
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
              {/* TOP */}
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

              {/* META */}
              <div className="recent-meta">
                <span> {w.duration} min</span>
                <span> {w.calories} cal</span>
              </div>

              {/* ACTIONS */}
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
    </motion.div>
  )
}
