'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Image extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Image.belongsTo(
        models.Group,{
          foreignKey:'imageableId',
          constraints:false,
          scope:{
            imageableType:'Group'
          },
        }
      )
      Image.belongsTo(
        models.Event,{
          foreignKey:'imageableId',
          constraints:false,
          scope:{
            imageableType:'Event'
          },
        }
      )
    }
  }
  Image.init({
    url:{
      type:DataTypes.STRING,
      allowNull:false,
    },
    preview:{
      type:DataTypes.BOOLEAN,
      allowNull:false,
    },
    imageableType:{
      type:DataTypes.STRING,
      allowNull:false,
    },
    imageableId:{
      type:DataTypes.INTEGER,
      allowNull:false,
    },
  }, {
    sequelize,
    modelName: 'Image',
  });
  return Image;
};
