/**
 * FitSense Badge System
 *
 * BADGES: array of badge definitions, each with:
 *   id          - unique string key
 *   name        - display name
 *   description - what the user did to earn it
 *   icon        - emoji
 *   category    - 'workout' | 'calories' | 'duration' | 'streak' | 'combined'
 *   condition   - function(stats) → boolean
 *
 * checkNewBadges(stats, existingIds) → array of new badge objects to save
 */

const BADGES = [
  // ── WORKOUT COUNT ──────────────────────────────────────────────────────
  {
    id:          'first_workout',
    name:        'First Step',
    description: 'Completed your very first workout!',
    icon:        '🏅',
    category:    'workout',
    condition:   (s) => s.totalWorkouts >= 1,
  },
  {
    id:          'workout_5',
    name:        'Getting Started',
    description: 'Completed 5 workouts.',
    icon:        '⭐',
    category:    'workout',
    condition:   (s) => s.totalWorkouts >= 5,
  },
  {
    id:          'workout_10',
    name:        'On a Roll',
    description: 'Completed 10 workouts. The habit is forming.',
    icon:        '🔥',
    category:    'workout',
    condition:   (s) => s.totalWorkouts >= 10,
  },
  {
    id:          'workout_25',
    name:        'Dedicated',
    description: 'Completed 25 workouts. Dedication defines you.',
    icon:        '💪',
    category:    'workout',
    condition:   (s) => s.totalWorkouts >= 25,
  },
  {
    id:          'workout_50',
    name:        'Fitness Warrior',
    description: '50 workouts completed. You are built different.',
    icon:        '🏆',
    category:    'workout',
    condition:   (s) => s.totalWorkouts >= 50,
  },
  {
    id:          'workout_100',
    name:        'Century Club',
    description: '100 workouts. Legendary status achieved.',
    icon:        '👑',
    category:    'workout',
    condition:   (s) => s.totalWorkouts >= 100,
  },

  // ── CALORIES ───────────────────────────────────────────────────────────
  {
    id:          'cal_1000',
    name:        'Calorie Crusher',
    description: 'Burned 1,000 total calories.',
    icon:        '🌡️',
    category:    'calories',
    condition:   (s) => s.totalCalories >= 1000,
  },
  {
    id:          'cal_5000',
    name:        'Furnace',
    description: 'Burned 5,000 total calories. You are a furnace.',
    icon:        '🔥',
    category:    'calories',
    condition:   (s) => s.totalCalories >= 5000,
  },
  {
    id:          'cal_10000',
    name:        'Inferno',
    description: '10,000 calories torched. Absolute inferno.',
    icon:        '💥',
    category:    'calories',
    condition:   (s) => s.totalCalories >= 10000,
  },

  // ── DURATION (MINUTES) ─────────────────────────────────────────────────
  {
    id:          'duration_60',
    name:        'Hour Power',
    description: 'Accumulated 60 minutes of exercise.',
    icon:        '⏱️',
    category:    'duration',
    condition:   (s) => s.totalDuration >= 60,
  },
  {
    id:          'duration_300',
    name:        'Time Invested',
    description: 'Accumulated 5 hours of total exercise.',
    icon:        '⏰',
    category:    'duration',
    condition:   (s) => s.totalDuration >= 300,
  },
  {
    id:          'duration_1000',
    name:        'Marathon Mind',
    description: 'Accumulated over 1,000 minutes of exercise.',
    icon:        '🎖️',
    category:    'duration',
    condition:   (s) => s.totalDuration >= 1000,
  },
  {
    id:          'duration_3000',
    name:        'Time Lord',
    description: '50 hours of total exercise. Time well spent.',
    icon:        '🕰️',
    category:    'duration',
    condition:   (s) => s.totalDuration >= 3000,
  },

  // ── STREAK ─────────────────────────────────────────────────────────────
  {
    id:          'streak_3',
    name:        'Consistent',
    description: '3-day workout streak. Consistency is everything.',
    icon:        '📅',
    category:    'streak',
    condition:   (s) => s.currentStreak >= 3,
  },
  {
    id:          'streak_7',
    name:        'Week Warrior',
    description: '7-day streak! A full week of commitment.',
    icon:        '🗓️',
    category:    'streak',
    condition:   (s) => s.currentStreak >= 7,
  },
  {
    id:          'streak_14',
    name:        'Two-Week Titan',
    description: '14-day streak. You are unstoppable.',
    icon:        '⚡',
    category:    'streak',
    condition:   (s) => s.currentStreak >= 14,
  },
  {
    id:          'streak_30',
    name:        'Iron Discipline',
    description: '30-day streak. Iron discipline. Incredible.',
    icon:        '🏔️',
    category:    'streak',
    condition:   (s) => s.currentStreak >= 30,
  },

  // ── COMBINED PERFORMANCE ───────────────────────────────────────────────
  {
    id:          'all_rounder',
    name:        'All Rounder',
    description: '10+ workouts, 3,000+ calories, and 300+ minutes.',
    icon:        '🌟',
    category:    'combined',
    condition:   (s) =>
      s.totalWorkouts >= 10 &&
      s.totalCalories >= 3000 &&
      s.totalDuration >= 300,
  },
  {
    id:          'elite',
    name:        'Elite Athlete',
    description: '50+ workouts, 15,000+ calories, 1,500+ minutes.',
    icon:        '🦅',
    category:    'combined',
    condition:   (s) =>
      s.totalWorkouts >= 50 &&
      s.totalCalories >= 15000 &&
      s.totalDuration >= 1500,
  },
];

/**
 * Compare current user stats against all badge conditions.
 * Returns only NEW badges (not already earned).
 *
 * @param {Object} stats            - { totalWorkouts, totalCalories, totalDuration, currentStreak }
 * @param {string[]} existingBadgeIds - Array of badge ids the user already has
 * @returns {Object[]}              - Array of new badge objects ready to push into user.badges
 */
const checkNewBadges = (stats, existingBadgeIds = []) => {
  const earned = new Set(existingBadgeIds);
  const newBadges = [];

  for (const badge of BADGES) {
    if (!earned.has(badge.id) && badge.condition(stats)) {
      newBadges.push({
        id:          badge.id,
        name:        badge.name,
        description: badge.description,
        icon:        badge.icon,
        earnedAt:    new Date(),
      });
    }
  }

  return newBadges;
};

module.exports = { BADGES, checkNewBadges };
