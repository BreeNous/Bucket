const router = require('express').Router();
const { User, BucketListItem } = require('../../models');
const withAuth = require('../../utils/auth');

// post route for user data to landing / checking if user already exists
router.post('/', async (req, res) => {
  try {
    const existingUser = await User.findOne({ where: { email: req.body.email } });
    if (existingUser) {
      return res.status(409).json({ message: 'An account already exists for this email. Please log in.' });
    }

    const userData = await User.create(req.body); // Sequelize will validate here

    req.session.save(() => {
      req.session.user_id = userData.id;
      req.session.logged_in = true;
      res.status(200).json(userData);
    });

  // ✅ In userRoutes.js
} catch (err) {
  console.error(err);

  // Check for Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({ message: 'Your password must be at least 8 characters long.' });
  }

  res.status(500).json({ message: 'Signup failed. Please try again.' });
}

});



// post route for login
router.post('/login', async (req, res) => {
  try {
    const userData = await User.findOne({ where: { email: req.body.email } });

    if (!userData) {
      res
        .status(400)
        .json({ message: 'Incorrect email or password, please try again' });
      return;
    }

    const validPassword = await userData.checkPassword(req.body.password);

    if (!validPassword) {
      res
        .status(400)
        .json({ message: 'Incorrect email or password, please try again' });
      return;
    }

    req.session.save(() => {
      req.session.user_id = userData.id;
      req.session.logged_in = true;

      console.log('✅ Logged in, session:', req.session);
      
      res.json({ user: userData, message: 'You are now logged in!' });
    });

  } catch (err) {
    res.status(400).json(err);
  }
});

// post route for logout
router.post('/logout', (req, res) => {
  if (req.session.logged_in) {
    req.session.destroy(() => {
      res.status(204).end();
    });
  } else {
    res.status(404).end();
  }
});

// ✅ DELETE route to delete user account and their bucket list items
router.delete('/delete-account', withAuth, async (req, res) => {
  try {
    const userId = req.session.user_id;

    // Delete user's bucket list items first
    await BucketListItem.destroy({ where: { user_id: userId } });

    // Delete user account
    await User.destroy({ where: { id: userId } });

    // End user session
    req.session.destroy(() => {
      res.status(200).json({ message: 'Account deleted successfully'});
    });

  } catch (err) {
    console.error('❌ Error deleting account:', err);
    res.status(500).json({ message: 'Failed to delete account.' });
  }
});

// temp route
router.get('/session-check', async (req, res) => {
  try {
    const allSessions = await Session.findAll();
    console.log("📦 All stored sessions:", allSessions.map(s => s.dataValues));

    res.status(200).json(allSessions.map(s => s.dataValues));
  } catch (err) {
    console.error("❌ Error fetching sessions:", err);
    res.status(500).json({ message: "Error fetching sessions." });
  }
});



module.exports = router;
