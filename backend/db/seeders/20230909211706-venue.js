'use strict';
const { Venue } = require('../models');
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await Venue.bulkCreate([
      {
        groupId: 1, // Use an existing group ID
        address: '123 Sample St',
        city: 'Sample City',
        state: 'CA',
        lat: 37.123456, // Use actual latitude
        lng: -122.123456, // Use actual longitude
      },
      {
        groupId: 2, // Use an existing group ID
        address: '456 Test Ave',
        city: 'Testville',
        state: 'NY',
        lat: 40.987654, // Use actual latitude
        lng: -73.987654, // Use actual longitude
      },
      {
        groupId: 1, // Use an existing group ID
        address: '789 Example Rd',
        city: 'Exampletown',
        state: 'TX',
        lat: 30.246810, // Use actual latitude
        lng: -95.135790, // Use actual longitude
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    if (process.env.NODE_ENV === 'production'){
    options.tableName = 'Venues';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      id: { [Op.in]: [1, 2, 3] }
    }, {});
  }
  else{
    await Venue.destroy({ where: {} });
  }
  }
};
