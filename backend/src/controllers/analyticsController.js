const { getUserAnalytics } = require('../services/analyticsService');
const { getStreak }        = require('../services/streakService');
const User                 = require('../models/User');

// ────────────────────────────────────────────────────────────────────────────
// @desc    Get full analytics for the logged-in user
// @route   GET /api/analytics
// @access  Private
// ────────────────────────────────────────────────────────────────────────────
const getAnalytics = async (req, res, next) => {
  try {
    // Run analytics + streak + user badges in parallel
    const [analytics, streak, user] = await Promise.all([
      getUserAnalytics(req.user._id),
      getStreak(req.user._id),
      User.findById(req.user._id).select('badges totalWorkouts totalCalories totalDuration').lean(),
    ]);

    res.json({
      success: true,
      data: {
        ...analytics,
        streak: {
          currentStreak:   streak.currentStreak,
          longestStreak:   streak.longestStreak,
          lastWorkoutDate: streak.lastWorkoutDate,
          // Send last 30 history entries for chart use
          streakHistory:   (streak.streakHistory || []).slice(-30),
        },
        badges:        user.badges        || [],
        totalWorkouts: user.totalWorkouts || 0,
        totalCalories: user.totalCalories || 0,
        totalDuration: user.totalDuration || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @desc    Get streak info only (lightweight — for navbar/dashboard widget)
// @route   GET /api/analytics/streak
// @access  Private
// ────────────────────────────────────────────────────────────────────────────
const getStreakInfo = async (req, res, next) => {
  try {
    const streak = await getStreak(req.user._id);
    res.json({ success: true, data: streak });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @desc    Get badges only
// @route   GET /api/analytics/badges
// @access  Private
// ────────────────────────────────────────────────────────────────────────────
const getBadges = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('badges').lean();
    res.json({
      success: true,
      data:    user.badges || [],
      count:   (user.badges || []).length,
    });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @desc    Get overview stats only (for dashboard summary cards)
// @route   GET /api/analytics/overview
// @access  Private
// ────────────────────────────────────────────────────────────────────────────
const getOverview = async (req, res, next) => {
  try {
    const [user, streak] = await Promise.all([
      User.findById(req.user._id)
        .select('totalWorkouts totalCalories totalDuration badges')
        .lean(),
      getStreak(req.user._id),
    ]);

    res.json({
      success: true,
      data: {
        totalWorkouts:  user.totalWorkouts || 0,
        totalCalories:  user.totalCalories || 0,
        totalDuration:  user.totalDuration || 0,
        badgeCount:     (user.badges || []).length,
        currentStreak:  streak.currentStreak,
        longestStreak:  streak.longestStreak,
        lastWorkoutDate:streak.lastWorkoutDate,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAnalytics, getStreakInfo, getBadges, getOverview };
