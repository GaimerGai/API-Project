'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Attendee extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

    }
  }
  Attendee.init({
    status:{
      type:DataTypes.STRING,
      allowNull:false,
      // validate:{
      //   equals:{
      //     args:[['attending', 'pending', 'waitlist']],
      //   }
      // },
    },
    userId:{
      type:DataTypes.INTEGER,
      allowNull:false,
    },
    eventId:{
      type:DataTypes.INTEGER,
      allowNull:false,
    },
  }, {
    sequelize,
    modelName: 'Attendee',
  });
  return Attendee;
};
