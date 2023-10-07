const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { User, Group, Membership, Image, Venue } = require('../../db/models');

const router = express.Router();
const validateVenue = [
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
    .isFloat()
    .withMessage('Latitude is not valid'),
  check('lng')
    .isFloat()
    .withMessage('Longitude is not valid'),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const validationErrors = {};
      errors.array().forEach(error => {
        validationErrors[error.param] = error.msg;
      });

      return res.status(400).json({
        message: 'Bad Request',
        errors: validationErrors
      });
    }

    next();
  },
  handleValidationErrors
];

//Edit a Venue specified by its id
router.put(
  '/:venueId',
  requireAuth,
  validateVenue,
  async (req, res) => {
    const { venueId } = req.params;
    const userId = req.user.id;
    // const errors = validationResult(req);

    // if (!errors.isEmpty()) {
    //   const errorResponse = {};
    //   errors.array().forEach((error) => {
    //     errorResponse[error.param] = error.msg;
    //   });
    //   console.log('Validation errors:', errorResponse); // Log validation errors
    //   return res.status(400).json({ message: 'Bad Request', errors: errorResponse });
    // }
    try {

      const venue = await Venue.findByPk(venueId);

      // Checks to see if Venue exists before saving
      if (!venue) {
        return res.status(404).json({ message: 'Venue couldn\'t be found' });
      }

      const findTheGroup = venue.groupId;

      const group = await Group.findByPk(findTheGroup)

      const isAuthorized =
        userId === group.organizerId ||
        // userId ===
        (await Membership.findOne({
          where: {
            groupId: group.id,
            memberId: req.user.id,
            status: 'co-host',
          },
        }));

      if (!isAuthorized) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      venue.address = req.body.address;
      venue.city = req.body.city;
      venue.state = req.body.state;
      venue.lat = req.body.lat;
      venue.lng = req.body.lng;

      await venue.save();

      const response = {
        id: venue.id,
        groupId: venue.groupId,
        address: venue.address,
        city: venue.city,
        state: venue.state,
        lat: venue.lat,
        lng: venue.lng,
      };

      return res.status(200).json(response);
    } catch (error) {
      console.error('Error:', error); // Log any caught errors
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

module.exports = router;
