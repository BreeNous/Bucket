// Local Modules
const routes = require('./controllers');
const helpers = require('./utils/helpers');

// Third-Party Modules
const path = require('path');
const express = require('express');
const session = require('express-session');
const exphbs = require('express-handlebars');

const sequelize = require('./config/connection');
// Create a new sequelize store using the express-session package
const SequelizeStore = require('connect-session-sequelize')(session.Store);

// Initialize an instance of Express.js
const app = express();
// Specify on which port the Express.js server will run
const PORT = process.env.PORT || 3001;

// Set up Handlebars.js as the default engine with custom helpers
const hbs = exphbs.create({
  helpers, // Keep your existing helpers
  extname: ".handlebars", // Ensure correct file extension
  partialsDir: path.join(__dirname, "views/partials"),

});

// Sets up session and connect to our Sequelize db
// Configure and link a session object with the sequelize store
const sess = {
  secret: process.env.SESSION_SECRET, // ✅ From .env or Render env vars
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // ✅ True only on Render
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // ✅ Handle cross-origin cookies properly
  },
  resave: false,
  saveUninitialized: false, // ✅ More secure
  store: new SequelizeStore({
    db: sequelize,
  }),
};

// Add express-session and store as Express.js middleware
app.use(session(sess));

// Inform Express.js on which template engine to use
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Static middleware pointing to the public folder
app.use(express.static(path.join(__dirname, 'public')));

app.use("/media", express.static(path.join(__dirname, "media")));

app.use("/private_uploads", express.static(path.join(__dirname, "private_uploads")));


// Servers the routes to the server
app.use(routes);

// Starts the server to begin listening
sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () =>
    console.log(`Now listening on http://localhost:${PORT}`)
  );
});
