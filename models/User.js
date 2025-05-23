const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../config/connection');

class User extends Model {
  // Checks the password against the encrypted password in the database.
  checkPassword(loginPw) {
    return bcrypt.compareSync(loginPw, this.password);
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [8, 100],
          msg: "Password must be at least 8 characters long."
        },
        isStrong(value) {
          const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W)[^\s]{8,}$/;
          if (!strongRegex.test(value)) {
            throw new Error(
              "Password must contain at least one uppercase, one lowercase, one special character, and no spaces."
            );
          }
        }
      }
    },
    
    resetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetTokenExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },

  },
  {
    // Hooks are used so that if a user is created or updated, the password is encrypted before being stored in the database.
    hooks: {
      beforeCreate: async (newUserData) => {
        newUserData.password = await bcrypt.hash(newUserData.password, 10);
        return newUserData;
      },
      beforeUpdate: async (updatedUserData) => {
        if (updatedUserData.changed('password')) {
          updatedUserData.password = await bcrypt.hash(updatedUserData.password, 10);
        }
        return updatedUserData;
      }

    },
    sequelize,
    timestamps: false,
    freezeTableName: true,
    underscored: true,
    modelName: 'user',
  }
);

module.exports = User;
