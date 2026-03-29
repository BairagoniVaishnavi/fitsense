import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

import Card from '../components/common/Card'
import { getOverview } from '../api/analyticsApi'
import { getWorkouts } from '../api/workoutApi'

//  Format helper (IMPORTANT)
const formatText = (value = '') => {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
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
      {/* ================= STATS ================= */}
      <section className="grid grid-4">
        <Card title="Workouts" value={overview?.totalWorkouts ?? 0} />
        <Card title="Calories" value={overview?.totalCalories ?? 0} />
        <Card title="Duration" value={`${overview?.totalDuration ?? 0} min`} />
        <Card title="Streak" value={`${overview?.currentStreak ?? 0} days`} />
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
                {/* TOP ROW */}
                <div className="recent-top">
                  <div>
                    <h4>{w.title}</h4>
                    <p className="muted">
                      {formatText(w.type)} • {formatText(w.intensity || 'medium')}
                    </p>
                  </div>

                  <span className="chip">
                    {new Date(w.date).toLocaleDateString()}
                  </span>
                </div>

                {/* BOTTOM META */}
                <div className="recent-meta">
                  <span> {w.duration} min</span>
                  <span> {w.calories} cal</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  )
}
