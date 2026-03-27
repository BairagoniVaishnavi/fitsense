const mongoose = require('mongoose');

const streakEntrySchema = new mongoose.Schema({
  date:  { type: Date,   required: true },
  count: { type: Number, required: true, min: 1 },
}, { _id: false });

const streakSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      unique:   true,   // one streak document per user
      index:    true,
    },
    currentStreak: {
      type:    Number,
      default: 0,
      min:     0,
    },
    longestStreak: {
      type:    Number,
      default: 0,
      min:     0,
    },
    lastWorkoutDate: {
      type:    Date,
      default: null,
    },
    // Rolling history — last 365 entries max
    streakHistory: {
      type:    [streakEntrySchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Streak', streakSchema);
