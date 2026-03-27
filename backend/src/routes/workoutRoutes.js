const express = require('express');
const router  = express.Router();

const {
  createWorkout,
  getWorkouts,
  getWorkout,
  updateWorkout,
  deleteWorkout,
  toggleFavorite,
} = require('../controllers/workoutController');

const { protect } = require('../middleware/authMiddleware');

// All workout routes require authentication
router.use(protect);

// Collection routes
router.route('/')
  .get(getWorkouts)     // GET  /api/workouts  — list with filters + pagination
  .post(createWorkout); // POST /api/workouts  — create new workout

// Single document routes
router.route('/:id')
  .get(getWorkout)      // GET    /api/workouts/:id
  .put(updateWorkout)   // PUT    /api/workouts/:id
  .delete(deleteWorkout); // DELETE /api/workouts/:id

// Toggle favourite (partial update)
router.patch('/:id/favorite', toggleFavorite); // PATCH /api/workouts/:id/favorite

module.exports = router;
