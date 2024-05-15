const User = require('./User');
const Project = require('./Project');

// Creates a relationship between User and Project model, with the User having a "has many" relationship with Project model.
User.hasMany(Project, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE'
});

// Creates a relationship between User and Project model, with a "belongs to" relationship of the Project to the User.
Project.belongsTo(User, {
  foreignKey: 'user_id'
});

module.exports = { User, Project };
