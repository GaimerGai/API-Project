'use strict';
const { Image } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await Image.bulkCreate([
      {
        url: 'https://example.com/image1.jpg', // URL of the image
        preview: true, // Whether it's a preview (true/false)
        imageableType: 'Group', // 'group' or 'event' depending on the association
        imageableId: 1, // ID of the associated group or event
      },
      {
        url: 'https://example.com/image2.jpg',
        preview: true,
        imageableType: 'Event',
        imageableId: 1,
      },
      {
        url: 'https://example.com/image3.jpg',
        preview: true,
        imageableType: 'Group',
        imageableId: 2,
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    if (process.env.NODE_ENV === 'production'){
      options.tableName = 'Images';
      const Op = Sequelize.Op;
      return queryInterface.bulkDelete(options, {
        imageableType: { [Op.in]: ['Group', 'Event'] }
      }, {});
    }
    else{
      await Image.destroy({where:{}});
    }
  }
};
