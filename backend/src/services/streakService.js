const Streak          = require('../models/Streak');
const calculateStreak = require('../utils/calculateStreak');

/**
 * updateStreak
 * Called every time a workout is successfully created.
 * Creates the streak doc if it does not exist yet.
 * Prevents double-counting workouts logged on the same day.
 *
 * @param {string|ObjectId} userId
 * @param {Date}            workoutDate
 * @returns {Streak} Updated (or unchanged) streak document
 */
const updateStreak = async (userId, workoutDate = new Date()) => {
  try {
    // findOneAndUpdate with upsert ensures atomic creation
    let streak = await Streak.findOne({ user: userId });

    if (!streak) {
      // First workout ever — bootstrap streak document
      const today = new Date(workoutDate);
      today.setUTCHours(0, 0, 0, 0);

      streak = await Streak.create({
        user:            userId,
        currentStreak:   1,
        longestStreak:   1,
        lastWorkoutDate: today,
        streakHistory:   [{ date: today, count: 1 }],
      });
      return streak;
    }

    // Calculate new streak values using pure function
    const updated = calculateStreak(streak, workoutDate);

    // Nothing changed (same-day duplicate) — return early
    if (
      updated.currentStreak   === streak.currentStreak &&
      updated.longestStreak   === streak.longestStreak &&
      String(updated.lastWorkoutDate) === String(streak.lastWorkoutDate)
    ) {
      return streak;
    }

    // Persist updated values
    streak.currentStreak   = updated.currentStreak;
    streak.longestStreak   = updated.longestStreak;
    streak.lastWorkoutDate = updated.lastWorkoutDate;

    // Append to history only for new calendar days
    const newDate  = new Date(updated.lastWorkoutDate);
    newDate.setUTCHours(0, 0, 0, 0);
    const lastEntry = streak.streakHistory[streak.streakHistory.length - 1];
    const isNewDay  = !lastEntry ||
      new Date(lastEntry.date).toISOString().slice(0, 10) !== newDate.toISOString().slice(0, 10);

    if (isNewDay) {
      streak.streakHistory.push({ date: newDate, count: updated.currentStreak });
      // Keep last 365 entries to prevent unbounded growth
      if (streak.streakHistory.length > 365) {
        streak.streakHistory = streak.streakHistory.slice(-365);
      }
    }

    await streak.save();
    return streak;
  } catch (error) {
    console.error('streakService.updateStreak error:', error.message);
    throw error;
  }
};

/**
 * getStreak
 * Returns the streak document for a user.
 * Returns safe defaults if none exists yet.
 *
 * @param {string|ObjectId} userId
 * @returns {Object}
 */
const getStreak = async (userId) => {
  const streak = await Streak.findOne({ user: userId }).lean();
  if (!streak) {
    return {
      currentStreak:   0,
      longestStreak:   0,
      lastWorkoutDate: null,
      streakHistory:   [],
    };
  }
  return streak;
};

module.exports = { updateStreak, getStreak };
