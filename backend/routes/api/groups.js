const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { User, Group, Membership, Image, Venue } = require('../../db/models');
const membership = require('../../db/models/membership');

const router = express.Router();

const validateLogin = [
  check('credential')
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage('Please provide a valid email or username.'),
  check('password')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a password.'),
  handleValidationErrors
];

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
  check('city').notEmpty().withMessage('City is required'),
  check('state').notEmpty().withMessage('State is required'),
];

const validateImageUrl = [
  check('url')
    .isURL()
    .withMessage('Please provide a valid image URL'),
];

router.get( // Get all Groups
  '/',
  async (req, res, next) => {
    try {
      const groups = await Group.findAll();

      const formattedGroups = await Promise.all(groups.map(async group => {

        const numMembers = await Membership.count({ where: { groupId: group.id } });

        const images = await Image.findAll({ where: { imageableId: group.id, imageableType: 'Group' } });

        console.log('Images for group:', group.name, images);

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

router.get( // Get all Groups joined or organized by the Current User
  '/current',
  requireAuth,
  async (req, res, next) => {
    try {

      const currentUserId = req.user.id;

      const groups = await Group.findAll({
        include: [
          {
            model: Membership,
            where: {
              memberId: currentUserId,
              status: {
                [Op.in]: ['attending', 'pending', 'waitlist'],
              },
            },
            required: false,
          },
          {
            model: Image,
            where: {
              imageableType: 'Group',
            },
            required: false,
          },
        ],
        where: {
          [Op.or]: [
            { organizerId: currentUserId },
            { '$Memberships.memberId$': currentUserId }
          ],
        },
      });
      const formattedGroups = groups.map((group) => ({
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
        numMembers: group.Memberships.length, // Count the number of members
        previewImage: group.Images.length > 0 ? group.Images[0].url : null, // Get the preview image if available
      }));
      res.status(200).json({ Groups: formattedGroups });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.get( //Get details of a Group from an id
  '/:groupId',
  async(req,res) =>{
    const groupId = req.params.groupId;

    try{

      //Check if Group exists
      const group = await Group.findByPk(groupId,{
        include:[
          {
            model:Image,
            model:User,
            model:Venue,
          },
        ],
      });

      if (!group){
        return res.status(404).json({ message: "Group couldn't be found" });
      }
      //Calculate numMembers
      const numMembers = await Membership.count({ where: { groupId: group.id } });

      const response = {
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
        GroupImages:group.Images,
        Organizer: group.User,
        Venues:group.Venues,
      };

      return res.status(200).json(response);
    }catch(error){
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
)

router.post( //Create a Group
  '/',
  requireAuth,
  validateGroup,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Bad Request', errors: errors.array() });
    }

    try {

      const newGroup = await Group.create({
        organizerId: req.user.id,
        ...req.body,
      });
      return res.status(201).json(newGroup);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

router.post( //Add an Image to a Group based on the Group's id
  '/:groupId/images',
  requireAuth,
  validateImageUrl,
  async(req,res)=>{
    const groupId = req.params.groupId;
    const {url, preview} = req.body;

    try{
      //Check if the group exists
      const group = await Group.findByPk(groupId);

      if(!group){
        return res.status(404).json({message: "Group couldn't be found"});
      }

      //Check if the current user is the organizer of the group
      if (group.organizerId !== req.user.id){
        return res.status(401).json({message: "Unauthorized. You are not the organizer of this group."});
      }

      //Create a new image for the group
      const image = await Image.create({
        url,
        preview,
        imageableType:'Group',
        imageableId: groupId,
      });

      return res.status(200).json(image);
    } catch (error) {
      console.error(error);
      return res.status(500).json({error: 'Internal server error'});
    }
  }
);

module.exports = router;
