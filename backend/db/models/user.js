'use strict';
const { Model, Validator } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // define association here
      User.hasMany(
        models.Group,{
          foreignKey:'organizerId'
        }
      )
      User.belongsToMany(
        models.Group,{
          through:
          models.Membership,
          foreignKey:'memberId',
          otherKey:'groupId'
        }
      )
      User.belongsToMany(
        models.Event,{
          through:
          models.Attendee,
          foreignKey:'userId',
          otherKey:'eventId'
        }
      )
    }
  };

  User.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [4, 30],
          isNotEmail(value) {
            if (Validator.isEmail(value)) {
              throw new Error("Cannot be an email.");
            }
          }
        }
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [3, 256],
          isEmail: true
        }
      },
      hashedPassword: {
        type: DataTypes.STRING.BINARY,
        allowNull: false,
        validate: {
          len: [60, 60]
        }
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull:false,
        isAlpha:true,
      },
      lastName: {
        type:DataTypes.STRING,
        allowNull:false,
        isAlpha:true,
      },
    },
    {
      sequelize,
      modelName: "User",
      defaultScope: {
        attributes: {
          exclude: ["hashedPassword", "email", "createdAt", "updatedAt"]
        }
      }
    }
  );
  return User;
};
