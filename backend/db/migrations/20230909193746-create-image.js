'use strict';
/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Images', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      url: {
        type: Sequelize.STRING,
        allowNull:false,
        validate:{
          notEmpty:true,
          isAlphanumeric:true
        }
      },
      preview: {
        type: Sequelize.BOOLEAN,
        allowNull:false,
      },
      imagableType: {
        type: Sequelize.STRING,
        allowNull:false,
      },
      imagableId: {
        type: Sequelize.INTEGER,
        allowNull:false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },
  async down(queryInterface, Sequelize) {
    options.tableName = "Images";
    await queryInterface.dropTable(options);
  }
};
