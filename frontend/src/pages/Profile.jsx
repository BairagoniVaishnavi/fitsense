import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from "react-hot-toast"
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user, updateProfile, changePassword } = useAuth()

  // ================= PROFILE STATE =================
  const [profileForm, setProfileForm] = useState({
    name: '',
    bio: '',
    fitnessGoal: 'general_fitness',
    profilePicture: '',
  })

  // ================= PASSWORD STATE =================
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
  })

  // ================= LOADING STATES =================
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  // ================= FIX: SYNC USER DATA =================
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

  // ================= HANDLERS =================
  const updateProfileField = (e) => {
    setProfileForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const updatePasswordField = (e) => {
    setPasswordForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // ================= SAVE PROFILE =================
  const saveProfile = async (e) => {
    e.preventDefault()
    try {
      setProfileLoading(true)
      await updateProfile(profileForm)
      toast.success("Profile updated successfully ")
    } catch {
      toast.error("Failed to update profile ")
    } finally {
      setProfileLoading(false)
    }
  }

  // ================= CHANGE PASSWORD =================
  const savePassword = async (e) => {
    e.preventDefault()
    try {
      setPasswordLoading(true)
      await changePassword(passwordForm)

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
      })

      toast.success("Password changed ")
    } catch {
      toast.error("Failed to change password ")
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: "flex", flexDirection: "column", gap: "20px" }}
    >
      {/* ================= HERO PROFILE ================= */}
      <div className="card profile-hero">
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          
          <div className="avatar">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>

          <div>
            <h2>{user?.name}</h2>
            <p style={{ color: "#aaa" }}>
              {user?.fitnessGoal || "Fitness Journey"}
            </p>

            <div className="profile-stats">
              <span> {user?.totalWorkouts || 0} workouts</span>
              <span> {user?.totalDuration || 0} mins</span>
              <span> {user?.totalCalories || 0} cal</span>
            </div>
          </div>
        </div>

        <button className="icon-btn">✏️</button>
      </div>

      {/* ================= GOAL PROGRESS ================= */}
      <div className="card">
        <h3>Your Goal </h3>
        <p>{user?.fitnessGoal || "General Fitness"}</p>

        <div className="progress-bar">
          <div className="progress" style={{ width: "40%" }}></div>
        </div>

        <small style={{ color: "#aaa" }}>
          Keep pushing — you're doing great 
        </small>
      </div>

      {/* ================= MAIN GRID ================= */}
      <div className="grid-2">
        
        {/* PROFILE FORM */}
        <section className="card">
          <div className="card-head">
            <h3>Edit Profile</h3>
            <span className="muted">Update your personal info</span>
          </div>

          <form className="form" onSubmit={saveProfile}>
            <label>
              Name
              <input
                className="input"
                name="name"
                value={profileForm.name}
                onChange={updateProfileField}
              />
            </label>

            <label>
              Bio
              <textarea
                className="input"
                name="bio"
                value={profileForm.bio}
                onChange={updateProfileField}
              />
            </label>

            <label>
              Fitness Goal
              <select
                className="input"
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
            </label>

            <label>
              Profile Picture URL
              <input
                className="input"
                name="profilePicture"
                value={profileForm.profilePicture}
                onChange={updateProfileField}
              />
            </label>

            <motion.button
              className="primary-btn"
              whileTap={{ scale: 0.95 }}
              disabled={profileLoading}
            >
              {profileLoading ? "Saving..." : "Save Profile"}
            </motion.button>
          </form>
        </section>

        {/* PASSWORD SECTION */}
        <section className="card">
          <div className="card-head">
            <h3>Security</h3>
            <span className="muted">Change your password</span>
          </div>

          <form className="form" onSubmit={savePassword}>
            <label>
              Current Password
              <input
                className="input"
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={updatePasswordField}
              />
            </label>

            <label>
              New Password
              <input
                className="input"
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={updatePasswordField}
              />
            </label>

            <motion.button
              className="primary-btn"
              whileTap={{ scale: 0.95 }}
              disabled={passwordLoading}
            >
              {passwordLoading ? "Updating..." : "Change Password"}
            </motion.button>
          </form>
        </section>

      </div>
    </motion.div>
  )
}
