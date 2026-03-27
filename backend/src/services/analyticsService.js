const mongoose = require('mongoose');
const Workout  = require('../models/Workout');

/**
 * getUserAnalytics
 * Runs all analytics aggregations for a user in parallel.
 * Uses MongoDB $aggregate — never fetches-all-then-filters in JS.
 *
 * @param {string|ObjectId} userId
 * @returns {Object} Full analytics payload
 */
const getUserAnalytics = async (userId) => {
  const uid = typeof userId === 'string'
    ? new mongoose.Types.ObjectId(userId)
    : userId;

  // ── Date windows ─────────────────────────────────────────────────────────
  const now           = new Date();
  const sevenDaysAgo  = new Date(now); sevenDaysAgo.setDate(now.getDate() - 7);
  const thirtyDaysAgo = new Date(now); thirtyDaysAgo.setDate(now.getDate() - 30);

  // ── Run all aggregations in parallel for performance ─────────────────────
  const [
    totalsResult,
    byType,
    byIntensity,
    weeklyActivity,
    monthlyActivity,
    recentWorkouts,
    monthlyTrend,
  ] = await Promise.all([

    // 1. Overall totals + averages
    Workout.aggregate([
      { $match: { user: uid } },
      {
        $group: {
          _id:            null,
          totalWorkouts:  { $sum: 1 },
          totalCalories:  { $sum: '$calories' },
          totalDuration:  { $sum: '$duration' },
          avgCalories:    { $avg: '$calories' },
          avgDuration:    { $avg: '$duration' },
          maxCalories:    { $max: '$calories' },
          maxDuration:    { $max: '$duration' },
        },
      },
    ]),

    // 2. Workouts grouped by type
    Workout.aggregate([
      { $match: { user: uid } },
      {
        $group: {
          _id:           '$type',
          count:         { $sum: 1 },
          totalCalories: { $sum: '$calories' },
          totalDuration: { $sum: '$duration' },
          avgCalories:   { $avg: '$calories' },
        },
      },
      { $sort: { count: -1 } },
    ]),

    // 3. Workouts grouped by intensity
    Workout.aggregate([
      { $match: { user: uid } },
      {
        $group: {
          _id:   '$intensity',
          count: { $sum: 1 },
        },
      },
    ]),

    // 4. Daily breakdown — last 7 days
    Workout.aggregate([
      { $match: { user: uid, date: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id:      { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          count:    { $sum: 1 },
          calories: { $sum: '$calories' },
          duration: { $sum: '$duration' },
        },
      },
      { $sort: { _id: 1 } },
    ]),

    // 5. Daily breakdown — last 30 days
    Workout.aggregate([
      { $match: { user: uid, date: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id:      { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          count:    { $sum: 1 },
          calories: { $sum: '$calories' },
          duration: { $sum: '$duration' },
        },
      },
      { $sort: { _id: 1 } },
    ]),

    // 6. 5 most recent workouts (for dashboard preview)
    Workout.find({ user: uid })
      .sort({ date: -1 })
      .limit(5)
      .select('title type duration calories date intensity isFavorite')
      .lean(),

    // 7. Monthly workout count — last 6 months
    Workout.aggregate([
      {
        $match: {
          user: uid,
          date: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) },
        },
      },
      {
        $group: {
          _id:      { $dateToString: { format: '%Y-%m', date: '$date' } },
          count:    { $sum: 1 },
          calories: { $sum: '$calories' },
          duration: { $sum: '$duration' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  // ── Shape the totals ──────────────────────────────────────────────────────
  const raw = totalsResult[0] || {};
  const overview = {
    totalWorkouts:          raw.totalWorkouts           || 0,
    totalCalories:          Math.round(raw.totalCalories || 0),
    totalDuration:          Math.round(raw.totalDuration || 0),
    avgCaloriesPerWorkout:  Math.round(raw.avgCalories   || 0),
    avgDurationPerWorkout:  Math.round(raw.avgDuration   || 0),
    maxCaloriesInWorkout:   raw.maxCalories              || 0,
    maxDurationInWorkout:   raw.maxDuration              || 0,
  };

  return {
    overview,
    byType,
    byIntensity,
    weeklyActivity,
    monthlyActivity,
    monthlyTrend,
    recentWorkouts,
  };
};

module.exports = { getUserAnalytics };
