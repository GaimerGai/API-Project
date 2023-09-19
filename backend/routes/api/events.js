const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { User, Group, Membership, Image, Venue, Event, Attendee } = require('../../db/models');

const router = express.Router();

const validateEvent = [
  check('venueId')
    .isNumeric()
    .custom(async (value) => {
      // Check if the venue exists
      const venue = await Venue.findByPk(value);
      if (!venue) {
        return Promise.reject('Venue does not exist');
      }
    }),
  check('name')
    .isLength({ min: 5 })
    .withMessage('Name must be at least 5 characters'),
  check('type')
    .isIn(['Online', 'In Person'])
    .withMessage('Type must be Online or In person'),
  check('capacity').isInt().withMessage('Capacity must be an integer'),
  check('price').isFloat().withMessage('Price is invalid'),
  check('description').notEmpty().withMessage('Description is required'),
  check('startDate').custom((startDate, { req }) => {
    const { endDate } = req.body;
    const currentDate = new Date();

    // Check if the start date is in the past
    if (new Date(startDate) < currentDate) {
      throw new Error('Start date must be in the future');
    }

    // Check if the end date is less than the start date
    if (new Date(endDate) < new Date(startDate)) {
      throw new Error('End date must be greater than the start date');
    }

    return true;
  }),
];

router.get( //Get All Events with Query Filters
  '/',
  async (req, res) => {
    const { page = 1, size = 20, name, type, startDate } = req.query;

    try {
      // Validate query parameters
      const errors = {};

      if (page && (isNaN(page) || page < 1 || page > 10)) {
        errors.page = 'Page must be greater than or equal to 1';
      }

      if (size && (isNaN(size) || size < 1 || size > 20)) {
        errors.size = 'Size must be greater than or equal to 1';
      }

      if (type && !['Online', 'In Person'].includes(type)) {
        errors.type = "Type must be 'Online' or 'In Person'";
      }

      if (startDate && isNaN(Date.parse(startDate))) {
        errors.startDate = 'Start date must be a valid datetime';
      }

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({ message: 'Bad Request', errors });
      }

      // Build query options based on query parameters
      const options = {
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
        offset: (page - 1) * size,
        limit: size,
        where: {},
      };

      if (name) {
        options.where.name = name;
      }

      if (type) {
        options.where.type = type;
      }

      if (startDate) {
        options.where.startDate = {
          [Op.gte]: new Date(startDate),
        };
      }

      // Fetch events based on query options
      const events = await Event.findAll(options);

      // Transform and format the response
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

      return res.status(200).json({ Events: transformedEvents });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

router.get( //Get details of an Event specified by its id
  '/:eventId',
  async (req, res) => {
    const eventId = req.params.eventId;

    try {
      // Find the event by its ID
      const event = await Event.findByPk(eventId, {
        include: [
          {
            model: Group,
            attributes: ['id', 'name', 'private', 'city', 'state'],
          },
          {
            model: Venue,
            attributes: ['id', 'address', 'city', 'state', 'lat', 'lng'],
          },
          {
            model: Image,
            attributes: ['id', 'url', 'preview'],
            where: { imageableType: 'Event' },
          },
        ],
      });

      if (!event) {
        return res.status(404).json({ message: "Event couldn't be found" });
      }

      // Count the number of attendees for the event
      const numAttending = await Attendee.count({ where: { eventId } });

      // Format the response
      const formattedEvent = {
        id: event.id,
        groupId: event.groupId,
        venueId: event.venueId,
        name: event.name,
        description: event.description,
        type: event.type,
        capacity: event.capacity,
        price: event.price,
        startDate: event.startDate,
        endDate: event.endDate,
        numAttending: numAttending,
        Group: {
          id: event.Group.id,
          name: event.Group.name,
          private: event.Group.private,
          city: event.Group.city,
          state: event.Group.state,
        },
        Venue: {
          id: event.Venue.id,
          address: event.Venue.address,
          city: event.Venue.city,
          state: event.Venue.state,
          lat: event.Venue.lat,
          lng: event.Venue.lng,
        },
        EventImages: event.Images,
      };

      return res.status(200).json(formattedEvent);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

//Get all Attendees of an Event specified by its id
router.get(
  '/:eventId/attendees',
  requireAuth,
  async (req, res) => {
    const eventId = req.params.eventId;
    const userId = req.user.id;

    try {
      // Check if the event exists
      const event = await Event.findByPk(eventId);

      if (!event) {
        return res.status(404).json({ message: "Event couldn't be found" });
      }

      // Check if the attendance exists
      const attendee = await Attendee.findOne({
        where: { eventId, userId },
      });

      if (!attendee) {
        return res.status(404).json({ message: "Attendance between the user and the event does not exist" });
      }

      // Return the attendance information in the desired format
      const response = {
        Attendees: [
          {
            id: userId, // Assuming you want to include the user's ID
            firstName: req.user.firstName, // Get the user's first name from the authenticated user
            lastName: req.user.lastName, // Get the user's last name from the authenticated user
            Attendance: {
              status: attendee.status,
            },
          },
        ],
      };

      return res.status(200).json(response);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

router.post( //Request to Attend an Event based on the Event's id
  '/:eventId/attendance',
  requireAuth,
  async (req, res) => {
    const eventId = req.params.eventId;
    const userId = req.user.id;

    try {
      // Check if the event exists
      const event = await Event.findByPk(eventId);

      if (!event) {
        return res.status(404).json({ message: "Event couldn't be found" });
      }

      // Check if the user is already attending the event
      const existingAttendance = await Attendee.findOne({
        where: {
          eventId,
          userId,
        },
      });

      if (existingAttendance) {
        if (existingAttendance.status === 'pending') {
          return res.status(400).json({ message: 'Attendance has already been requested' });
        } else {
          return res.status(400).json({ message: 'User is already an attendee of the event' });
        }
      }

      // Check if the user is a member of the group associated with the event
      const isMember = await Membership.findOne({
        where: {
          groupId: event.groupId,
          memberId: userId,
        },
      });

      if (!isMember) {
        return res.status(403).json({ message: 'Forbidden. You are not a member of the group' });
      }

      // Create a new attendance request
      const newAttendance = await Attendee.create({
        eventId,
        userId,
        status: 'pending',
      });

      return res.status(200).json(newAttendance);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

router.put( //Change the status of an attendance for an event specified by id
  '/:eventId/attendance',
  requireAuth,
  async (req, res) => {
    const eventId = req.params.eventId;
    const userId = req.user.id;
    const { status } = req.body;

    try {
      // Log eventId and userId for debugging purposes
      console.log('eventId:', eventId);
      console.log('userId:', userId);

      // Check if the event exists
      const event = await Event.findByPk(eventId);

      if (!event) {
        return res.status(404).json({ message: "Event couldn't be found" });
      }

      // Log the event to check if it's found
      console.log('Event found:', event);

      // Check if the attendance exists
      const attendee = await Attendee.findOne({
        where: { eventId, userId },
      });

      if (!attendee) {
        return res.status(404).json({ message: "Attendance between the user and the event does not exist" });
      }

      // Log the attendee to check if it's found
      console.log('Attendee found:', attendee);

      // Check if the current user is the organizer or a member with co-host status of the group
      const isOrganizer = event.organizerId === userId;
      const isCoHostOrMember = await Membership.findOne({
        where: {
          memberId: userId,
          groupId: event.groupId,
          [Op.or]: [{ status: 'co-host' }, { status: 'member' }],
        },
      });

      if (!isOrganizer && !isCoHostOrMember) {
        return res.status(403).json({ message: 'Forbidden. You do not have permission to edit the attendance status' });
      }
      
      // Check if the new status is "pending" and return an error if it is
      if (status === 'pending') {
        return res.status(400).json({ message: 'Cannot change an attendance status to pending' });
      }

      // Update the status of the attendance
      attendee.status = status;
      await attendee.save();

      // Return the updated attendance
      return res.status(200).json({
        id: attendee.id,
        eventId: attendee.eventId,
        userId: attendee.userId,
        status: attendee.status,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

router.delete( //Delete attendance to an event specified by id
  '/:eventId/attendance',
  requireAuth,
  async (req, res) => {
    const eventId = req.params.eventId;
    const userId = req.user.id;

    try {
      // Check if the event exists
      const event = await Event.findByPk(eventId);

      if (!event) {
        return res.status(404).json({ message: "Event couldn't be found" });
      }

      // Check if attendance exists for the user
      const attendance = await Attendee.findOne({
        where: {
          eventId,
          userId,
        },
      });

      // Check if the user is authorized to delete the attendance
      if (req.user.id !== attendance.userId && req.user.id !== event.organizerId) {
        return res.status(403).json({ message: "Only the User or organizer may delete an Attendance" });
      }

      if (!attendance) {
        return res.status(404).json({ message: "Attendance does not exist for this User" });
      }

      // Delete the attendance
      await attendance.destroy();

      return res.status(200).json({ message: "Successfully deleted attendance from event" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });


router.post( //Add an Image to a Event based on the Event's id
  '/:eventId/images',
  requireAuth,
  async (req, res) => {
    const eventId = req.params.eventId;

    try {
      // Check if the event exists
      const event = await Event.findByPk(eventId);

      if (!event) {
        return res.status(404).json({ message: "Event couldn't be found" });
      }

      // Find the associated group for the event
      const group = await Group.findByPk(event.groupId);

      if (!group) {
        return res.status(404).json({ message: "Group associated with the event couldn't be found" });
      }

      // Check if the current user is the organizer of the group or a co-host
      const isAuthorized =
        req.user.id === group.organizerId ||
        (await Attendee.findOne({
          where: {
            eventId,
            userId: req.user.id,
            status: 'co-host', // Modify this to allow 'co-host' status
          },
        }));

      if (!isAuthorized) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      // Create a new image for the event
      const { url, preview } = req.body;
      const image = await Image.create({
        imageableId: eventId,
        imageableType: 'Event',
        url,
        preview,
      });

      return res.status(200).json(image);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.put( //Edit an Event specified by its id
  '/:eventId',
  requireAuth,
  validateEvent, // Middleware for event validation
  async (req, res) => {
    const eventId = req.params.eventId;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorResponse = {};
      errors.array().forEach((error) => {
        errorResponse[error.param] = error.msg;
      });
      return res.status(400).json({ errors: errorResponse });
    }

    try {
      // Check if the event exists
      const event = await Event.findByPk(eventId);

      if (!event) {
        return res.status(404).json({ message: "Event couldn't be found" });
      }

      // Find the associated group for the event
      const group = await Group.findByPk(event.groupId);

      if (!group) {
        return res.status(404).json({ message: "Group associated with the event couldn't be found" });
      }

      // Check if the current user is the organizer of the group or a co-host
      const isAuthorized =
        req.user.id === group.organizerId ||
        (await Attendee.findOne({
          where: {
            eventId,
            userId: req.user.id,
            status: 'co-host',
          },
        }));

      if (!isAuthorized) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      // Update the event with the provided data
      await event.update({
        venueId: req.body.venueId,
        name: req.body.name,
        type: req.body.type,
        capacity: req.body.capacity,
        price: req.body.price,
        description: req.body.description,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
      });

      // Return the updated event
      return res.status(200).json(event);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.delete( //Delete an Event specified by its id
  '/:eventId',
  requireAuth,
  async (req, res) => {
    const eventId = req.params.eventId;

    try {
      // Check if the event exists
      const event = await Event.findByPk(eventId);

      if (!event) {
        return res.status(404).json({ message: "Event couldn't be found" });
      }

      // Find the associated group for the event
      const group = await Group.findByPk(event.groupId);

      if (!group) {
        return res.status(404).json({ message: "Group associated with the event couldn't be found" });
      }

      // Check if the current user is the organizer of the group or a co-host
      const isAuthorized =
        req.user.id === group.organizerId ||
        (await Attendee.findOne({
          where: {
            eventId,
            userId: req.user.id,
            status: 'co-host',
          },
        }));

      if (!isAuthorized) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      // Delete the event
      await Event.destroy({ where: { id: eventId } });

      return res.status(200).json({ message: 'Successfully deleted' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

module.exports = router;
