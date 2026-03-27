const { validationResult } = require('express-validator');

/**
 * validate — Express middleware that reads express-validator results.
 * Must be placed AFTER the validator chain in the route array.
 * Returns 400 with the first validation error message if any exist.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors:  errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

module.exports = { validate };
