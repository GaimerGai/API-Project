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
    const image = await Image.findByPk(imageId);

    if (!image) {
      return res.status(404).json({ message: 'Group Image couldn\'t be found' });
    }

    // Find the associated group
    const group = await Group.findByPk(image.imageableId);

    // Check if the user is authorized (organizer or co-host of the group)
    const isAuthorized =
      userId === group.organizerId ||
      (await Membership.findOne({
        where: {
          groupId: group.id,
          memberId: req.user.id,
          status: 'co-host',
        },
      }));

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
