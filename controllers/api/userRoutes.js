const router = require('express').Router();
const { User, BucketListItem } = require('../../models');
const withAuth = require('../../utils/auth');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');


// post route for user data to landing
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

// Forgot password route
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'Email not found' });

    const token = crypto.randomBytes(32).toString('hex');
    const expiration = Date.now() + 3600000; // 1 hour

    await user.update({ resetToken: token, resetTokenExpires: expiration });

    // Set up transporter (use real email creds in production)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,  // your Gmail
        pass: process.env.EMAIL_PASS,  // app password
      }
    });

    const resetUrl = `${process.env.BASE_URL}/reset-password/${token}`;
    await transporter.sendMail({
      to: user.email,
      subject: 'Password Reset',
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`
    });

    res.json({ message: 'Password reset email sent.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error sending reset email' });
  }
});

// reset password route
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpires: { [Op.gt]: Date.now() },
      }
    });

    if (!user) return res.status(400).json({ message: 'Token invalid or expired' });

    user.password = password; // hook will hash
    user.resetToken = null;
    user.resetTokenExpires = null;
    await user.save();

    res.json({ message: 'Password updated successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Could not reset password' });
  }
});

module.exports = router;
