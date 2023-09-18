const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { User, Group, Membership, Image, Venue } = require('../../db/models');

const router = express.Router();
const validateVenueUpdate = [
  check('address')
    .notEmpty()
    .withMessage('Street address is required'),
  check('city')
    .notEmpty()
    .withMessage('City is required'),
  check('state')
    .notEmpty()
    .withMessage('State is required'),
  check('lat')
    .isNumeric()
    .isFloat()
    .withMessage('Latitude is not valid'),
  check('lng')
    .isNumeric()
    .isFloat()
    .withMessage('Longitude is not valid'),
];

//Edit a Venue specified by its id
router.put(
  '/:venueId',
  requireAuth,
  validateVenueUpdate,
  async (req, res) => {
    try {
      const { venueId } = req.params;
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        const errorResponse = {};
        errors.array().forEach((error) => {
          errorResponse[error.param] = error.msg;
        });
        console.log('Validation errors:', errorResponse); // Log validation errors
        return res.status(400).json({ message: 'Bad Request', errors: errorResponse });
      }

      const venue = await Venue.findByPk(venueId);

      await venue.save();

      return res.status(200).json(venue);
    } catch (error) {
      console.error('Error:', error); // Log any caught errors
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

module.exports = router;
