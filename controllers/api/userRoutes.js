const router = require('express').Router();
const { User, BucketListItem } = require('../../models');
const withAuth = require('../../utils/auth');

// post route for user data to homepage
router.post('/', async (req, res) => {
  try {
    const userData = await User.create(req.body);

    req.session.save(() => {
      req.session.user_id = userData.id;
      req.session.logged_in = true;

      res.status(200).json(userData);
    });
  } catch (err) {
    res.status(400).json(err);
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
      
      res.json({ user: userData, message: 'You are now logged in!' });
    });

  } catch (err) {
    res.status(400).json(err);
  }
});

// GET route to render login page
router.get('/login', (req, res) => {
  // Redirect to profile if already logged in
  if (req.session.logged_in) {
    return res.redirect('/profile');
  }
  // Render login page
  res.render('login');
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


module.exports = router;
