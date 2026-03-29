import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <header className="navbar">
      {/* LEFT SIDE */}
      <div>
        <p className="eyebrow">Welcome back</p>
        <h2>{user?.name ? user.name : 'Dashboard'}</h2>
      </div>

      {/* RIGHT SIDE */}
      <div className="navbar-actions">
        {/* Avatar */}
        <div className="nav-avatar">
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>

        {/* Logout */}
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  )
}
