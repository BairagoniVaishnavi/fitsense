import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function TrendChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="card">
        <h3>Monthly Trend</h3>
        <p className="muted">No trend data yet 📊</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-head">
        <h3>Monthly Trend</h3>
        <span className="muted">Last 6 months</span>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" />

          <XAxis dataKey="_id" stroke="#94a3c7" />
          <YAxis stroke="#94a3c7" />

          <Tooltip
            contentStyle={{
              background: "#0f1a2f",
              borderRadius: "12px",
            }}
          />

          <Bar dataKey="count" fill="#5b7dff" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}