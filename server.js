// Local Modules
const routes = require('./controllers');
const helpers = require('./utils/helpers');
const { sess } = require('./config/session');

// Third-Party Modules
const path = require('path');
const express = require('express');
const exphbs = require('express-handlebars');
const sequelize = require('./config/connection');

// tell express to trust Render's proxy allowing cookies to work properly in HTTPS.
app.set('trust proxy', 1); 

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

// Use the session middleware
const session = require('express-session');
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
