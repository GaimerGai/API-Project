const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { User, Group, Membership, Image, Venue, Attendee, Event } = require('../../db/models');


const router = express.Router();

// Validation middleware for the request body
const validateGroup = [
  check('name')
    .isLength({ max: 60 })
    .withMessage('Name must be 60 characters or less'),
  check('about')
    .isLength({ min: 50 })
    .withMessage('About must be 50 characters or more'),
  check('type')
    .isIn(['Online', 'In person'])
    .withMessage("Type must be 'Online' or 'In person'"),
  check('private')
    .isBoolean()
    .withMessage('Private must be a boolean'),
  check('city')
    .notEmpty()
    .withMessage('City is required'),
  check('state')
    .notEmpty()
    .withMessage('State is required'),
    handleValidationErrors
];

const validateImageUrl = [
  check('url')
    .isURL()
    .withMessage('Please provide a valid image URL'),
    handleValidationErrors
];

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
    .isIn(['Online', 'In person'])
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
  check('endDate').custom((endDate, { req }) => {
    const { startDate } = req.body;
    const currentDate = new Date();

    // Check if the end date is in the past
    if (new Date(endDate) < currentDate) {
      throw new Error('End date must be in the future');
    }
    // Check if the end date is less than the start date
    if (new Date(endDate) < new Date(startDate)) {
      throw new Error('End date is less than the start date');
    }

    return true;
  }),
  handleValidationErrors
];

// Custom validator function to check if latitude is valid
const isLatitude = (value) => {
  if (isNaN(value) || value < -90 || value > 90) {
    throw new Error('Latitude is not valid');
  }
  return true;
};

// Custom validator function to check if longitude is valid
const isLongitude = (value) => {
  if (isNaN(value) || value < -180 || value > 180) {
    throw new Error('Longitude is not valid');
  }
  return true;
};


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
    .notEmpty()
    .isFloat()
    .custom(isLatitude)
    .withMessage('Latitude is not valid'),
  check('lng')
    .notEmpty()
    .isFloat()
    .custom(isLongitude)
    .withMessage('Longitude is not valid'),

  // (req, res, next) => {
  //   const errors = validationResult(req);

  //   if (!errors.isEmpty()) {
  //     const validationErrors = {};
  //     errors.array().forEach(error => {
  //       validationErrors[error.param] = error.msg;
  //     });

  //     return res.status(400).json({
  //       message: 'Bad Request',
  //       errors: validationErrors
  //     });
  //   }

  //   next();
  // },
  handleValidationErrors
];

// Get all Groups
router.get(
  '/',
  async (req, res, next) => {
    try {
      const groups = await Group.findAll();

      const formattedGroups = await Promise.all(groups.map(async group => {

        const numMembers = await Membership.count({ where: { groupId: group.id } });

        const images = await Image.findAll({ where: { imageableId: group.id, imageableType: 'Group', preview: true, } });

        const previewImage = images.length > 0 ? images[0].url : null;

        return {
          id: group.id,
          organizerId: group.organizerId,
          name: group.name,
          about: group.about,
          type: group.type,
          private: group.private,
          city: group.city,
          state: group.state,
          createdAt: group.createdAt,
          updatedAt: group.updatedAt,
          numMembers: numMembers,
          previewImage: previewImage,
        };
      }));
      res.status(200).json({ Groups: formattedGroups });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' })
    }
  });

// Create a Group
router.post(
  '/',
  requireAuth,
  validateGroup,
  async (req, res) => {
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //   const errorResponse = {};
    //   errors.array().forEach((error) => {
    //     errorResponse[error.param] = error.msg;
    //   });
    //   return res.status(400).json({ message: 'Bad Request', errors: errorResponse });
    // }

    try {
      const newGroup = await Group.create({
        organizerId: req.user.id,
        ...req.body,
      });
      return res.status(201).json(newGroup);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);


//Get all Groups joined or organized by the Current User
router.get(
  '/current',
  requireAuth,
  async (req, res, next) => {
    try {
      const currentUserId = req.user.id;
      console.log("current User Id: ", currentUserId);

      // Fetch groups without eager loading Membership
      const groups = await Group.findAll({
        where: {
          organizerId: currentUserId,
        },
        include: [
          {
            model: Image,
            where: {
              imageableType: 'Group',
            },
            required: false,
          },
        ],
      });

      const totalGroups = [];

      for (const group of groups) {
        // Calculate numMembers inside the loop
        const numMembers = await Membership.count({ where: { groupId: group.id } });

        totalGroups.push({
          id: group.id,
          organizerId: group.organizerId,
          name: group.name,
          about: group.about,
          type: group.type,
          private: group.private,
          city: group.city,
          state: group.state,
          createdAt: group.createdAt,
          updatedAt: group.updatedAt,
          numMembers: numMembers,
          previewImage: group.Images.length > 0 ? group.Images[0].url : null,
        });
      }
      const getMembership = await Membership.findAll({
        where: { memberId: currentUserId }
      })
      console.log(getMembership)

      for (const memberShip of getMembership) {
        const groupCheck = await Group.findOne({
          where: { id: memberShip.groupId },
        })
        if (groupCheck.organizerId !== currentUserId) {
          const getMemGroup = await Group.findOne({
            where: {
              id: memberShip.groupId
            },
            include: [
              {
                model: Image,
                where: {
                  imageableType: 'Group',
                },
                required: false,
              },
            ],
          })
          // Calculate numMembers inside the loop
          const numMembers = await Membership.count({ where: { groupId: getMemGroup.id } });
          const newGroup = {
            id: getMemGroup.id,
            organizerId: getMemGroup.organizerId,
            name: getMemGroup.name,
            about: getMemGroup.about,
            type: getMemGroup.type,
            private: getMemGroup.private,
            city: getMemGroup.city,
            state: getMemGroup.state,
            createdAt: getMemGroup.createdAt,
            updatedAt: getMemGroup.updatedAt,
            numMembers: numMembers,
            previewImage: getMemGroup.Images.length > 0 ? getMemGroup.Images[0].url : null,
          }
          totalGroups.push(newGroup)
        }
      }
      res.status(200).json({ Groups: totalGroups });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);


router.get( //Get details of a Group from an id
  '/:groupId',
  async (req, res) => {
    const groupId = req.params.groupId;

    try {

      //Check if Group exists
      const group = await Group.findByPk(groupId, {
        include: [
          {
            model: Image,
            where: { imageableType: 'Group' },
          },
          {
            model: User,
          },
          {
            model: Venue,
          },
        ],
      });

      if (!group) {
        return res.status(404).json({ message: "Group couldn't be found" });
      }
      //Calculate numMembers
      const numMembers = await Membership.count({ where: { groupId: group.id } });

      // Omit unwanted fields from the response objects
      const groupImages = group.Images.map((image) => ({
        id: image.id,
        url: image.url,
        preview: image.preview,
      }));

      const venues = group.Venues.map((venue) => ({
        id: venue.id,
        groupId: venue.groupId,
        address: venue.address,
        city: venue.city,
        state: venue.state,
        lat: venue.lat,
        lng: venue.lng,
      }));

      const response = {
        id: group.id,
        organizerId: group.organizerId,
        name: group.name,
        about: group.about,
        type: group.type,
        private: group.private,
        city: group.city,
        state: group.state,
        createdAt:group.createdAt,
        updatedAt:group.updatedAt,
        numMembers: numMembers,
        GroupImages: groupImages,
        Organizer: group.User,
        Venues: venues,
      };

      return res.status(200).json(response);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
)

router.put( //Edit a Group
  '/:groupId',
  requireAuth,
  validateGroup,
  async (req, res) => {
    const { groupId } = req.params;
    // const errors = validationResult(req);

    // if (!errors.isEmpty()) {
    //   const errorResponse = {};
    //   errors.array().forEach((error) => {
    //     errorResponse[error.param] = error.msg;
    //   });
    //   return res.status(400).json({ message: 'Bad Request', errors: errorResponse });
    // }

    try {
      //Check if the group exists
      const group = await Group.findByPk(groupId);

      if (!group) {
        return res.status(404).json({ message: "Group couldn't be found" });
      }

      if (group.organizerId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const updatedGroup = await group.update({
        name: req.body.name,
        about: req.body.about,
        type: req.body.type,
        private: req.body.private,
        city: req.body.city,
        state: req.body.state,
      });

      return res.status(200).json(updatedGroup);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

router.delete( //Delete a Group
  '/:groupId',
  requireAuth,
  async (req, res) => {
    const { groupId } = req.params;

    try {
      const group = await Group.findByPk(groupId);

      if (!group) {
        return res.status(404).json({ message: "Group couldn't be found" });
      }

      if (group.organizerId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      console.log('Group to be deleted:', group);
      await Group.destroy({ where: { id: Number(groupId) } });


      return res.status(200).json({ message: "Successfully deleted" })
    } catch (error) {
      console.error(error.stack);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
)

router.get( //Get all Events of a Group specified by its id
  '/:groupId/events',
  async (req, res) => {
    const { groupId } = req.params;

    try {
      // Find the group by ID
      const group = await Group.findByPk(groupId);

      if (!group) {
        return res.status(404).json({ message: "Group couldn't be found" });
      }
      // Find all events associated with the group
      const events = await Event.findAll({
        where: { groupId },
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

      // Format the response
      const formattedEvents = await Promise.all(events.map(async (event) => {
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
          numAttending,
          previewImage,
          Group: {
            id: group.id,
            name: group.name,
            city: group.city,
            state: group.state,
          },
          Venue: event.Venue,
        };
      }));

      return res.status(200).json({ Events: formattedEvents });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

//Create an Event for a Group specified by its id
router.post(
  '/:groupId/events',
  requireAuth,
  validateEvent,
  async (req, res) => {
    const { groupId } = req.params;
    // const errors = validationResult(req);

    // if (!errors.isEmpty()) {
    //   const errorResponse = {};
    //   errors.array().forEach((error) => {
    //     errorResponse[error.param] = error.msg;
    //   });

    //   return res.status(400).json({ message: 'Bad Request', errors: errorResponse });
    // }

    try {
      // Check if Group exists
      const group = await Group.findByPk(groupId);

      if (!group) {
        return res.status(404).json({ message: "Group couldn't be found" });
      }

      // Check if the user is authorized to create an event
      const isOrganizer = group.organizerId === req.user.id;
      const isCoHost = await Membership.findOne({
        where: {
          memberId: req.user.id,
          groupId: group.id,
          status: 'co-host',
        },
      });

      if (!isOrganizer && !isCoHost) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      // Create a new event
      const event = await Event.create({
        groupId: group.id,
        venueId: req.body.venueId,
        name: req.body.name,
        type: req.body.type,
        capacity: req.body.capacity,
        price: req.body.price,
        description: req.body.description,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
      });

      const response = {
        id: event.id,
        groupId: groupId,
        venueId: event.venueId,
        name:event.name,
        type:event.type,
        capacity: event.capacity,
        price:event.price,
        description:event.description,
        startDate:event.startDate,
        endDate:event.endDate,
      }

      return res.status(200).json(response);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);


router.post( //Add an Image to a Group based on the Group's id
  '/:groupId/images',
  requireAuth,
  validateImageUrl,
  async (req, res) => {
    const groupId = req.params.groupId;
    const { url, preview } = req.body;

    try {
      //Check if the group exists
      const group = await Group.findByPk(groupId);

      if (!group) {
        return res.status(404).json({ message: "Group couldn't be found" });
      }

      //Check if the current user is the organizer of the group
      if (group.organizerId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized. You are not the organizer of this group." });
      }

      //Create a new image for the group
      const image = await Image.create({
        url,
        preview,
        imageableType: 'Group',
        imageableId: groupId,
      });

      // Omit unwanted fields from the response
      const responseImage = {
        id: image.id,
        url: image.url,
        preview: image.preview,
      };

      return res.status(200).json(responseImage);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.get( //Get all Members of a Group specified by its id
  '/:groupId/members',
  requireAuth,
  async (req, res) => {
    const groupId = req.params.groupId;

    try {
      // Check if the group exists
      const group = await Group.findByPk(groupId);

      if (!group) {
        return res.status(404).json({ message: "Group couldn't be found" });
      }

      // Check if the current user is the organizer or a co-host
      const isOrganizer = group.organizerId === req.user.id;
      const isCoHost = await Membership.findOne({
        where: {
          memberId: req.user.id,
          groupId: group.id,
          status: 'co-host',
        },
      });

      // Fetch group members along with their statuses
      const members = await User.findAll({
        include: [
          {
            model: Group,
            where: { id: groupId },
            through: { attributes: ['status'] }, // Include 'status' from Membership
          },
        ],
        attributes: ['id', 'firstName', 'lastName'],
      });


      if (isOrganizer || isCoHost){
        let filteredMembers = members.map((member) => {
          const { id, firstName, lastName } = member;
          const membershipStatus = member.Groups[0].Membership.status;

          return {
            id,
            firstName,
            lastName,
            Membership: {
              status: membershipStatus,
            },
          };
        });
        return res.status(200).json({ Members: filteredMembers });
      }

      // Filter out members with a status of "pending" if the user is not the organizer or co-host
      if (!isOrganizer || !isCoHost) {
        let filteredMembers = members.map((member) => {
          const { id, firstName, lastName } = member;
          const membershipStatus = member.Groups[0].Membership.status;

          return {
            id,
            firstName,
            lastName,
            Membership: {
              status: membershipStatus,
            },
          };
        });
        filteredMembers = filteredMembers.filter((member) => member.Membership.status !== 'pending');
        return res.status(200).json({ Members: filteredMembers });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);



router.post( //Request a Membership for a Group based on the Group's id
  '/:groupId/membership',
  requireAuth,
  async (req, res) => {
    const groupId = req.params.groupId;
    const userId = req.user.id;

    try {
      // Check if the group exists
      const group = await Group.findByPk(groupId);

      if (!group) {
        return res.status(404).json({ message: "Group couldn't be found" });
      }

      // Check if the user already has a membership request for the group
      const existingMembershipRequest = await Membership.findOne({
        where: {
          groupId,
          memberId: userId,
          status: 'pending',
        },
      });

      if (existingMembershipRequest) {
        return res.status(400).json({ message: 'Membership has already been requested' });
      }

      // Check if the user is already a member of the group
      const existingMembership = await Membership.findOne({
        where: {
          groupId,
          memberId: userId,
        },
      });

      if (existingMembership) {
        return res.status(400).json({ message: 'User is already a member of the group' });
      }

      // Create a new membership request for the group
      const newMembershipRequest = await Membership.create({
        groupId,
        memberId: userId,
        status: 'pending',
      });

      return res.status(200).json({
        memberId: newMembershipRequest.memberId,
        status: newMembershipRequest.status,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

router.put( //Change the status of a membership for a group specified by id
  '/:groupId/membership',
  requireAuth,
  async (req, res) => {
    const groupId = req.params.groupId;
    const { memberId, status } = req.body;

    try {
      // Check if the group exists
      const group = await Group.findByPk(groupId);

      if (!group) {
        return res.status(404).json({ message: 'Group couldn\'t be found' });
      }

      // Check if the user is authorized to change the membership status
      const isOrganizer = group.organizerId === req.user.id;
      const isCoHost = await Membership.findOne({
        where: {
          groupId,
          memberId: req.user.id,
          status: 'co-host',
        },
      });

      //Couldn't find a User with the specified memberId
      const user = await User.findByPk(memberId);
      if (!user) {
        return res.status(400).json({
          message: 'Validation Error',
          errors: { memberId: 'User couldn\'t be found' },
        });
      }

      if (status === 'pending') {
        return res.status(400).json({
          message: 'Validations Error',
          errors: { status: 'Cannot change a membership status to pending' },
        });
      }

      if (status === 'member') {
        if (isOrganizer || isCoHost) {
          const membership = await Membership.findOne({
            where: { groupId, memberId },
          });

          if (!membership) {
            return res.status(404).json({
              message: 'Membership between the user and the group does not exist',
            });
          }

          membership.status = status;
          await membership.save();

          const response = {
            id: req.user.id,
            groupId:group.id ,
            memberId:memberId ,
            status:membership.status
          }

          return res.status(200).json(response);
        } else {
          return res.status(403).json({ message: 'Unauthorized' });
        }
      } else if (status === 'co-host') {
        if (isOrganizer) {
          const membership = await Membership.findOne({
            where: { groupId, memberId },
          });

          if (!membership) {
            return res.status(404).json({
              message: 'Membership between the user and the group does not exist',
            });
          }

          membership.status = status;
          await membership.save();
          const response = {
            id: req.user.id,
            groupId:group.id ,
            memberId:memberId ,
            status:membership.status
          }

          return res.status(200).json(response);
        } else {
          return res.status(403).json({ message: 'Unauthorized' });
        }
      } else {
        return res.status(400).json({
          message: 'Validations Error',
          errors: { status: 'Invalid status' },
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
//Delete membership to a group specified by id
router.delete( // Delete membership to a group specified by id
  '/:groupId/membership',
  requireAuth,
  async (req, res) => {
    const groupId = (req.params.groupId);
    const memberId = (req.body.memberId);

    // Check if memberId is missing in the request body
    if (typeof memberId === 'undefined') {
      return res.status(400).json({
        message: 'Validation Error',
        errors: { memberId: 'MemberId is required in the request body' },
      });
    }

    try {
      // Check if the user whose membership is being deleted exists
      const user = await User.findByPk(memberId);
      if (!user) {
        return res.status(400).json({
          message: 'Validation Error',
          errors: { memberId: 'User couldn\'t be found' },
        });
      }
      
      // Check if the group exists
      const group = await Group.findByPk(groupId);

      if (!group) {
        return res.status(404).json({ message: 'Group couldn\'t be found' });
      }


      // Check if the user is authorized to delete the membership
      const isHost = group.organizerId === req.user.id;
      const isCurrentUser = memberId == req.user.id;

      if (!isHost && !isCurrentUser) {
        return res.status(403).json({ message: 'Unauthorized' });
      }


      // Check if the membership exists
      const membership = await Membership.findOne({
        where: { groupId, memberId },
      });

      if (!membership) {
        return res.status(404).json({ message: 'Membership does not exist for this User' });
      }

      // Delete the membership
      await membership.destroy();

      return res.status(200).json({ message: 'Successfully deleted membership from group' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.get( //Get All Venues for a Group specified by its id
  '/:groupId/venues',
  requireAuth,
  async (req, res) => {
    const { groupId } = req.params;

    try {
      const group = await Group.findByPk(groupId);

      if (!group) {
        return res.status(404).json({ message: "Group couldn't be found" });
      }

      const isOrganizer = group.organizerId === req.user.id;

      // Check if the user is a co-host or member of the group
      const isCoHost = await Membership.findOne({
        where: {
          groupId,
          memberId: req.user.id,
          status: 'co-host',
        },
      });

      if (!isOrganizer && !isCoHost) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      const venues = await Venue.findAll({
        where: { groupId },
        attributes: { exclude: ['createdAt', 'updatedAt'] },
      });

      return res.status(200).json({ Venues: venues });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.post( //Create a new Venue for a Group specified by its id
  '/:groupId/venues',
  requireAuth,
  validateVenue,
  async (req, res) => {
    const { groupId } = req.params;
    const { address, city, state, lat, lng } = req.body;
    // const errors = validationResult(req);

    // if (!errors.isEmpty()) {
    //   const errorResponse = {};
    //   errors.array().forEach((error) => {
    //     errorResponse[error.param] = error.msg;
    //   });
    //   return res.status(400).json({ message: 'Bad Request', errors: errorResponse });
    // }

    try {
      const group = await Group.findByPk(groupId);

      if (!group) {
        return res.status(404).json({ message: "Group couldn't be found" });
      }

      const isOrganizer = group.organizerId === req.user.id;

      // Check if the user is a co-host or member of the group
      const isCoHost = await Membership.findOne({
        where: {
          groupId,
          memberId: req.user.id,
          status: 'co-host',
        },
      });

      if (!isOrganizer && !isCoHost) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      const newVenue = await Venue.create({
        groupId,
        address,
        city,
        state,
        lat,
        lng,
      });

      const response = {
        id: newVenue.id,
        groupId: newVenue.groupId,
        address: newVenue.address,
        city: newVenue.city,
        state: newVenue.state,
        lat: newVenue.lat,
        lng: newVenue.lng,
      };

      return res.status(200).json(response);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

module.exports = router;
