const { body }               = require('express-validator');
const { getWorkoutSuggestion } = require('../utils/workoutSuggestion');
const { validate }             = require('../middleware/validateMiddleware');

// ────────────────────────────────────────────────────────────────────────────
// @desc    Get a personalised AI workout suggestion
// @route   POST /api/suggestion
// @access  Private
//
// Body:
//   mood          - 'energetic' | 'motivated' | 'neutral' | 'tired' | 'stressed'
//   energy        - 1–5
//   availableTime - 5–180 (minutes)
//   soreness      - 'none' | 'mild' | 'moderate' | 'severe'
// ────────────────────────────────────────────────────────────────────────────
const getSuggestion = [
  body('mood')
    .notEmpty().withMessage('Mood is required')
    .isIn(['energetic', 'motivated', 'neutral', 'tired', 'stressed'])
    .withMessage('Mood must be one of: energetic, motivated, neutral, tired, stressed'),

  body('energy')
    .notEmpty().withMessage('Energy level is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Energy must be a number between 1 and 5'),

  body('availableTime')
    .notEmpty().withMessage('Available time is required')
    .isInt({ min: 5, max: 180 })
    .withMessage('Available time must be between 5 and 180 minutes'),

  body('soreness')
    .notEmpty().withMessage('Soreness level is required')
    .isIn(['none', 'mild', 'moderate', 'severe'])
    .withMessage('Soreness must be one of: none, mild, moderate, severe'),

  validate,

  async (req, res, next) => {
    try {
      const { mood, energy, availableTime, soreness } = req.body;

      const suggestion = getWorkoutSuggestion(
        mood,
        Number(energy),
        Number(availableTime),
        soreness
      );

      res.json({
        success: true,
        data: {
          ...suggestion,
          // Echo back the input for transparency / logging
          input: {
            mood,
            energy:        Number(energy),
            availableTime: Number(availableTime),
            soreness,
          },
          generatedAt: new Date(),
        },
      });
    } catch (error) {
      next(error);
    }
  },
];

// ────────────────────────────────────────────────────────────────────────────
// @desc    Get all possible workout types with their metadata (no body needed)
// @route   GET /api/suggestion/types
// @access  Private
// ────────────────────────────────────────────────────────────────────────────
const getSuggestionTypes = async (req, res, next) => {
  try {
    const { WORKOUTS } = require('../utils/workoutSuggestion');
    res.json({
      success: true,
      data:    Object.values(WORKOUTS),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSuggestion, getSuggestionTypes };
