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
        models.Group, {
        foreignKey: 'groupId',
        onDelete:'CASCADE'
      },
      ),
        Event.belongsTo(
          models.Venue, {
          foreignKey: 'venueId'
        },
        ),
        Event.belongsToMany(
          models.User, {
          through:
            models.Attendee,
          foreignKey: 'eventId',
          otherKey: 'userId'
        }
        )
      Event.hasMany(
        models.Image, {
        foreignKey: 'imageableId',
        constraints: false,
        scope: {
          imageableType: 'Event'
        }
      }
      )
    }
  }
  Event.init({
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    venueId: {
      type: DataTypes.INTEGER,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        // isAlphanumeric:true,
        len: {
          args: [5],
          msg: "Name must be at least 5 characters"
        },
      },
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        // equals:{
        //   args:[['Online', 'In person']],
        //   msg: 'Type must be Online or In person',
        // }
      },
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: {
          args: true,
          msg: "Capacity must be an integer",
        }
      },
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      // validate: {
      //   isValidPrice(value) {
      //     if (value <= 0) {
      //       throw new Error('Price is invalid')
      //     }
      //   }
      // },
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: "Description is required"
        },
      },
    },
    hostFirstName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    hostLastName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isNotInPast(value) {
          if (new Date(value) < new Date()) {
            throw new Error('Start date must be in the future')
          }
        },
      },
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isEndDateAfterStartDate(value) {
          if (new Date(value) <= new Date(this.startDate)) {
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
