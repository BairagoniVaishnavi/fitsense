import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <header className="navbar">
      <div>
        <p className="eyebrow">Welcome back</p>
        <h2>{user?.name ? `${user.name}` : 'Dashboard'}</h2>
      </div>

      <div className="navbar-actions">
        <div className="pill">{user?.email}</div>
        <button className="ghost-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  )
}
