'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Membership extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Membership.belongsTo(
        models.User,{
          foreignKey:'memberId'
        }
      )
      Membership.belongsTo(
        models.Group,{
          foreignKey:'groupId'
        }
      )
    }
  }
  Membership.init({
    memberId:{
      type:DataTypes.INTEGER,
      allowNull:false,
      validate:{
        isNumeric:true,
      }
    },
    groupId:{
      type:DataTypes.INTEGER,
      allowNull:false,
      validate:{
        isNumeric:true,
      }
    },
    status:{
      type:DataTypes.STRING,
      allowNull:false,
      validate:{
        isAlpha: true,
        notEmpty:true,
      }
    },
  }, {
    sequelize,
    modelName: 'Membership',
  });
  return Membership;
};
