const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { User, Group, Membership, Image, Venue, Event, Attendee } = require('../../db/models');

const router = express.Router();

router.delete('/:imageId',
  requireAuth,
  async (req, res) => {
    const imageId = req.params.imageId;
    const userId = req.user.id;

    try {
      // Find the image
      const image = await Image.findOne({
        where: {
        id:imageId,
        imageableType: 'Event',
      }});
      console.log("This is the Image:--------------------------",image)

      if (!image) {
        return res.status(404).json({ message: 'Event Image couldn\'t be found' });
      }

      // Find the associated Event
      const group = await Group.findByPk(image.imageableId);

      // Check if the user is authorized (organizer or co-host of the group)
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

        console.log("We are here", isAuthorized);

      if (!isAuthorized) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      // Delete the image
      await image.destroy();

      return res.status(200).json({ message: 'Successfully deleted' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });


module.exports = router;
