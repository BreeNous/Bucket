const router = require("express").Router();
const { BucketListItem } = require("../../models");
const BucketlistItem = require("../../models/BucketListItem");
const withAuth = require("../../utils/auth");

//create bucketlist item

router.post("/", withAuth, async (req, res) => {
  try {
    const newBucketListItem = await BucketListItem.create({
      ...req.body,
      user_id: req.session.user_id,
    });
    if (!newBucketListItem) {
      res.status(404).json({ message: "No BucketListItem was created!" });
      return;
    }

    res.status(200).json(newBucketListItem);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/:id", withAuth, async (req, res) => {
  try {
    const newBucketListItem = await BucketlistItem.findOne({
      where: { id: req.params.id, user_id: req.session.user_id },
    });
    res.status(200).json(newBucketListItem);
  } catch (err) {
    res.status(500).json(err);
  }
});

// If a DELETE request is made to /api/projects/:id, that project is deleted.
router.delete("/:id", withAuth, async (req, res) => {
  try {
    const BucketListItemData = await BucketListItem.destroy({
      where: {
        id: req.params.id,
        user_id: req.session.user_id,
      },
    });

    if (!BucketListItemData) {
      res
        .status(404)
        .json({ message: "No BucketListItem found with this id!" });
      return;
    }

    res.status(200).json(BucketListItemData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put("/:id", withAuth, async (req, res) => {
  try {
    const [BucketListItemData] = await BucketListItem.update(req.body, {
      where: {
        id: req.params.id,
        user_id: req.session.user_id,
      },
    });

    console.log(BucketListItemData)

    if (!BucketListItemData) {
      res
        .status(404)
        .json({ message: "No BucketListItem found with this id!" });
      return;
    }

    res.status(200).end();
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
