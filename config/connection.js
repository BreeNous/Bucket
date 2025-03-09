const Sequelize = require("sequelize");
require("dotenv").config();

let sequelize;

if (process.env.DATABASE_URL) {
  // 🔹 Use Render database when deployed
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true, // Ensure SSL is used for Render
        rejectUnauthorized: false,
      },
    },
  });
} else {
  // 🔹 Use local PostgreSQL when working locally
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: "postgres",
      port: process.env.DB_PORT,
    }
  );
}

module.exports = sequelize;
