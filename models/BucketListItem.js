const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");

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
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    image: {
      type: DataTypes.STRING, // Store image URL
      allowNull: true, // Allow empty if no image uploaded
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "user",
        key: "id",
      },
    },
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    underscored: true,
    modelName: "bucketlistitem",
  }
);

module.exports = BucketlistItem;
