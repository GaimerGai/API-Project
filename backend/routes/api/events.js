const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { User, Group, Membership, Image, Venue, Event } = require('../../db/models');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const events = await Event.findAll({
      include: [
        {
          model: Group,
          attributes: ['id', 'name', 'city', 'state'],
        },
        {
          model: Venue,
          attributes: ['id', 'city', 'state'],
        },
      ],
    });

    const transformedEvents = await Promise.all(events.map(async (event) => {
      const group = event.Group;
      const venue = event.Venue;

      const numAttending = await Attendee.count({ where: { eventId: event.id } });

      const images = await Image.findAll({
        where: { imageableId: event.id, imageableType: 'Event', preview: true },
      });

      const previewImage = images.length > 0 ? images[0].url : null;

      return {
        id: event.id,
        groupId: event.groupId,
        venueId: event.venueId,
        name: event.name,
        type: event.type,
        startDate: event.startDate,
        endDate: event.endDate,
        numAttending: numAttending,
        previewImage: previewImage,
        Group: {
          id: group.id,
          name: group.name,
          city: group.city,
          state: group.state,
        },
        Venue: venue
          ? {
              id: venue.id,
              city: venue.city,
              state: venue.state,
            }
          : null,
      };
    }));

    res.status(200).json({ Events: transformedEvents });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



module.exports = router;
