import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

import { getOverview } from '../api/analyticsApi'
import { getWorkouts } from '../api/workoutApi'

// 🔥 FORMAT HELPER
const formatText = (value = '') => {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

// 🔥 DATE FORMAT
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
  })
}

export default function Dashboard() {
  const [overview, setOverview] = useState(null)
  const [recentWorkouts, setRecentWorkouts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [overviewRes, workoutsRes] = await Promise.all([
          getOverview(),
          getWorkouts({ limit: 5, sort: '-date' }),
        ])
        setOverview(overviewRes.data)
        setRecentWorkouts(workoutsRes.data || [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="card">Loading dashboard…</div>

  return (
    <motion.div
      className="stack"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >

      {/* ================= INSIGHTS (NEW 🔥) ================= */}
      <section className="grid-2">
        <div className="insight">
          🔥 You’ve completed {overview?.totalWorkouts ?? 0} workouts — keep going!
        </div>

        <div className="insight">
          ⚡ Current streak: {overview?.currentStreak ?? 0} days
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="grid-4">
        <div className="card stat-card">
          <p>Workouts</p>
          <h2>{overview?.totalWorkouts ?? 0}</h2>
        </div>

        <div className="card stat-card">
          <p>Calories</p>
          <h2>{overview?.totalCalories ?? 0}</h2>
        </div>

        <div className="card stat-card">
          <p>Duration</p>
          <h2>{overview?.totalDuration ?? 0} min</h2>
        </div>

        <div className="card stat-card">
          <p>Streak</p>
          <h2>{overview?.currentStreak ?? 0} days</h2>
        </div>
      </section>

      {/* ================= RECENT WORKOUTS ================= */}
      <section className="card">
        <div className="card-head">
          <h3>Recent Workouts</h3>
          <span className="muted">Your last 5 sessions</span>
        </div>

        {recentWorkouts.length === 0 ? (
          <p className="muted">No workouts yet. Start your grind 💪</p>
        ) : (
          <div className="recent-list">
            {recentWorkouts.map((w) => (
              <motion.div
                key={w._id}
                className="recent-card"
                whileHover={{ scale: 1.02 }}
              >
                {/* TOP */}
                <div className="recent-top">
                  <div>
                    <h4>{w.title}</h4>

                    <p className="muted">
                      {formatText(w.type)} • {formatText(w.intensity || 'medium')}
                    </p>
                  </div>

                  <div className="date-pill">
                    {formatDate(w.date)}
                  </div>
                </div>

                {/* META */}
                <div className="recent-meta">
                  <span>⏱ {w.duration} min</span>
                  <span>🔥 {w.calories} cal</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  )
}
