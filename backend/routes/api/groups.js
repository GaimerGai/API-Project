const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { User, Group, Membership, Image } = require('../../db/models');
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

router.get (
    '/',
    async(req,res,next) =>{
        try {
          const groups = await Group.findAll();

          const formattedGroups = await Promise.all(groups.map(async group =>{

            const numMembers = await Membership.count({where:{groupId:group.id}});

            const images = await Image.findAll({ where: { imagableId: group.id, imagableType: 'Group' } });

            const previewImage = images.length > 0 ? images[0].url : null;

            return{
            id: group.id,
            organizerId:group.organizerId,
            name:group.name,
            about:group.about,
            type:group.type,
            private:group.private,
            city:group.city,
            state:group.state,
            createdAt:group.createdAt,
            updatedAt:group.updatedAt,
            numMembers:numMembers,
            previewImage:previewImage,
          };
          }));
          res.status(200).json({Groups: formattedGroups});
        } catch(error){
          console.error(error);
          res.status(500).json({error:'Internal server error'})
        }
    });

module.exports = router;
