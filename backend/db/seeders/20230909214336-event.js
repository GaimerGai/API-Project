'use strict';
const { Event } = require('../models');
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await Event.bulkCreate([
      {
        groupId: 1, // Use an existing group ID
        venueId: 1, // Use an existing venue ID (if applicable)
        name: 'Sample Event 1',
        type: 'Online', // Or 'In person'
        capacity: 100,
        price: 20.00,
        description: 'This is a sample event description.',
        hostFirstName:'John',
        hostLastName:'Smith',
        startDate: new Date('2023-09-15T10:00:00Z'),
        endDate: new Date('2023-09-15T15:00:00Z'),
      },
      {
        groupId: 2, // Use an existing group ID
        venueId: null, // No venue associated
        name: 'Sample Event 2',
        type: 'In person', // Or 'Online'
        capacity: 50,
        price: 30.00,
        description: 'Another sample event description.',
        hostFirstName:'Smith',
        hostLastName:'John',
        startDate: new Date('2023-09-20T14:00:00Z'),
        endDate: new Date('2023-09-20T18:00:00Z'),
      },
      {
        groupId: 1,
        venueId: 3,
        name: 'Future Event 1',
        type: 'Online',
        capacity: 80,
        price: 25.00,
        description: 'This is a future event description.',
        hostFirstName: 'Jane',
        hostLastName: 'Doe',
        startDate: new Date('2023-12-12T12:00:00Z'),
        endDate: new Date('2023-12-12T16:00:00Z'),
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    if (process.env.NODE_ENV === 'production'){
      options.tableName = 'Events';
      const Op = Sequelize.Op;
      return queryInterface.bulkDelete(options, {
        name: { [Op.in]: ['Sample Event 1', 'Sample Event 2', 'Future Event 1',] }
      }, {});
    }
    else{
      await Event.destroy({ where: {} });
    }
  }
};
