import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

import {
  FiHome,
  FiActivity,
  FiBarChart2,
  FiZap,
  FiUser,
} from 'react-icons/fi'

const links = [
  { to: '/', label: 'Dashboard', icon: <FiHome /> },
  { to: '/workouts', label: 'Workouts', icon: <FiActivity /> },
  { to: '/analytics', label: 'Analytics', icon: <FiBarChart2 /> },
  { to: '/suggestions', label: 'Suggestions', icon: <FiZap /> },
  { to: '/profile', label: 'Profile', icon: <FiUser /> },
]

// 🔥 Clean formatter
const formatText = (value = '') => {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function Sidebar() {
  const { user } = useAuth()

  return (
    <aside className="sidebar">
      {/* ================= TOP ================= */}
      <div>
        {/* BRAND */}
        <div className="brand">
          <div className="brand-mark">F</div>
          <div>
            <h1>FitSense</h1>
            <p className="muted small">Track. Improve. Repeat.</p>
          </div>
        </div>

        {/* ================= USER ================= */}
        <div className="sidebar-user">
          <div className="avatar">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>

          <div className="sidebar-user-text">
            <strong>{user?.name || 'User'}</strong>
            <span className="muted small">
              {formatText(user?.fitnessGoal || 'general_fitness')}
            </span>
          </div>
        </div>

        {/* ================= NAV ================= */}
        <nav className="side-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `side-link ${isActive ? 'active' : ''}`
              }
            >
              <span className="icon">{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* ================= FOOTER ================= */}
      <div className="sidebar-foot muted small">
        Built for real gains 💪
      </div>
    </aside>
  )
}
