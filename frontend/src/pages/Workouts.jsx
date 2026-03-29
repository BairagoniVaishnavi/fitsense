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
      const data = await getWorkouts()
      setWorkouts(data || [])
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

  return (
    <div className="grid" style={{ gap: "16px" }}>
      <h2>Recent Workouts 🏋️</h2>

      {loading ? (
        <p>Loading...</p>
      ) : workouts.length === 0 ? (
        <div className="card">
          <p>No workouts yet. Start your journey 💪</p>
        </div>
      ) : (
        workouts.map((w) => (
          <motion.div
            key={w._id}
            className="card"
            whileHover={{ scale: 1.02 }}
          >
            {/* TOP ROW */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3>{w.title}</h3>
                <p style={{ color: "#aaa", fontSize: "14px" }}>
                  {w.category} • {w.intensity}
                </p>
              </div>

              {/* DATE */}
              <div
                style={{
                  fontSize: "12px",
                  color: "#aaa",
                  background: "rgba(255,255,255,0.05)",
                  padding: "6px 10px",
                  borderRadius: "10px",
                }}
              >
                {formatDate(w.date)}
              </div>
            </div>

            {/* DETAILS */}
            <div
              style={{
                marginTop: "10px",
                display: "flex",
                gap: "12px",
                fontSize: "13px",
                color: "#ccc",
              }}
            >
              <span>⏱ {w.duration} min</span>
              <span>🔥 {w.calories} cal</span>
            </div>

            {/* ACTION BUTTONS */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "12px",
              }}
            >
              <button className="icon-btn">
                <FiEdit />
              </button>

              <button
                className="icon-btn"
                onClick={() => handleDelete(w._id)}
              >
                <FiTrash2 />
              </button>
            </div>
          </motion.div>
        ))
      )}
    </div>
  )
}
