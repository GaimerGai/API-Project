'use strict';

const { Membership } = require('../models');
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await Membership.bulkCreate([
      {
        memberId: 1, // Use an existing user ID
        groupId: 1,  // Use an existing group ID
        status: 'Active',
      },
      {
        memberId: 2, // Use an existing user ID
        groupId: 2,  // Use an existing group ID
        status: 'Pending',
      },
      {
        memberId: 3, // Use an existing user ID
        groupId: 1,  // Use an existing group ID
        status: 'Active',
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    if (process.env.NODE_ENV === 'production'){
    options.tableName = 'Memberships';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      memberId: { [Op.in]: [1, 2, 3] }
    }, {});
    }
    else{
      await Membership.destroy({ where: {} });
    }
  }
};
