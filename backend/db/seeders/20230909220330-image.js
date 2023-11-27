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
        url: 'https://c8.alamy.com/comp/KN46JH/multiethnic-friendship-a-group-of-icon-people-standing-in-a-circle-KN46JH.jpg', // URL of the image
        preview: true, // Whether it's a preview (true/false)
        imageableType: 'Group', // 'group' or 'event' depending on the association
        imageableId: 1, // ID of the associated group or event
      },
      {
        url: 'https://cdn.memiah.co.uk/blog/wp-content/uploads/counselling-directory.org.uk/2019/04/shutterstock_1464234134-1024x684.jpg',
        preview: true,
        imageableType: 'Event',
        imageableId: 1,
      },
      {
        url: 'https://www.katebackdrop.com/cdn/shop/articles/10_Photo_by_Timon_Studler_on_Unsplash.jpg',
        preview: true,
        imageableType: 'Group',
        imageableId: 2,
      },
      {
        url: 'https://img.freepik.com/free-psd/group-hands-with-pop-art-concept_53876-12046.jpg',
        preview: true,
        imageableType: 'Event',
        imageableId: 2,
      },
      {
        url: 'https://img.freepik.com/premium-photo/paper-family-composition-with-copy-space_23-2148485817.jpg',
        preview: true,
        imageableType: 'Group',
        imageableId: 3,
      },
      {
        url: 'https://serpent77.files.wordpress.com/2021/09/group-1825509.jpg',
        preview: true,
        imageableType: 'Event',
        imageableId: 3,
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
