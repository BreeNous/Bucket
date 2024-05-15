const router = require('express').Router();
const { BucketListItem } = require('../../models');
const withAuth = require('../../utils/auth');

router.post('/', withAuth, async (req, res) => {
  try {
    const newBucketListItem = await BucketListItem.create({
      ...req.body,
      user_id: req.session.user_id,
    });

const router = require('express').Router();
const { Project } = require('../../models');
const withAuth = require('../../utils/auth');;

// If a POST request is made to /api/projects, a new project is created. If there is an error, the function returns with a 400 error. 
router.post('/', async (req, res) => {
  try {
    const newProject = await Project.create({
      ...req.body,
      user_id: req.session.user_id,
    });

    res.status(200).json(newBucketListItem);

  } catch (err) {
    res.status(400).json(err);
  }
});


// If a DELETE request is made to /api/projects/:id, that project is deleted. 
router.delete('/:id', withAuth, async (req, res) => {
  try {
    const BucketListItemData = await BucketListItem.destroy({
      
      where: {
        id: req.params.id,
        user_id: req.session.user_id,
      },
    });

    if (!BucketListItemData) {
      res.status(404).json({ message: 'No BucketListItem found with this id!' });
      return;
    }

    res.status(200).json(BucketListItemData);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
