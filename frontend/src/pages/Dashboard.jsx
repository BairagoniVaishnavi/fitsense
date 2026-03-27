import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

import Card from '../components/common/Card'
import { getOverview } from '../api/analyticsApi'
import { getWorkouts } from '../api/workoutApi'

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
      <section className="grid grid-4">
        <Card title="Workouts" value={overview?.totalWorkouts ?? 0} />
        <Card title="Calories" value={overview?.totalCalories ?? 0} />
        <Card title="Duration" value={`${overview?.totalDuration ?? 0} min`} />
        <Card title="Streak" value={`${overview?.currentStreak ?? 0} days`} />
      </section>

      <section className="card">
        <div className="card-head">
          <h3>Recent workouts</h3>
        </div>

        <div className="table-wrap">
          <table>
            <tbody>
              {recentWorkouts.map((w) => (
                <motion.tr
                  key={w._id}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                >
                  <td>{w.title}</td>
                  <td>{w.type}</td>
                  <td>{w.duration} min</td>
                  <td>{w.calories}</td>
                  <td>{new Date(w.date).toLocaleDateString()}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </motion.div>
  )
}