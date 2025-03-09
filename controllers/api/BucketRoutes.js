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
    const { item, category, description, completed } = req.body; // ✅ Include 'completed' field

    const [updated] = await BucketListItem.update(
      { item, category, description, completed }, // ✅ Update completed
      { where: { id: req.params.id, user_id: req.session.user_id } }
    );

    if (!updated) {
      return res.status(404).json({ message: "No BucketListItem found with this id!" });
    }

    res.status(200).json({ message: "Item updated successfully." });
  } catch (err) {
    console.error("❌ Error updating item:", err);
    res.status(500).json(err);
  }
});


const uploadDir = path.join(__dirname, "../../private_uploads/");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true }); // Ensure directory exists
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Save images in `private_uploads/`
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
  },
});

const upload = multer({ storage });

router.post("/:id/upload", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      console.log("❌ No image uploaded.");
      return res.status(400).json({ message: "No image uploaded" });
    }

    console.log(`✅ File uploaded: ${req.file.path}`); 
    console.log(`📂 Checking if file exists on disk: ${fs.existsSync(req.file.path)}`);

    const imageUrl = `private_uploads/${req.file.filename}`;
    console.log(`✅ Saving image path to DB: ${imageUrl}`);

    // 🔹 Validate that the item exists before updating
    const item = await BucketListItem.findOne({ where: { id } });

    if (!item) {
      console.log(`❌ No bucket list item found for ID: ${id}`);
      return res.status(404).json({ message: "Bucket list item not found" });
    }

    // ✅ Update the database entry with the new image URL
    await BucketListItem.update(
      { image: imageUrl },
      { where: { id } }
    );

    console.log(`🛠 Image path successfully updated in DB: ${imageUrl}`);

    // ✅ Fetch the updated item to verify the change
    const updatedItem = await BucketListItem.findOne({ where: { id } });

    if (!updatedItem || !updatedItem.image) {
      console.log("❌ Image update failed, no image found in DB.");
      return res.status(500).json({ message: "Failed to update image in database" });
    }

    console.log("✅ Image successfully saved to database.");
    res.status(200).json({ imageUrl });

  } catch (error) {
    console.error("❌ Error uploading image:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all bucket list items for the logged-in user
router.get("/", withAuth, async (req, res) => {
  try {
    const items = await BucketListItem.findAll({
      where: { user_id: req.session.user_id },
    });

    res.status(200).json(items); // Always return an array, even if empty
  } catch (error) {
    console.error("❌ Error fetching bucket list items:", error);
    res.status(500).json({ message: "Server error" });
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

// route for deleting an image from database and storage
router.delete("/:id/image", withAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const item = await BucketListItem.findOne({
      where: { id, user_id: req.session.user_id },
    });

    if (!item || !item.image) {
      return res.status(404).json({ message: "Image not found" });
    }

    const imagePath = path.join(__dirname, "../../", item.image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      console.log(`✅ Deleted image file: ${imagePath}`);
    }

    await BucketListItem.update({ image: null }, { where: { id } });

    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting image:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});



module.exports = router;
