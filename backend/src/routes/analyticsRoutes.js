const express = require('express');
const router  = express.Router();

const {
  getAnalytics,
  getStreakInfo,
  getBadges,
  getOverview,
} = require('../controllers/analyticsController');

const { protect } = require('../middleware/authMiddleware');

// All analytics routes require authentication
router.use(protect);

router.get('/',        getAnalytics);   // GET /api/analytics          — full analytics
router.get('/overview',getOverview);    // GET /api/analytics/overview  — dashboard cards
router.get('/streak',  getStreakInfo);  // GET /api/analytics/streak    — streak only
router.get('/badges',  getBadges);      // GET /api/analytics/badges    — badges only

module.exports = router;
