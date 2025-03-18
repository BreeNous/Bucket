const router = require('express').Router();
const { BucketListItem, User } = require('../models');
const withAuth = require('../utils/auth');

router.get('/', async (req, res) => {
  try {
    // Get all BucketListItems and JOIN with user data
    const BucketListItemData = await BucketListItem.findAll({
      include: [
        {
          model: User,
          attributes: ['name'],
        },
      ],
    });

    // Serialize data so the template can read it
    const BucketListItems = BucketListItemData.map((BucketListItem) => BucketListItem.get({ plain: true }));

    // Pass serialized data and session flag into template
    res.render('landing', { 
      BucketListItems, 
      logged_in: req.session.logged_in 
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/BucketListItem/:id', async (req, res) => {
  try {
    const BucketListItemData = await BucketListItem.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['name'],
        },
      ],
    });

    const BucketListItem = BucketListItemData.get({ plain: true });

    res.render('BucketListItem', {
      ...BucketListItem,
      logged_in: req.session.logged_in
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Use withAuth middleware to prevent access to route
router.get('/myList', withAuth, async (req, res) => {
  try {
    // Find the logged in user based on the session ID
    const userData = await User.findByPk(req.session.user_id, {
      attributes: { exclude: ['password'] },
      include: [BucketListItem],
    });

    const user = userData.get({ plain: true });

    console.log(user);

    res.render('myList', {
      ...user,
      logged_in: true
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
