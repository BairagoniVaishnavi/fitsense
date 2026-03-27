import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function ActivityChart({ data }) {
  // 🧠 If no data → show clean empty state
  if (!data || data.length === 0) {
    return (
      <div className="card">
        <h3>Weekly Activity</h3>
        <p className="muted">No activity data yet 📉</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-head">
        <h3>Weekly Activity</h3>
        <span className="muted">Last 7 days</span>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          
          {/* Grid lines */}
          <CartesianGrid stroke="rgba(255,255,255,0.05)" />

          {/* X Axis (date) */}
          <XAxis
            dataKey="_id"
            stroke="#94a3c7"
            fontSize={12}
          />

          {/* Y Axis */}
          <YAxis stroke="#94a3c7" fontSize={12} />

          {/* Tooltip on hover */}
          <Tooltip
            contentStyle={{
              background: "#0f1a2f",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
            }}
          />

          {/* Line */}
          <Line
            type="monotone"
            dataKey="count"
            stroke="#7c9cff"
            strokeWidth={3}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}