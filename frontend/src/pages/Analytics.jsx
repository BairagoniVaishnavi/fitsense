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

  return (
    <motion.div
      className="stack"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* ================= STATS ================= */}
      <section className="grid grid-4">
        <Card title="Avg calories" value={data?.overview?.avgCaloriesPerWorkout ?? 0} />
        <Card title="Avg duration" value={`${data?.overview?.avgDurationPerWorkout ?? 0} min`} />
        <Card title="Max calories" value={data?.overview?.maxCaloriesInWorkout ?? 0} />
        <Card title="Longest streak" value={`${data?.streak?.longestStreak ?? 0} days`} />
      </section>

      {/* ================= CHARTS ================= */}
      <section className="grid two-col">
        <ActivityChart data={data?.weeklyActivity || []} />
        <TrendChart data={data?.monthlyTrend || []} />
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
          {/* 🔥 UNLOCKED BADGES */}
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

          {/* 🔒 LOCKED BADGES (STATIC FOR NOW) */}
          <motion.div
            className="badge-card locked"
            whileHover={{ scale: 1.02 }}
          >
            <div className="badge-icon">🔒</div>
            <div>
              <h4>Consistency King</h4>
              <p className="muted">Workout 7 days in a row</p>
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
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  )
}