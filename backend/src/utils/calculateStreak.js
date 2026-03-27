/**
 * calculateStreak — Pure function, no DB side-effects.
 *
 * Rules:
 *   diffDays === 0  → already worked out today, return unchanged
 *   diffDays === 1  → consecutive day, increment currentStreak
 *   diffDays  > 1  → streak broken, reset to 1
 *   no lastDate    → first-ever workout, set to 1
 *
 * @param {Object} streakDoc   - Mongoose Streak document (plain or Mongoose)
 * @param {Date}   workoutDate - The date of the workout being logged
 * @returns {{ currentStreak, longestStreak, lastWorkoutDate }}
 */
const calculateStreak = (streakDoc, workoutDate = new Date()) => {
  // Normalise both dates to midnight UTC to avoid time-of-day drift
  const toMidnight = (d) => {
    const copy = new Date(d);
    copy.setUTCHours(0, 0, 0, 0);
    return copy;
  };

  const today = toMidnight(workoutDate);

  // ── First-ever workout ──────────────────────────────────────────────────
  if (!streakDoc.lastWorkoutDate) {
    return {
      currentStreak:   1,
      longestStreak:   Math.max(1, streakDoc.longestStreak || 0),
      lastWorkoutDate: today,
    };
  }

  const lastDate = toMidnight(streakDoc.lastWorkoutDate);
  const diffMs   = today.getTime() - lastDate.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  // ── Same day — workout already counted ─────────────────────────────────
  if (diffDays === 0) {
    return {
      currentStreak:   streakDoc.currentStreak,
      longestStreak:   streakDoc.longestStreak,
      lastWorkoutDate: streakDoc.lastWorkoutDate,
    };
  }

  // ── Consecutive day — increment ─────────────────────────────────────────
  if (diffDays === 1) {
    const newStreak = (streakDoc.currentStreak || 0) + 1;
    return {
      currentStreak:   newStreak,
      longestStreak:   Math.max(newStreak, streakDoc.longestStreak || 0),
      lastWorkoutDate: today,
    };
  }

  // ── Streak broken (diffDays > 1) — reset ────────────────────────────────
  return {
    currentStreak:   1,
    longestStreak:   streakDoc.longestStreak || 1,
    lastWorkoutDate: today,
  };
};

module.exports = calculateStreak;
