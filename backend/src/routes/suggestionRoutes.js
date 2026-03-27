const express = require('express');
const router  = express.Router();

const { getSuggestion, getSuggestionTypes } = require('../controllers/suggestionController');
const { protect } = require('../middleware/authMiddleware');

// All suggestion routes require authentication
router.use(protect);

router.post('/',       getSuggestion);      // POST /api/suggestion       — get personalised suggestion
router.get('/types',   getSuggestionTypes); // GET  /api/suggestion/types — list all workout types

module.exports = router;
