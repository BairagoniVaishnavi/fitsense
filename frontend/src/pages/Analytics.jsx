import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

import { getAnalytics } from '../api/analyticsApi'
import ActivityChart from '../components/charts/ActivityChart'
import TrendChart from '../components/charts/TrendChart'
import Card from '../components/common/Card'

export default function Analytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAnalytics()
        setData(res.data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="card">Loading analytics…</div>

  // ================= DERIVED INSIGHTS =================
  const avgDuration = data?.overview?.avgDurationPerWorkout ?? 0
  const avgCalories = data?.overview?.avgCaloriesPerWorkout ?? 0
  const streak = data?.streak?.longestStreak ?? 0

  return (
    <motion.div
      className="stack"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >

      {/* ================= INSIGHTS (NEW 🔥) ================= */}
      <section className="grid-2">
        <div className="insight">
           {streak > 3 
            ? "You're building a strong streak — keep it going!" 
            : "Start a streak — consistency is key!"}
        </div>

        <div className="insight">
          ⏱ Avg workout: {avgDuration} min
        </div>

        <div className="insight">
          ⚡ Avg calories burned: {avgCalories}
        </div>

        <div className="insight">
           Stay consistent to unlock more achievements
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="grid grid-4">
        <Card title="Avg calories" value={avgCalories} />
        <Card title="Avg duration" value={`${avgDuration} min`} />
        <Card title="Max calories" value={data?.overview?.maxCaloriesInWorkout ?? 0} />
        <Card title="Longest streak" value={`${streak} days`} />
      </section>

      {/* ================= CHARTS ================= */}
      <section className="grid two-col">
        <div className="card">
          <h3>Weekly Activity 📊</h3>
          <p className="muted">Your workout consistency this week</p>
          <ActivityChart data={data?.weeklyActivity || []} />
        </div>

        <div className="card">
          <h3>Monthly Trend 📈</h3>
          <p className="muted">Track your long-term progress</p>
          <TrendChart data={data?.monthlyTrend || []} />
        </div>
      </section>

      {/* ================= BADGES ================= */}
      <section className="card">
        <div className="card-head">
          <h3>🏆 Achievements</h3>
          <span className="muted">
            {data?.badges?.length || 0} unlocked
          </span>
        </div>

        <div className="badge-grid">
          {/* UNLOCKED */}
          {(data?.badges || []).map((badge) => (
            <motion.div
              key={badge.id}
              className="badge-card unlocked"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="badge-icon">🏆</div>

              <div>
                <h4>{badge.name}</h4>
                <p className="muted">{badge.description}</p>
              </div>
            </motion.div>
          ))}

          {/* LOCKED WITH FEELING */}
          <motion.div
            className="badge-card locked"
            whileHover={{ scale: 1.02 }}
          >
            <div className="badge-icon">🔒</div>
            <div>
              <h4>Consistency King</h4>
              <p className="muted">Workout 7 days in a row</p>
              <small className="muted">Progress: {streak}/7 days</small>
            </div>
          </motion.div>

          <motion.div
            className="badge-card locked"
            whileHover={{ scale: 1.02 }}
          >
            <div className="badge-icon">⚡</div>
            <div>
              <h4>Beast Mode</h4>
              <p className="muted">Burn 1000+ calories in one session</p>
              <small className="muted">Keep pushing </small>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  )
}
