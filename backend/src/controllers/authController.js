const { body }    = require('express-validator');
const User        = require('../models/User');
const Streak      = require('../models/Streak');
const generateToken = require('../utils/generateToken');
const { validate }  = require('../middleware/validateMiddleware');

// ── Helper: build the public user response object ───────────────────────────
const userResponse = (user, token) => ({
  _id:           user._id,
  name:          user.name,
  email:         user.email,
  bio:           user.bio,
  profilePicture:user.profilePicture,
  fitnessGoal:   user.fitnessGoal,
  badges:        user.badges,
  totalWorkouts: user.totalWorkouts,
  totalCalories: user.totalCalories,
  totalDuration: user.totalDuration,
  createdAt:     user.createdAt,
  ...(token && { token }),
});

// ────────────────────────────────────────────────────────────────────────────
// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
// ────────────────────────────────────────────────────────────────────────────
const register = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

  body('fitnessGoal')
    .optional()
    .isIn(['weight_loss', 'muscle_gain', 'endurance', 'flexibility', 'general_fitness'])
    .withMessage('Invalid fitness goal'),

  validate,

  async (req, res, next) => {
    try {
      const { name, email, password, fitnessGoal } = req.body;

      // Check duplicate email
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists',
        });
      }

      // Create user
      const user = await User.create({
        name,
        email,
        password,
        ...(fitnessGoal && { fitnessGoal }),
      });

      // Initialise streak record for new user
      await Streak.create({ user: user._id });

      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        message: 'Account created successfully! Welcome to FitSense.',
        data:    userResponse(user, token),
      });
    } catch (error) {
      next(error);
    }
  },
];

// ────────────────────────────────────────────────────────────────────────────
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
// ────────────────────────────────────────────────────────────────────────────
const login = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),

  validate,

  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      // Explicitly select password (field has select:false)
      const user = await User.findOne({ email }).select('+password');

      if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      const token = generateToken(user._id);

      res.json({
        success: true,
        message: 'Login successful',
        data:    userResponse(user, token),
      });
    } catch (error) {
      next(error);
    }
  },
];

// ────────────────────────────────────────────────────────────────────────────
// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
// ────────────────────────────────────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    // req.user is attached by authMiddleware.protect
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: userResponse(user) });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @desc    Update user profile (name, bio, fitnessGoal, profilePicture)
// @route   PUT /api/auth/profile
// @access  Private
// ────────────────────────────────────────────────────────────────────────────
const updateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),

  body('bio')
    .optional()
    .isLength({ max: 200 }).withMessage('Bio cannot exceed 200 characters'),

  body('fitnessGoal')
    .optional()
    .isIn(['weight_loss', 'muscle_gain', 'endurance', 'flexibility', 'general_fitness'])
    .withMessage('Invalid fitness goal'),

  body('profilePicture')
    .optional()
    .isURL().withMessage('Profile picture must be a valid URL'),

  validate,

  async (req, res, next) => {
    try {
      const allowedFields = ['name', 'bio', 'fitnessGoal', 'profilePicture'];
      const updates = {};
      allowedFields.forEach((f) => {
        if (req.body[f] !== undefined) updates[f] = req.body[f];
      });

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updates },
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data:    userResponse(user),
      });
    } catch (error) {
      next(error);
    }
  },
];

// ────────────────────────────────────────────────────────────────────────────
// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
// ────────────────────────────────────────────────────────────────────────────
const changePassword = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),

  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),

  body('newPassword')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    }),

  validate,

  async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;

      // Fetch with password (select:false)
      const user = await User.findById(req.user._id).select('+password');

      if (!(await user.matchPassword(currentPassword))) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect',
        });
      }

      user.password = newPassword;
      await user.save();  // triggers pre-save hash

      res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
      next(error);
    }
  },
];

module.exports = { register, login, getMe, updateProfile, changePassword };
