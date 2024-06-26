const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');


// Create Project model and datatypes, including the user_id foreign key.
class BucketlistItem extends Model {}

BucketlistItem.init(
  {
    item: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
     completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'user',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    underscored: true,
    modelName: 'bucketlistitem',
  }
);

module.exports = BucketlistItem;
