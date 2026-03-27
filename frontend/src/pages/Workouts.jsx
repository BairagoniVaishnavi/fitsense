import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import {
  createWorkout,
  deleteWorkout,
  getWorkouts,
  toggleFavorite,
  updateWorkout,
} from "../api/workoutApi";

export default function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    title: "",
    type: "cardio",
    duration: "",
    calories: "",
    intensity: "medium",
    date: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // ================= LOAD =================
  const load = async () => {
    try {
      setLoading(true);
      const res = await getWorkouts();
      setWorkouts(res.data || []);
    } catch (err) {
      toast.error("Failed to load workouts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ================= SEARCH =================
  const filtered = useMemo(() => {
    return workouts.filter((w) =>
      w.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [workouts, search]);

  // ================= FORM =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      title: "",
      type: "cardio",
      duration: "",
      calories: "",
      intensity: "medium",
      date: "",
    });
    setEditingId(null);
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title: form.title.trim(),
      type: form.type.toLowerCase(),
      duration: Number(form.duration),
      calories: Number(form.calories),
      intensity: form.intensity,
      date: new Date(form.date).toISOString(),
    };

    // 🔥 VALIDATION
    if (
      !payload.title ||
      !payload.duration ||
      !payload.calories ||
      !form.date
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      if (editingId) {
        await updateWorkout(editingId, payload);
        toast.success("Workout updated ✅");
      } else {
        await createWorkout(payload);
        toast.success("Workout added 💪");
      }

      resetForm();
      setShowModal(false);
      load();
    } catch (err) {
      console.log(err?.response?.data);
      toast.error(err?.response?.data?.message || "Something went wrong");
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    try {
      await deleteWorkout(id);
      toast.error("Workout deleted 🗑️");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  // ================= FAVORITE =================
  const handleFavorite = async (id) => {
    try {
      await toggleFavorite(id);
      toast.success("Updated ❤️");
      load();
    } catch {
      toast.error("Failed to update");
    }
  };

  // ================= EDIT =================
  const handleEdit = (w) => {
    setForm({
      title: w.title || "",
      type: w.type || "cardio",
      duration: w.duration || "",
      calories: w.calories || "",
      intensity: w.intensity || "medium",
      date: w.date ? w.date.slice(0, 10) : "",
    });
    setEditingId(w._id);
    setShowModal(true);
  };

  return (
    <motion.div
      className="page-wrap"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* HEADER */}
      <div className="card">
        <h2>Workouts</h2>

        <div className="filters">
          <input
            placeholder="Search workouts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button className="btn primary" onClick={() => setShowModal(true)}>
            + Add Workout
          </button>
        </div>
      </div>

      {/* LIST */}
      {loading ? (
        <div className="card">Loading workouts… ⏳</div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <h3>No workouts yet 😔</h3>
          <p className="muted">Start by adding your first workout 💪</p>
        </div>
      ) : (
        <div className="grid two-col">
          {filtered.map((w) => (
            <motion.div
              key={w._id}
              className="card workout-card"
              whileHover={{ scale: 1.02 }}
            >
              <h3>{w.title}</h3>

              <div className="workout-meta">
                <span className="chip">{w.type}</span>
                <span className="chip">{w.duration} min</span>
                <span className="chip">{w.calories} cal</span>
              </div>

              <div className="action-row">
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
          <div className="modal-content">
            <h3>{editingId ? "Edit Workout" : "Add Workout"}</h3>

            <form className="form" onSubmit={handleSubmit}>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Title"
                required
              />

              {/* ✅ TYPE DROPDOWN */}
              <select name="type" value={form.type} onChange={handleChange}>
                <option value="cardio">cardio</option>
                <option value="strength">strength</option>
                <option value="yoga">yoga</option>
                <option value="cycling">cycling</option>
              </select>

              <input
                type="number"
                name="duration"
                value={form.duration}
                onChange={handleChange}
                placeholder="Duration (min)"
              />

              <input
                type="number"
                name="calories"
                value={form.calories}
                onChange={handleChange}
                placeholder="Calories"
              />

              {/* ✅ INTENSITY DROPDOWN */}
              <select
                name="intensity"
                value={form.intensity}
                onChange={handleChange}
              >
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
              </select>

              {/* ✅ DATE FIX */}
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
              />

              <button className="btn primary">
                {editingId ? "Update" : "Add"}
              </button>
            </form>

            <button
              className="btn"
              onClick={() => {
                resetForm();
                setShowModal(false);
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}