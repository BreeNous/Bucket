const sequelize = require('../config/connection');
const { User, BucketListItem } = require('../models');

const userData = require('./userData.json');
const BucketListItems = require('./BucketListItem.json');

const seedDatabase = async () => {
  await sequelize.sync({ force: true });

  const users = await User.bulkCreate(userData, {
    individualHooks: true,
    returning: true,
  });

  for (const bucketListItem of BucketListItems) {
    await BucketListItem.create({
      ...bucketListItem,
      user_id: users[Math.floor(Math.random() * users.length)].id,
    });
  }

  process.exit(0);
};

seedDatabase();
