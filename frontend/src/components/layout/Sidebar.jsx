import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// ✅ Icons
import {
  FiHome,
  FiActivity,
  FiBarChart2,
  FiZap,
  FiUser,
} from 'react-icons/fi'

// 🔥 Updated links with icons
const links = [
  { to: '/', label: 'Dashboard', icon: <FiHome /> },
  { to: '/workouts', label: 'Workouts', icon: <FiActivity /> },
  { to: '/analytics', label: 'Analytics', icon: <FiBarChart2 /> },
  { to: '/suggestions', label: 'Suggestions', icon: <FiZap /> },
  { to: '/profile', label: 'Profile', icon: <FiUser /> },
]

export default function Sidebar() {
  const { user } = useAuth()

  return (
    <aside className="sidebar">
      {/* ================= TOP SECTION ================= */}
      <div>
        {/* BRAND */}
        <div className="brand">
          <div className="brand-mark">F</div>
          <div>
            <h1>FitSense</h1>
            <p>Track. Improve. Repeat.</p>
          </div>
        </div>

        {/* USER */}
        <div className="sidebar-user">
          <div className="avatar">
            {user?.name?.slice(0, 1)?.toUpperCase() || 'U'}
          </div>

          <div>
            <strong>{user?.name || 'User'}</strong>
            <span>{user?.fitnessGoal || 'general_fitness'}</span>
          </div>
        </div>

        {/* NAVIGATION */}
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
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* ================= FOOTER ================= */}
      <div className="sidebar-foot">
        <span>Built for real gains 💪</span>
      </div>
    </aside>
  )
}