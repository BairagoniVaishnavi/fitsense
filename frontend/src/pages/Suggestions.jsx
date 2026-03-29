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

  // 🔥 PRESET HANDLER
  const applyPreset = (preset) => {
    if (preset === "energy") {
      setForm({ mood: "energetic", energy: 5, availableTime: 45, soreness: "none" });
    } else if (preset === "recovery") {
      setForm({ mood: "tired", energy: 2, availableTime: 20, soreness: "moderate" });
    } else if (preset === "fatburn") {
      setForm({ mood: "motivated", energy: 4, availableTime: 30, soreness: "mild" });
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuggestion(null);

    try {
      const res = await getSuggestion(form);

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
      {/* ================= LEFT: FORM ================= */}
      <section className="card">
        <div className="card-head">
          <h3>🤖 AI Workout Generator</h3>
          <span className="muted">
            Tell us how you feel — we’ll build your workout
          </span>
        </div>

        {/* 🔥 PRESETS */}
        <div className="preset-row">
          <button onClick={() => applyPreset("energy")}>💪 High Energy</button>
          <button onClick={() => applyPreset("recovery")}>🧘 Recovery</button>
          <button onClick={() => applyPreset("fatburn")}>🔥 Fat Burn</button>
        </div>

        <form className="form-grid" onSubmit={onSubmit}>
          <div>
            <label>Mood</label>
            <select name="mood" value={form.mood} onChange={onChange} className="input">
              <option value="energetic">energetic</option>
              <option value="motivated">motivated</option>
              <option value="neutral">neutral</option>
              <option value="tired">tired</option>
              <option value="stressed">stressed</option>
            </select>
          </div>

          <div>
            <label>Energy (1–5)</label>
            <input
              type="number"
              min="1"
              max="5"
              name="energy"
              value={form.energy}
              onChange={onChange}
              className="input"
            />
          </div>

          <div>
            <label>Time (minutes)</label>
            <input
              type="number"
              min="5"
              max="180"
              name="availableTime"
              value={form.availableTime}
              onChange={onChange}
              className="input"
            />
          </div>

          <div>
            <label>Soreness</label>
            <select name="soreness" value={form.soreness} onChange={onChange} className="input">
              <option value="none">none</option>
              <option value="mild">mild</option>
              <option value="moderate">moderate</option>
              <option value="severe">severe</option>
            </select>
          </div>

          <button className="primary-btn" disabled={loading}>
            {loading ? "⚡ Generating..." : "⚡ Generate Workout"}
          </button>
        </form>
      </section>

      {/* ================= RIGHT: RESULT ================= */}
      <section className="card">
        <div className="card-head">
          <h3>Your Plan 🔥</h3>
        </div>

        <AnimatePresence mode="wait">

          {/* LOADING */}
          {loading && (
            <motion.div
              key="loading"
              className="center-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div>
                <div className="spinner"></div>
                <p className="muted" style={{ marginTop: 10 }}>
                  AI is building your workout...
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
              className="generated-plan"
            >
              <h4>{suggestion.title || "Workout Plan"}</h4>

              <p className="muted">
                {suggestion.description || "Stay consistent 💪"}
              </p>

              {suggestion.exercises && (
                <div style={{ marginTop: "12px" }}>
                  {suggestion.exercises.map((ex, i) => (
                    <div key={i} className="exercise">
                      <span>{typeof ex === "string" ? ex : ex.name}</span>
                      <span className="muted">3 sets</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* EMPTY */}
          {!loading && !suggestion && (
            <motion.div
              key="empty"
              className="center-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="muted">
                ⚡ Your AI workout will appear here
              </p>
            </motion.div>
          )}

        </AnimatePresence>
      </section>
    </motion.div>
  );
}
