const { body, query } = require('express-validator');
const mongoose        = require('mongoose');
const Workout         = require('../models/Workout');
const User            = require('../models/User');
const { validate }    = require('../middleware/validateMiddleware');
const { updateStreak }  = require('../services/streakService');
const { checkNewBadges } = require('../constants/badges');

// ── Validation chain reused by create + update ──────────────────────────────
const workoutValidators = {
  title: body('title')
    .trim()
    .notEmpty().withMessage('Workout title is required')
    .isLength({ min: 2, max: 100 }).withMessage('Title must be 2–100 characters'),

  type: body('type')
    .notEmpty().withMessage('Workout type is required')
    .isIn(['cardio', 'strength', 'yoga', 'hiit', 'cycling', 'swimming', 'flexibility', 'sports', 'other'])
    .withMessage('Invalid workout type'),

  duration: body('duration')
    .notEmpty().withMessage('Duration is required')
    .isInt({ min: 1, max: 600 }).withMessage('Duration must be 1–600 minutes'),

  calories: body('calories')
    .notEmpty().withMessage('Calories is required')
    .isInt({ min: 0, max: 5000 }).withMessage('Calories must be 0–5000'),

  intensity: body('intensity')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Intensity must be low, medium, or high'),

  notes: body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),

  date: body('date')
    .optional()
    .isISO8601().withMessage('Date must be a valid ISO date'),
};

// ────────────────────────────────────────────────────────────────────────────
// @desc    Create a new workout
// @route   POST /api/workouts
// @access  Private
//
// Workflow:
//   1. Validate input
//   2. Create Workout document
//   3. Increment user totals (totalWorkouts, totalCalories, totalDuration)
//   4. Update streak via streakService
//   5. Check for new badge unlocks
//   6. Save user
//   7. Return workout + streak summary + new badges
// ────────────────────────────────────────────────────────────────────────────
const createWorkout = [
  workoutValidators.title,
  workoutValidators.type,
  workoutValidators.duration,
  workoutValidators.calories,
  workoutValidators.intensity,
  workoutValidators.notes,
  workoutValidators.date,
  validate,

  async (req, res, next) => {
    try {
      const {
        title, type, duration, calories, intensity,
        notes, exercises, date,
      } = req.body;

      // 1. Create workout
      const workout = await Workout.create({
        user:      req.user._id,
        title,
        type,
        duration:  Number(duration),
        calories:  Number(calories),
        intensity: intensity || 'medium',
        notes:     notes || '',
        exercises: exercises || [],
        date:      date ? new Date(date) : new Date(),
      });

      // 2. Update user totals atomically
      const user = await User.findById(req.user._id);
      user.totalWorkouts += 1;
      user.totalCalories += Number(calories);
      user.totalDuration += Number(duration);

      // 3. Update streak
      const streak = await updateStreak(req.user._id, workout.date);

      // 4. Check badges
      const stats = {
        totalWorkouts: user.totalWorkouts,
        totalCalories: user.totalCalories,
        totalDuration: user.totalDuration,
        currentStreak: streak.currentStreak,
      };
      const existingIds = user.badges.map((b) => b.id);
      const newBadges   = checkNewBadges(stats, existingIds);

      if (newBadges.length > 0) {
        user.badges.push(...newBadges);
      }

      // 5. Save user (totals + badges together in one write)
      await user.save();

      res.status(201).json({
        success: true,
        message: 'Workout logged successfully!',
        data:    workout,
        streak: {
          currentStreak:   streak.currentStreak,
          longestStreak:   streak.longestStreak,
          lastWorkoutDate: streak.lastWorkoutDate,
        },
        newBadges,
      });
    } catch (error) {
      next(error);
    }
  },
];

// ────────────────────────────────────────────────────────────────────────────
// @desc    Get all workouts for logged-in user
// @route   GET /api/workouts
// @access  Private
//
// Query params: type, intensity, favorite, page, limit, sort
// ────────────────────────────────────────────────────────────────────────────
const getWorkouts = async (req, res, next) => {
  try {
    const {
      type,
      intensity,
      favorite,
      page  = 1,
      limit = 10,
      sort  = '-date',
    } = req.query;

    // Build filter — always scoped to the authenticated user
    const filter = { user: req.user._id };
    if (type)          filter.type      = type;
    if (intensity)     filter.intensity = intensity;
    if (favorite === 'true') filter.isFavorite = true;

    // Validate sort field to prevent injection
    const allowedSorts = ['-date', 'date', '-calories', 'calories', '-duration', 'duration'];
    const safeSort     = allowedSorts.includes(sort) ? sort : '-date';

    const pageNum  = Math.max(1, parseInt(page, 10)  || 1);
    const limitNum = Math.min(50, parseInt(limit, 10) || 10);
    const skip     = (pageNum - 1) * limitNum;

    const [workouts, total] = await Promise.all([
      Workout.find(filter)
        .sort(safeSort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Workout.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data:    workouts,
      pagination: {
        total,
        page:   pageNum,
        limit:  limitNum,
        pages:  Math.ceil(total / limitNum),
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @desc    Get a single workout by ID
// @route   GET /api/workouts/:id
// @access  Private
// ────────────────────────────────────────────────────────────────────────────
const getWorkout = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid workout ID' });
    }

    const workout = await Workout.findOne({
      _id:  req.params.id,
      user: req.user._id,   // ensures users can only see their own workouts
    });

    if (!workout) {
      return res.status(404).json({ success: false, message: 'Workout not found' });
    }

    res.json({ success: true, data: workout });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @desc    Update a workout
// @route   PUT /api/workouts/:id
// @access  Private
//
// Also adjusts user running totals based on the diff.
// ────────────────────────────────────────────────────────────────────────────
const updateWorkout = [
  body('title').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Title must be 2–100 characters'),
  body('type').optional().isIn(['cardio', 'strength', 'yoga', 'hiit', 'cycling', 'swimming', 'flexibility', 'sports', 'other']).withMessage('Invalid type'),
  body('duration').optional().isInt({ min: 1, max: 600 }).withMessage('Duration must be 1–600 minutes'),
  body('calories').optional().isInt({ min: 0, max: 5000 }).withMessage('Calories must be 0–5000'),
  body('intensity').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid intensity'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
  validate,

  async (req, res, next) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ success: false, message: 'Invalid workout ID' });
      }

      const workout = await Workout.findOne({ _id: req.params.id, user: req.user._id });
      if (!workout) {
        return res.status(404).json({ success: false, message: 'Workout not found' });
      }

      // Calculate diffs for running totals
      const oldCalories = workout.calories;
      const oldDuration = workout.duration;
      const newCalories = req.body.calories !== undefined ? Number(req.body.calories) : oldCalories;
      const newDuration = req.body.duration !== undefined ? Number(req.body.duration) : oldDuration;

      const calorieDiff = newCalories - oldCalories;
      const durationDiff = newDuration - oldDuration;

      // Update user totals if values changed
      if (calorieDiff !== 0 || durationDiff !== 0) {
        await User.findByIdAndUpdate(req.user._id, {
          $inc: {
            totalCalories: calorieDiff,
            totalDuration: durationDiff,
          },
        });
      }

      // Apply updates (only allow safe fields)
      const allowedFields = ['title', 'type', 'duration', 'calories', 'intensity', 'notes', 'exercises', 'date'];
      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) workout[field] = req.body[field];
      });

      const updatedWorkout = await workout.save();

      res.json({
        success: true,
        message: 'Workout updated successfully',
        data:    updatedWorkout,
      });
    } catch (error) {
      next(error);
    }
  },
];

// ────────────────────────────────────────────────────────────────────────────
// @desc    Delete a workout
// @route   DELETE /api/workouts/:id
// @access  Private
// ────────────────────────────────────────────────────────────────────────────
const deleteWorkout = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid workout ID' });
    }

    const workout = await Workout.findOne({ _id: req.params.id, user: req.user._id });
    if (!workout) {
      return res.status(404).json({ success: false, message: 'Workout not found' });
    }

    // Remove from DB
    await workout.deleteOne();

    // Decrement user running totals (floor at 0)
    const user = await User.findById(req.user._id);
    user.totalWorkouts = Math.max(0, user.totalWorkouts - 1);
    user.totalCalories = Math.max(0, user.totalCalories - workout.calories);
    user.totalDuration = Math.max(0, user.totalDuration - workout.duration);
    await user.save();

    res.json({ success: true, message: 'Workout deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @desc    Toggle isFavorite on a workout
// @route   PATCH /api/workouts/:id/favorite
// @access  Private
// ────────────────────────────────────────────────────────────────────────────
const toggleFavorite = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid workout ID' });
    }

    const workout = await Workout.findOne({ _id: req.params.id, user: req.user._id });
    if (!workout) {
      return res.status(404).json({ success: false, message: 'Workout not found' });
    }

    workout.isFavorite = !workout.isFavorite;
    await workout.save();

    res.json({
      success: true,
      message: workout.isFavorite ? 'Added to favourites' : 'Removed from favourites',
      data:    workout,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createWorkout,
  getWorkouts,
  getWorkout,
  updateWorkout,
  deleteWorkout,
  toggleFavorite,
};
