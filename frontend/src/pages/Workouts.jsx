import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import toast from "react-hot-toast"

import {
  createWorkout,
  deleteWorkout,
  getWorkouts,
  toggleFavorite,
  updateWorkout,
} from "../api/workoutApi"

export default function Workouts() {
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")

  const [form, setForm] = useState({
    title: "",
    type: "cardio",
    duration: "",
    calories: "",
    intensity: "medium",
    date: "",
  })

  const [editingId, setEditingId] = useState(null)
  const [showModal, setShowModal] = useState(false)

  // ================= LOAD =================
  const load = async () => {
    try {
      setLoading(true)
      const res = await getWorkouts()
      setWorkouts(Array.isArray(res) ? res : [])
    } catch {
      toast.error("Failed to load workouts ❌")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  // ================= SEARCH =================
  const filtered = useMemo(() => {
    return workouts.filter((w) =>
      w.title?.toLowerCase().includes(search.toLowerCase())
    )
  }, [workouts, search])

  // ================= FORM =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const resetForm = () => {
    setForm({
      title: "",
      type: "cardio",
      duration: "",
      calories: "",
      intensity: "medium",
      date: "",
    })
    setEditingId(null)
  }

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault()

    const payload = {
      title: form.title.trim(),
      type: form.type,
      duration: Number(form.duration),
      calories: Number(form.calories),
      intensity: form.intensity,
      date: form.date ? new Date(form.date).toISOString() : new Date().toISOString(),
    }

    if (!payload.title || !payload.duration || !payload.calories) {
      return toast.error("Fill all required fields ⚠️")
    }

    try {
      if (editingId) {
        const updated = await updateWorkout(editingId, payload)

        setWorkouts((prev) =>
          prev.map((w) => (w._id === editingId ? updated : w))
        )

        toast.success("Updated ✏️")
      } else {
        const created = await createWorkout(payload)
        setWorkouts((prev) => [created, ...prev])
        toast.success("Workout added 💪")
      }

      resetForm()
      setShowModal(false)
    } catch (err) {
      console.log(err?.response?.data)
      toast.error(err?.response?.data?.message || "Failed ❌")
    }
  }

  // ================= DELETE =================
  const handleDelete = async (id) => {
    try {
      await deleteWorkout(id)
      setWorkouts((prev) => prev.filter((w) => w._id !== id))
      toast.success("Deleted 🗑️")
    } catch {
      toast.error("Delete failed ❌")
    }
  }

  // ================= FAVORITE =================
  const handleFavorite = async (id) => {
    try {
      const updated = await toggleFavorite(id)

      setWorkouts((prev) =>
        prev.map((w) => (w._id === id ? updated : w))
      )

      toast.success("Updated ❤️")
    } catch {
      toast.error("Failed ❌")
    }
  }

  // ================= EDIT =================
  const handleEdit = (w) => {
    setForm({
      title: w.title || "",
      type: w.type || "cardio",
      duration: w.duration || "",
      calories: w.calories || "",
      intensity: w.intensity || "medium",
      date: w.date ? w.date.slice(0, 10) : "",
    })
    setEditingId(w._id)
    setShowModal(true)
  }

  return (
    <motion.div className="stack">

      {/* HEADER */}
      <div className="workout-header">
        <h2>🏋️ Your Workouts</h2>

        <button className="primary-btn" onClick={() => setShowModal(true)}>
          + Add Workout
        </button>
      </div>

      {/* SEARCH */}
      <input
        placeholder="Search workouts..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* LIST */}
      {loading ? (
        <div className="card">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="card">No workouts yet 💪</div>
      ) : (
        <div className="grid-2">
          {filtered.map((w) => (
            <motion.div key={w._id} className="card workout-card">
              <h3>{w.title}</h3>

              <p className="muted">
                {w.type} • {w.intensity}
              </p>

              <div className="recent-meta">
                <span>⏱ {w.duration} min</span>
                <span>🔥 {w.calories} cal</span>
              </div>

              <div className="workout-actions">
                <button onClick={() => handleEdit(w)}>✏️</button>
                <button onClick={() => handleDelete(w._id)}>🗑</button>
                <button onClick={() => handleFavorite(w._id)}>
                  {w.isFavorite ? "❤️" : "🤍"}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="modal">
          <div className="modal-box">
            <h3>{editingId ? "Edit Workout" : "Add Workout"}</h3>

            <input name="title" value={form.title} onChange={handleChange} placeholder="Title" />

            <select name="type" value={form.type} onChange={handleChange}>
              <option value="cardio">Cardio</option>
              <option value="strength">Strength</option>
              <option value="yoga">Yoga</option>
            </select>

            <input name="duration" value={form.duration} onChange={handleChange} placeholder="Duration" />
            <input name="calories" value={form.calories} onChange={handleChange} placeholder="Calories" />

            <button className="primary-btn" onClick={handleSubmit}>
              Save
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}
