import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi"
import toast from "react-hot-toast"

import {
  getWorkouts,
  deleteWorkout,
  createWorkout,
  updateWorkout,
} from "../api/workoutApi"

export default function Workouts() {
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)

  const [form, setForm] = useState({
    title: "",
    type: "cardio",
    intensity: "medium",
    duration: "",
    calories: "",
  })

  // ================= FETCH =================
  const fetchWorkouts = async () => {
    try {
      setLoading(true)
      const res = await getWorkouts()
      setWorkouts(Array.isArray(res) ? res : [])
    } catch (err) {
      console.error(err)
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
      setWorkouts((prev) => prev.filter((w) => w._id !== id))
      toast.success("Deleted 🗑️")
    } catch (err) {
      console.error(err)
      toast.error("Failed ❌")
    }
  }

  // ================= CLOSE MODAL =================
  const closeModal = () => {
    setShowModal(false)
    setEditId(null)
    setForm({
      title: "",
      type: "cardio",
      intensity: "medium",
      duration: "",
      calories: "",
    })
  }

  // ================= ADD / EDIT =================
  const handleSave = async () => {
    try {
      if (!form.title || !form.duration || !form.calories || !form.type) {
        return toast.error("All fields required ⚠️")
      }

      const payload = {
        title: form.title.trim(),
        type: form.type,
        intensity: form.intensity,
        duration: Number(form.duration),
        calories: Number(form.calories),
      }

      console.log("🚀 PAYLOAD:", payload)

      if (editId) {
        const updated = await updateWorkout(editId, payload)

        setWorkouts((prev) =>
          prev.map((w) => (w._id === editId ? updated : w))
        )

        toast.success("Updated ✏️")
      } else {
        const newWorkout = await createWorkout(payload)

        setWorkouts((prev) => [newWorkout, ...prev])

        toast.success("Workout added 💪")
      }

      closeModal()
    } catch (err) {
      console.error("❌ FULL ERROR:", err.response?.data || err.message)

      toast.error(
        err.response?.data?.message || "Failed to add workout ❌"
      )
    }
  }

  // ================= EDIT =================
  const openEdit = (w) => {
    setEditId(w._id)

    setForm({
      title: w.title || "",
      type: w.type || "cardio",
      intensity: w.intensity || "medium",
      duration: w.duration || "",
      calories: w.calories || "",
    })

    setShowModal(true)
  }

  if (loading) return <div className="card">Loading...</div>

  return (
    <motion.div className="stack" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

      {/* HEADER */}
      <div className="workout-header">
        <div>
          <h2>🏋️ Your Workouts</h2>
          <span className="muted">{workouts.length} sessions</span>
        </div>

        <button className="primary-btn" onClick={() => setShowModal(true)}>
          <FiPlus /> Add Workout
        </button>
      </div>

      {/* EMPTY */}
      {workouts.length === 0 ? (
        <div className="card">No workouts yet 💪</div>
      ) : (
        <div className="grid-2">
          {workouts.map((w) => (
            <motion.div
              key={w._id}
              className="card workout-card"
              whileHover={{ scale: 1.03 }}
            >
              <h3>{w.title}</h3>

              <p className="muted">
                {w.type} • {w.intensity}
              </p>

              <div className="recent-meta">
                <span>⏱ {w.duration} min</span>
                <span>🔥 {w.calories} cal</span>
              </div>

              <div className="workout-actions">
                <button className="icon-btn" onClick={() => openEdit(w)}>
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

      {/* MODAL */}
      {showModal && (
        <div className="modal">
          <motion.div
            className="modal-box"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h3>{editId ? "Edit Workout" : "Add Workout"}</h3>

            <input
              placeholder="Workout title"
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
            />

            {/* 🔥 TYPE IS NOW CLEAR + REQUIRED */}
            <select
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value })
              }
            >
              <option value="">Select Type</option>
              <option value="cardio">Cardio</option>
              <option value="strength">Strength</option>
              <option value="hiit">HIIT</option>
              <option value="yoga">Yoga</option>
              <option value="cycling">Cycling</option>
              <option value="sports">Sports</option>
            </select>

            <input
              placeholder="Duration (minutes)"
              value={form.duration}
              onChange={(e) =>
                setForm({ ...form, duration: e.target.value })
              }
            />

            <input
              placeholder="Calories burned"
              value={form.calories}
              onChange={(e) =>
                setForm({ ...form, calories: e.target.value })
              }
            />

            <div className="modal-actions">
              <button className="primary-btn" onClick={handleSave}>
                Save
              </button>

              <button className="icon-btn" onClick={closeModal}>
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
