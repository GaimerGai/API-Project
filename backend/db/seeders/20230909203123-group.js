'use strict';
const { Group } = require('../models');
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await Group.bulkCreate([
      {
        organizerId: 1, // Use an existing user ID as the organizer
        name: 'Sample Group 1',
        about: 'This is a sample group 1.',
        type: 'Public',
        private: false,
        city: 'Sample City 1',
        state: 'Sample State 1',
      },
      {
        organizerId: 2, // Use an existing user ID as the organizer
        name: 'Sample Group 2',
        about: 'This is a sample group 2.',
        type: 'Private',
        private: true,
        city: 'Sample City 2',
        state: 'Sample State 2',
      },
      {
        organizerId: 3, // Use an existing user ID as the organizer
        name: 'Sample Group 3',
        about: 'This is a sample group 3.',
        type: 'Public',
        private: false,
        city: 'Sample City 3',
        state: 'Sample State 3',
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    // Rollback logic, if needed
    if (process.env.NODE_ENV === 'production'){
    options.tableName = 'Groups';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      name: { [Op.in]: ['Sample Group 1', 'Sample Group 2', 'Sample Group 3'] }
    }, {});
    }
    else{
      await Group.destroy({ where: {} });
    }
  },
};
