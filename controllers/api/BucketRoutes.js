const router = require("express").Router();
const { BucketListItem } = require("../../models");
const BucketlistItem = require("../../models/BucketListItem");
const withAuth = require("../../utils/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

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

// Configure Multer storage
const storage = multer.diskStorage({
  destination: path.join(__dirname, "../../private_uploads/"), // ✅ New private path
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});


const upload = multer({ storage });

// Upload an Image for an Existing Bucket List Item
router.post("/:id/upload", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      console.log("❌ No image uploaded.");
      return res.status(400).json({ message: "No image uploaded" });
    }

    const imageUrl = `private_uploads/${req.file.filename}`; // ✅ Correct path for private storage
    console.log(`✅ Saving image: ${imageUrl} for bucket list item ID: ${id}`);

    const updatedItem = await BucketListItem.update(
      { image: imageUrl },
      { where: { id } }
    );

    if (updatedItem[0] > 0) {
      console.log("✅ Image successfully saved to database.");
      res.status(200).json({ imageUrl });
    } else {
      console.log("❌ Failed to update database.");
      res.status(404).json({ message: "Bucket list item not found" });
    }
  } catch (error) {
    console.error("❌ Error uploading image:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


// Protected image route (only logged-in users can access their own images)
router.get("/:id/image", withAuth, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Fetching image for bucket list item ID: ${id}`);
    console.log(`👤 Logged-in user ID: ${req.session.user_id}`);

    // Find the bucket list item and ensure it belongs to the logged-in user
    const item = await BucketListItem.findOne({
      where: { id, user_id: req.session.user_id },
    });

    if (!item || !item.image) {
      console.log("❌ Image not found in database or unauthorized access.");
      return res.status(404).json({ message: "Image not found or unauthorized" });
    }

    const imagePath = path.join(__dirname, "../../", item.image);
    console.log(`📂 Serving image from: ${imagePath}`);

    if (fs.existsSync(imagePath)) {
      res.sendFile(imagePath);
    } else {
      console.log("❌ Image file not found on disk.");
      res.status(404).json({ message: "Image file not found" });
    }
  } catch (error) {
    console.error("❌ Error fetching image:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


module.exports = router;
