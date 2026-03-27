import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import { getSuggestion } from "../api/suggestionApi";

export default function Suggestions() {
  const [form, setForm] = useState({
    mood: "neutral",
    energy: 3,
    availableTime: 30,
    soreness: "none",
  });

  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuggestion(null);

    try {
      const res = await getSuggestion(form);

      // simulate thinking delay (feels AI-like)
      setTimeout(() => {
        setSuggestion(res.data);
        setLoading(false);
        toast.success("Plan generated ✨");
      }, 800);

    } catch {
      toast.error("Failed to generate suggestion");
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="grid two-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* LEFT: FORM */}
      <section className="card">
        <div className="card-head">
          <h3>AI Workout Generator</h3>
          <span className="muted">Smart suggestions based on your state</span>
        </div>

        <form className="form" onSubmit={onSubmit}>
          <label>
            Mood
            <select name="mood" value={form.mood} onChange={onChange}>
              <option value="energetic">energetic</option>
              <option value="motivated">motivated</option>
              <option value="neutral">neutral</option>
              <option value="tired">tired</option>
              <option value="stressed">stressed</option>
            </select>
          </label>

          <label>
            Energy (1–5)
            <input
              type="number"
              min="1"
              max="5"
              name="energy"
              value={form.energy}
              onChange={onChange}
            />
          </label>

          <label>
            Time available (min)
            <input
              type="number"
              min="5"
              max="180"
              name="availableTime"
              value={form.availableTime}
              onChange={onChange}
            />
          </label>

          <label>
            Soreness
            <select name="soreness" value={form.soreness} onChange={onChange}>
              <option value="none">none</option>
              <option value="mild">mild</option>
              <option value="moderate">moderate</option>
              <option value="severe">severe</option>
            </select>
          </label>

          <button className="btn primary" disabled={loading}>
            {loading ? "Thinking..." : "Generate Plan"}
          </button>
        </form>
      </section>

      {/* RIGHT: RESULT */}
      <section className="card">
        <div className="card-head">
          <h3>Generated Plan</h3>
        </div>

        <AnimatePresence mode="wait">
          {/* LOADING STATE */}
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="center-screen"
            >
              <div>
                <div className="spinner"></div>
                <p className="muted" style={{ marginTop: 10 }}>
                  Analyzing your condition...
                </p>
              </div>
            </motion.div>
          )}

          {/* RESULT */}
          {!loading && suggestion && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="suggestion-box"
            >
              <h4>{suggestion.title || "Workout Plan"}</h4>

              <p className="muted">
                {suggestion.description || "Stay consistent 💪"}
              </p>

              {suggestion.exercises && (
                <div className="chip-row">
                  {suggestion.exercises.map((ex, i) => (
                    <span key={i} className="chip">
                      {typeof ex === "string" ? ex : ex.name}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* EMPTY STATE */}
          {!loading && !suggestion && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="center-screen"
            >
              <p className="muted">
                Fill the form to generate your workout 🧠
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </motion.div>
  );
}