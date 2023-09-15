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

router.put(
  '/:venueId',
  requireAuth,
  validateVenueUpdate,
  async(req,res) => {
    const {venueId} = req.params;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Bad Request', errors: errors.array() });
    }

    try {
      const venue = await Venue.findByPk(venueId, {
        include: [
          {
            model: Group,
            include: [
              {
                model: Membership,
                where: {
                  memberId: req.user.id,
                  status: 'co-host',
                },
                required: false, // This makes it an outer join
              },
            ],
          },
        ],
      });

      if (!venue) {
        return res.status(404).json({ message: "Venue couldn't be found" });
      }

      const { address, city, state, lat, lng } = req.body;

      // Check if the user is authorized to edit the venue
      const isOrganizer = venue.Group.organizerId === req.user.id;
      const isCoHost = venue.Group.Memberships.length > 0;

      if (!isOrganizer && !isCoHost) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      venue.address = address;
      venue.city = city;
      venue.state = state;
      venue.lat = lat;
      venue.lng = lng;

      await venue.save();

      return res.status(200).json(venue);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

module.exports = router;
