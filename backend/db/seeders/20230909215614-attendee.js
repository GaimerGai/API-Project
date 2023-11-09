'use strict';
const { Attendee } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await Attendee.bulkCreate([
      {
        userId: 1, // Use an existing user ID
        eventId: 1, // Use an existing event ID
        status: 'attending', // Choose one of 'attending', 'pending', or 'waitlist'
      },
      {
        userId: 2, // Use an existing user ID
        eventId: 1, // Use an existing event ID
        status: 'pending', // Choose one of 'attending', 'pending', or 'waitlist'
      },
      {
        userId: 3, // Use an existing user ID
        eventId: 2, // Use an existing event ID
        status: 'attending', // Choose one of 'attending', 'pending', or 'waitlist'
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    if (process.env.NODE_ENV === 'production'){
      options.tableName = 'Attendee';
      const Op = Sequelize.Op;
      return queryInterface.bulkDelete(options, {
        userId: { [Op.in]: [1,2,3] }
      }, {});
    }
    else{
      await Attendee.destroy({ where: {} });
    }
  }
};
