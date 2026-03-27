/**
 * FitSense Rule-Based AI Workout Suggestion Engine
 *
 * Inputs:
 *   mood          - 'energetic' | 'motivated' | 'neutral' | 'tired' | 'stressed'
 *   energy        - 1 (very low) to 5 (peak)
 *   availableTime - minutes (5–180)
 *   soreness      - 'none' | 'mild' | 'moderate' | 'severe'
 *
 * Output: suggestion object with type, title, description,
 *         exercises[], estimatedCalories, intensity, reason, tips, duration
 */

// ── Suggestion library ──────────────────────────────────────────────────────
const WORKOUTS = {
  hiit: {
    type:               'hiit',
    title:              'HIIT Blast',
    description:        'Short, explosive intervals that maximise calorie burn and cardiovascular fitness.',
    exercises:          ['Burpees', 'Jump Squats', 'Mountain Climbers', 'High Knees', 'Box Jumps', 'Sprint Intervals'],
    estimatedCalories:  420,
    intensity:          'high',
    tips:               'Work 40s, rest 20s per exercise. Push to 85–90% max heart rate. Hydrate well before.',
  },
  strength: {
    type:               'strength',
    title:              'Strength Builder',
    description:        'Compound movements to build muscle mass and increase raw strength.',
    exercises:          ['Barbell Squats', 'Deadlifts', 'Bench Press', 'Pull-Ups', 'Overhead Press', 'Bent-Over Rows'],
    estimatedCalories:  320,
    intensity:          'high',
    tips:               'Focus on form — 3–4 sets of 6–8 reps. Progressive overload is key. Rest 90s between sets.',
  },
  cardio: {
    type:               'cardio',
    title:              'Steady-State Cardio',
    description:        'Moderate-intensity cardio to build aerobic base and burn fat efficiently.',
    exercises:          ['Jogging / Running', 'Jump Rope', 'Rowing Machine', 'Elliptical', 'Stair Climber'],
    estimatedCalories:  350,
    intensity:          'medium',
    tips:               'Maintain 60–70% max heart rate. Nasal breathing is a good pace check. Stay consistent.',
  },
  cycling: {
    type:               'cycling',
    title:              'Cycling Session',
    description:        'Low-impact cardio that builds leg endurance and aerobic capacity.',
    exercises:          ['Warm-Up Spin (5 min)', 'Moderate Pace Ride', 'Hill Simulation Intervals', 'Cool-Down Spin'],
    estimatedCalories:  310,
    intensity:          'medium',
    tips:               'Keep cadence above 80 RPM. Gradually increase resistance. Clip shoes in if possible.',
  },
  yoga: {
    type:               'yoga',
    title:              'Yoga & Mindfulness',
    description:        'Gentle yoga flow to calm the nervous system, reduce cortisol, and restore energy.',
    exercises:          ['Sun Salutation A', 'Warrior I & II', "Child's Pose", 'Cat-Cow Flow', 'Seated Forward Fold', 'Savasana'],
    estimatedCalories:  150,
    intensity:          'low',
    tips:               'Focus entirely on your breath. Hold each pose 30–60s. No need to push hard — softness is the goal.',
  },
  flexibility: {
    type:               'flexibility',
    title:              'Deep Stretch & Recovery',
    description:        'Full-body stretching to release muscle tension, improve range of motion, and speed recovery.',
    exercises:          ['Hip Flexor Stretch', 'Hamstring Hold', 'Pigeon Pose', 'Thoracic Spine Rotation', 'Shoulder Cross Stretch', "Child's Pose"],
    estimatedCalories:  100,
    intensity:          'low',
    tips:               'Never stretch to pain — only mild discomfort. Hold 20–30s per stretch. Breathe into the stretch.',
  },
  walk: {
    type:               'cardio',
    title:              'Active Recovery Walk',
    description:        'Light walking to keep you moving and blood flowing without stressing the body.',
    exercises:          ['Brisk Outdoor Walk', 'Incline Treadmill Walk', 'Light Nature Walk'],
    estimatedCalories:  180,
    intensity:          'low',
    tips:               'Keep it effortless — this is recovery, not training. Fresh air and movement is the whole point.',
  },
  swimming: {
    type:               'swimming',
    title:              'Swimming Session',
    description:        'Full-body, zero-impact cardio perfect for joint recovery and muscle endurance.',
    exercises:          ['Freestyle Warm-Up Laps', 'Backstroke', 'Breaststroke', 'Kick-Board Drills', 'Cool-Down Laps'],
    estimatedCalories:  400,
    intensity:          'medium',
    tips:               'Focus on technique first, speed second. Bilateral breathing builds a balanced stroke.',
  },
};

// ── Helper: clamp duration to available time ────────────────────────────────
const cap = (minutes, maxTime) => Math.min(minutes, maxTime);

// ── Main suggestion function ────────────────────────────────────────────────
/**
 * @param {string} mood
 * @param {number} energy        1–5
 * @param {number} availableTime minutes
 * @param {string} soreness
 * @returns {Object} suggestion
 */
const getWorkoutSuggestion = (mood, energy, availableTime, soreness) => {
  const time = availableTime || 30;

  // ── RULE 1: Severe soreness always overrides everything ─────────────────
  if (soreness === 'severe') {
    return {
      ...WORKOUTS.flexibility,
      duration: cap(25, time),
      reason:   'Severe muscle soreness detected. Your body is signalling it needs recovery — not more stress. Deep stretching will accelerate healing and reduce DOMS.',
    };
  }

  // ── RULE 2: Moderate soreness + low energy = yoga or walk ───────────────
  if (soreness === 'moderate' && energy <= 2) {
    return {
      ...WORKOUTS.yoga,
      duration: cap(30, time),
      reason:   'Moderate soreness with low energy is a clear recovery signal. Yoga reduces inflammation and restores the nervous system without adding fatigue.',
    };
  }

  // ── RULE 3: Tired mood or very low energy ───────────────────────────────
  if (mood === 'tired' || energy === 1) {
    if (soreness === 'moderate') {
      return {
        ...WORKOUTS.flexibility,
        duration: cap(20, time),
        reason:   'You are tired and sore. A short stretch session is the best investment you can make — it recovers today and prepares you for tomorrow.',
      };
    }
    return {
      ...WORKOUTS.walk,
      duration: cap(25, time),
      reason:   'Low energy detected. A light walk keeps momentum alive without depleting your already-limited energy reserves. Movement heals fatigue better than rest alone.',
    };
  }

  // ── RULE 4: Stressed mood → yoga regardless of energy ───────────────────
  if (mood === 'stressed') {
    return {
      ...WORKOUTS.yoga,
      duration: cap(40, time),
      reason:   'Stress elevates cortisol which impairs performance and recovery. Yoga and controlled breathing are clinically proven to reduce cortisol levels rapidly.',
    };
  }

  // ── RULE 5: Very limited time (< 20 mins) ───────────────────────────────
  if (time < 20) {
    if (energy >= 4) {
      return {
        ...WORKOUTS.hiit,
        duration: time,
        reason:   `Only ${time} minutes available but energy is high — HIIT gives maximum caloric burn and cardiovascular stimulus in minimum time. Nothing beats it for efficiency.`,
      };
    }
    return {
      ...WORKOUTS.flexibility,
      duration: time,
      reason:   `With only ${time} minutes and moderate energy, a focused stretch session is the highest-value activity you can do. Improves mobility and reduces injury risk.`,
    };
  }

  // ── RULE 6: High energy + energetic/motivated mood ──────────────────────
  if ((mood === 'energetic' || mood === 'motivated') && energy >= 4) {
    if (time >= 50 && soreness === 'none') {
      return {
        ...WORKOUTS.strength,
        duration: cap(60, time),
        reason:   'Peak energy, motivated mindset, no soreness, and ample time — this is the ideal window for a heavy strength session. Seize it.',
      };
    }
    if (time >= 30) {
      return {
        ...WORKOUTS.hiit,
        duration: cap(35, time),
        reason:   'High energy and motivation are the two ingredients HIIT demands most. This will produce your best performance and maximum calorie burn.',
      };
    }
    return {
      ...WORKOUTS.hiit,
      duration: time,
      reason:   'You are fired up — channel that into a short but intense HIIT session. Quality over quantity.',
    };
  }

  // ── RULE 7: Moderate energy + energetic/motivated (energy 3) ───────────
  if ((mood === 'energetic' || mood === 'motivated') && energy === 3) {
    if (time >= 40) {
      return {
        ...WORKOUTS.cardio,
        duration: cap(45, time),
        reason:   'Good motivation with moderate energy suits steady-state cardio. You will build aerobic fitness without overdrawing your energy reserves.',
      };
    }
    return {
      ...WORKOUTS.cycling,
      duration: cap(30, time),
      reason:   'A cycling session matches your energy level well — controlled intensity, good calorie burn, and easy to throttle up or down as you feel.',
    };
  }

  // ── RULE 8: Neutral mood, moderate-to-good energy ───────────────────────
  if (mood === 'neutral' && energy >= 3) {
    if (time >= 45 && energy === 5) {
      return {
        ...WORKOUTS.strength,
        duration: cap(55, time),
        reason:   'Neutral mood with peak energy is often when your best strength sessions happen — no emotional distraction, just focused execution.',
      };
    }
    if (time >= 40) {
      return {
        ...WORKOUTS.cycling,
        duration: cap(50, time),
        reason:   'A steady cycling session is perfect for a neutral-mood day. Rhythmic exercise naturally elevates mood and is easy to maintain over the full session.',
      };
    }
    return {
      ...WORKOUTS.cardio,
      duration: cap(30, time),
      reason:   'Moderate cardio is the reliable all-rounder. Suits any mood and energy level, and you will feel noticeably better afterwards.',
    };
  }

  // ── RULE 9: Low energy (2) but no soreness ──────────────────────────────
  if (energy === 2) {
    if (time >= 30) {
      return {
        ...WORKOUTS.yoga,
        duration: cap(35, time),
        reason:   'Low energy calls for low-intensity recovery. Yoga will leave you feeling more energised than when you started — the paradox of gentle movement.',
      };
    }
    return {
      ...WORKOUTS.walk,
      duration: cap(20, time),
      reason:   'A short walk is exactly right for low energy. It counts, it helps, and it will not deplete you further.',
    };
  }

  // ── RULE 10: Default fallback ────────────────────────────────────────────
  return {
    ...WORKOUTS.cardio,
    duration: cap(30, time),
    reason:   'A well-paced cardio session is a solid choice for any condition. It builds aerobic fitness, burns calories, and improves mood via endorphin release.',
  };
};

// ── Export both function and library (for testing) ──────────────────────────
module.exports = { getWorkoutSuggestion, WORKOUTS };
