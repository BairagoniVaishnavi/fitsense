const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const badgeSchema = new mongoose.Schema({
  id:          { type: String, required: true },
  name:        { type: String, required: true },
  description: { type: String, required: true },
  icon:        { type: String, required: true },
  earnedAt:    { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type:      String,
      required:  [true, 'Name is required'],
      trim:      true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type:      String,
      required:  [true, 'Email is required'],
      unique:    true,
      lowercase: true,
      trim:      true,
      match:     [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type:      String,
      required:  [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select:    false,   // never returned in queries unless explicitly selected
    },
    profilePicture: { type: String, default: '' },
    bio: {
      type:      String,
      default:   '',
      maxlength: [200, 'Bio cannot exceed 200 characters'],
    },
    fitnessGoal: {
      type:    String,
      enum:    ['weight_loss', 'muscle_gain', 'endurance', 'flexibility', 'general_fitness'],
      default: 'general_fitness',
    },
    // Badges earned via gamification
    badges: { type: [badgeSchema], default: [] },

    // Running totals — updated on every workout create/delete/update
    totalWorkouts: { type: Number, default: 0, min: 0 },
    totalCalories: { type: Number, default: 0, min: 0 },
    totalDuration: { type: Number, default: 0, min: 0 },  // minutes
  },
  { timestamps: true }
);

// ── Hash password before save ───────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance method: compare plain password with stored hash ────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ── Remove sensitive fields from JSON output ────────────────────────────────
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
