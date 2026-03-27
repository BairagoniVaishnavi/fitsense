import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from "react-hot-toast"

import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user, updateProfile, changePassword } = useAuth()

  // ================= PROFILE STATE =================
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    fitnessGoal: user?.fitnessGoal || 'general_fitness',
    profilePicture: user?.profilePicture || '',
  })

  // ================= PASSWORD STATE =================
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
  })

  // ================= LOADING STATES =================
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

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
      toast.success("Profile updated successfully ✅")
    } catch {
      toast.error("Failed to update profile ❌")
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

      toast.success("Password changed 🔐")
    } catch {
      toast.error("Failed to change password ❌")
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <motion.div
      className="grid two-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* ================= PROFILE SECTION ================= */}
      <section className="card">
        <div className="card-head">
          <h3>Profile</h3>
          <span className="muted">Update your personal info</span>
        </div>

        <form className="form" onSubmit={saveProfile}>
          <label>
            Name
            <input
              name="name"
              value={profileForm.name}
              onChange={updateProfileField}
              placeholder="Enter your name"
            />
          </label>

          <label>
            Bio
            <textarea
              name="bio"
              value={profileForm.bio}
              onChange={updateProfileField}
              placeholder="Tell something about yourself"
            />
          </label>

          <label>
            Fitness Goal
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
          </label>

          <label>
            Profile Picture URL
            <input
              name="profilePicture"
              value={profileForm.profilePicture}
              onChange={updateProfileField}
              placeholder="Paste image URL"
            />
          </label>

          <motion.button
            className="btn primary"
            whileTap={{ scale: 0.95 }}
            disabled={profileLoading}
          >
            {profileLoading ? "Saving..." : "Save Profile"}
          </motion.button>
        </form>
      </section>

      {/* ================= PASSWORD SECTION ================= */}
      <section className="card">
        <div className="card-head">
          <h3>Security</h3>
          <span className="muted">Change your password</span>
        </div>

        <form className="form" onSubmit={savePassword}>
          <label>
            Current Password
            <input
              type="password"
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={updatePasswordField}
              placeholder="Enter current password"
            />
          </label>

          <label>
            New Password
            <input
              type="password"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={updatePasswordField}
              placeholder="Enter new password"
            />
          </label>

          <motion.button
            className="btn primary"
            whileTap={{ scale: 0.95 }}
            disabled={passwordLoading}
          >
            {passwordLoading ? "Updating..." : "Change Password"}
          </motion.button>
        </form>
      </section>
    </motion.div>
  )
}