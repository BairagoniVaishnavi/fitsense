const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name:   { type: String, trim: true },
  sets:   { type: Number, min: 0 },
  reps:   { type: Number, min: 0 },
  weight: { type: Number, min: 0 },  // kg
}, { _id: false });

const workoutSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'Workout must belong to a user'],
      index:    true,
    },
    title: {
      type:      String,
      required:  [true, 'Workout title is required'],
      trim:      true,
      minlength: [2,   'Title must be at least 2 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    type: {
      type:     String,
      required: [true, 'Workout type is required'],
      enum: {
        values:  ['cardio', 'strength', 'yoga', 'hiit', 'cycling', 'swimming', 'flexibility', 'sports', 'other'],
        message: '{VALUE} is not a valid workout type',
      },
    },
    duration: {
      type:     Number,
      required: [true, 'Duration is required'],
      min:      [1,    'Duration must be at least 1 minute'],
      max:      [600,  'Duration cannot exceed 600 minutes (10 hours)'],
    },
    calories: {
      type:     Number,
      required: [true, 'Calories is required'],
      min:      [0,    'Calories cannot be negative'],
      max:      [5000, 'Calories value seems too high'],
    },
    intensity: {
      type:    String,
      enum:    ['low', 'medium', 'high'],
      default: 'medium',
    },
    notes: {
      type:      String,
      trim:      true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default:   '',
    },
    isFavorite: { type: Boolean, default: false },

    // Optional exercise breakdown for strength workouts
    exercises: { type: [exerciseSchema], default: [] },

    // Allow backdating workouts
    date: {
      type:    Date,
      default: Date.now,
      index:   true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// ── Compound index for fast user-specific date-sorted queries ───────────────
workoutSchema.index({ user: 1, date: -1 });
workoutSchema.index({ user: 1, type: 1 });
workoutSchema.index({ user: 1, isFavorite: 1 });

// ── Virtual: formatted duration string ─────────────────────────────────────
workoutSchema.virtual('durationFormatted').get(function () {
  const h = Math.floor(this.duration / 60);
  const m = this.duration % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
});

module.exports = mongoose.model('Workout', workoutSchema);
