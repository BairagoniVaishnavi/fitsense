import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from "react-hot-toast"
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user, updateProfile, changePassword } = useAuth()

  const [profileForm, setProfileForm] = useState({
    name: '',
    bio: '',
    fitnessGoal: 'general_fitness',
    profilePicture: '',
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
  })

  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  // 🔥 Sync user data
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        bio: user.bio || '',
        fitnessGoal: user.fitnessGoal || 'general_fitness',
        profilePicture: user.profilePicture || '',
      })
    }
  }, [user])

  const updateProfileField = (e) => {
    setProfileForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const updatePasswordField = (e) => {
    setPasswordForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const saveProfile = async (e) => {
    e.preventDefault()
    try {
      setProfileLoading(true)
      await updateProfile(profileForm)
      toast.success("Profile updated ")
    } catch {
      toast.error("Update failed ")
    } finally {
      setProfileLoading(false)
    }
  }

  const savePassword = async (e) => {
    e.preventDefault()
    try {
      setPasswordLoading(true)
      await changePassword(passwordForm)

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
      })

      toast.success("Password updated ")
    } catch {
      toast.error("Failed ")
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <motion.div
      className="profile-wrap"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >

      {/* ================= HEADER ================= */}
      <div className="card profile-header">
        <div className="profile-left">
          <div className="profile-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>

          <div>
            <h2>{user?.name}</h2>
            <p className="muted">
              {user?.fitnessGoal?.replace('_', ' ') || "Fitness Journey"}
            </p>

            <div className="profile-stats">
              <span>{user?.totalWorkouts || 0} workouts</span>
              <span>{user?.totalDuration || 0} mins</span>
              <span>{user?.totalCalories || 0} cal</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MAIN GRID ================= */}
      <div className="profile-grid">

        {/* PROFILE FORM */}
        <section className="card">
          <div className="card-head">
            <h3>Edit Profile</h3>
            <span className="muted">Update your info</span>
          </div>

          <form className="form-grid" onSubmit={saveProfile}>
            <div>
              <label>Name</label>
              <input
                name="name"
                value={profileForm.name}
                onChange={updateProfileField}
              />
            </div>

            <div>
              <label>Fitness Goal</label>
              <select
                name="fitnessGoal"
                value={profileForm.fitnessGoal}
                onChange={updateProfileField}
              >
                <option value="weight_loss">Weight Loss</option>
                <option value="muscle_gain">Muscle Gain</option>
                <option value="endurance">Endurance</option>
                <option value="flexibility">Flexibility</option>
                <option value="general_fitness">General Fitness</option>
              </select>
            </div>

            <div className="full">
              <label>Bio</label>
              <textarea
                name="bio"
                value={profileForm.bio}
                onChange={updateProfileField}
              />
            </div>

            <div className="full">
              <label>Profile Picture URL</label>
              <input
                name="profilePicture"
                value={profileForm.profilePicture}
                onChange={updateProfileField}
              />
            </div>

            <button className="primary-btn full">
              {profileLoading ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </section>

        {/* PASSWORD */}
        <section className="card">
          <div className="card-head">
            <h3>Security</h3>
            <span className="muted">Change password</span>
          </div>

          <form className="form-grid" onSubmit={savePassword}>
            <div className="full">
              <label>Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={updatePasswordField}
              />
            </div>

            <div className="full">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={updatePasswordField}
              />
            </div>

            <button className="primary-btn full">
              {passwordLoading ? "Updating..." : "Change Password"}
            </button>
          </form>
        </section>

      </div>
    </motion.div>
  )
}
