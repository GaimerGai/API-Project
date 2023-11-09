'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Venue extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Venue.belongsTo(
        models.Group,{
          foreignKey:'groupId',
          onDelete:'CASCADE',
        }
      )
      Venue.hasMany(
        models.Event,{
          foreignKey:'venueId'
        }
      )
    }
  }
  Venue.init({
    groupId:{
      type:DataTypes.INTEGER,
      allowNull:false,
    },
    address:{
      type:DataTypes.STRING,
      allowNull:false,
      validate:{
        notEmpty:true,
        // isAlphanumeric:true,
        notNull:{
          args:true,
          msg:"Street address is required"
        }
      }
    },
    city:{
      type:DataTypes.STRING,
      allowNull:false,
      validate:{
        notEmpty:true,
        // isAlpha:true,
        notNull:{
          args:true,
          msg:"City is required"
        }
      }
    },
    state:{
      type:DataTypes.STRING,
      allowNull:false,
      validate:{
        notEmpty:true,
        len:{
          args:[2,2],
          msg:"State is required"
        }
      }
    },
    lat:{
      type:DataTypes.FLOAT,
      allowNull:false,
      validate:{
        isNumeric:true,
        isFloat:true,
        notNull:{
          args:true,
          msg:"Latitude is not valid"
        }
      }
    },
    lng:{
      type:DataTypes.FLOAT,
      allowNull:false,
      validate:{
        isNumeric:true,
        isFloat:true,
        notNull:{
          args:true,
          msg:"Longitude is not valid"
        }
      }
    },
  }, {
    sequelize,
    modelName: 'Venue',
  });
  return Venue;
};
