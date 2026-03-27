import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default function Layout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-column">
        <Navbar />
        <main className="page-wrap">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
