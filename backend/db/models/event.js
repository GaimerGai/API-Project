'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Event.belongsTo(
        models.Group,{
          foreignKey:'groupId'
        },
      ),
      Event.belongsTo(
        models.Venue,{
          foreignKey:'venueId'
        },
      ),
      Event.hasMany(
        models.Attendee,{
          foreignKey:'eventId'
        },
      )
    }
  }
  Event.init({
    groupId:{
      type:DataTypes.INTEGER,
      allowNull:false,
    },
    venueId:{
      type:DataTypes.INTEGER,
    },
    name:{
      type:DataTypes.STRING,
      allowNull:false,
      validate:{
        len:[3],
        isAlphanumeric:true
      },
    },
    type:{
      type:DataTypes.STRING,
      allowNull:false,
      validate:{
        equals:{
          args:[['Online', 'In person']],
          msg: 'Type must be Online or In person',
        }
      },
    },
    capacity:{
      type:DataTypes.INTEGER,
      allowNull:false,
      validate:{
        isInt:true,
      },
    },
    price:{
      type:DataTypes.DECIMAL(10,2),
      allowNull:false,
      validate:{
        isValidPrice(value){
          if (value<=0){
            throw new Error('Price is invalid')
          }
        }
      },
    },
    description:{
      type:DataTypes.STRING,
      allowNull:false,
      validate:{
        notEmpty: true,
      },
    },
    startDate:{
      type:DataTypes.DATE,
      allowNull:false,
      validate:{
        isNotInPast(value){
          if(new Date(value) < new Date()){
            throw new Error('Start date must be in the future')
          }
        },
      },
    },
    endDate:{
      type:DataTypes.DATE,
      allowNull:false,
      validate:{
        isEndDateAfterStartDate(value){
          if (new Date(value)<= new Date(this.startDate)){
            throw new Error('End date must be after the start date')
          }
        }
      },
    },
  }, {
    sequelize,
    modelName: 'Event',
  });
  return Event;
};
