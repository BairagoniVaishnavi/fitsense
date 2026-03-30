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

  // modal + edit
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)

  const [form, setForm] = useState({
    title: "",
    category: "cardio",
    intensity: "medium",
    duration: "",
    calories: "",
  })

  // ================= FETCH =================
  const fetchWorkouts = async () => {
    try {
      setLoading(true)
      const res = await getWorkouts()
      setWorkouts(res || []) // ✅ FIXED
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
      setWorkouts((prev) => prev.filter((w) => w._id !== id))
      toast.success("Deleted 🗑️")
    } catch {
      toast.error("Failed ❌")
    }
  }

  // ================= ADD / EDIT =================
  const handleSave = async () => {
    try {
      if (!form.title || !form.duration || !form.calories) {
        return toast.error("Fill all fields ⚠️")
      }

      if (editId) {
        const updated = await updateWorkout(editId, form)
        setWorkouts((prev) =>
          prev.map((w) => (w._id === editId ? updated : w))
        )
        toast.success("Updated ✏️")
      } else {
        const newWorkout = await createWorkout(form)
        setWorkouts((prev) => [newWorkout, ...prev])
        toast.success("Added 💪")
      }

      setShowModal(false)
      setEditId(null)
      setForm({
        title: "",
        category: "cardio",
        intensity: "medium",
        duration: "",
        calories: "",
      })
    } catch {
      toast.error("Failed ❌")
    }
  }

  const openEdit = (w) => {
    setEditId(w._id)
    setForm(w)
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
            <motion.div key={w._id} className="card workout-card" whileHover={{ scale: 1.02 }}>
              <h3>{w.title}</h3>
              <p className="muted">{w.category} • {w.intensity}</p>

              <div className="recent-meta">
                <span>⏱ {w.duration} min</span>
                <span>🔥 {w.calories} cal</span>
              </div>

              <div className="workout-actions">
                <button className="icon-btn" onClick={() => openEdit(w)}>
                  <FiEdit />
                </button>

                <button className="icon-btn danger" onClick={() => handleDelete(w._id)}>
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
          <div className="modal-box">
            <h3>{editId ? "Edit Workout" : "Add Workout"}</h3>

            <input placeholder="Title" value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})}/>
            <input placeholder="Duration" value={form.duration} onChange={(e)=>setForm({...form,duration:e.target.value})}/>
            <input placeholder="Calories" value={form.calories} onChange={(e)=>setForm({...form,calories:e.target.value})}/>

            <div className="modal-actions">
              <button className="primary-btn" onClick={handleSave}>Save</button>
              <button className="icon-btn" onClick={()=>setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
