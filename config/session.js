
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const sequelize = require('./connection'); // ✅ Reuse the connection

const store = new SequelizeStore({
  db: sequelize,
});

const sess = {
  secret: process.env.SESSION_SECRET,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  },
  resave: false,
  saveUninitialized: false,
  store,
};

module.exports = { sess, store };
