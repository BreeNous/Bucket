const router = require("express").Router();
const { BucketListItem } = require("../../models");
const BucketlistItem = require("../../models/BucketListItem");
const withAuth = require("../../utils/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

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

// POST ROUTE: for creating a new bucketlist item.
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

// GET ROUTE: get all bucket list items for the logged-in user.
router.get("/", async (req, res) => {
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

// GET ROUTE: get one bucketlist item for the logged-in user.
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

// POST ROUTE: for uploading an image and updating the bucketlist item.
router.post("/:id/upload", withAuth, upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if file was uploaded
    if (!req.file) {
      console.log("❌ No image uploaded.");
      return res.status(400).json({ message: "No image uploaded." });
    }

    // Find the bucket list item to ensure it exists and belongs to the logged-in user
    const item = await BucketListItem.findOne({ where: { id, user_id: req.session.user_id } });

    if (!item) {
      console.log(`❌ No bucket list item found for ID: ${id}`);
      return res.status(404).json({ message: "Bucket list item not found." });
    }

    // Delete existing image from disk if there is one
    if (item.image) {
      const oldImagePath = path.resolve(__dirname, "../../", item.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
        console.log(`🗑️ Old image deleted: ${oldImagePath}`);
      }
    }

    // Save new image path in DB (only relative path saved)
    const newImagePath = `private_uploads/${req.file.filename}`;

    await BucketListItem.update(
      { image: newImagePath },
      { where: { id } }
    );

    console.log(`✅ Image path updated in DB: ${newImagePath}`);

    // Return success and new image path
    res.status(200).json({ message: "Image uploaded successfully.", imageUrl: newImagePath });

  } catch (error) {
    console.error("❌ Error uploading image:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// GET ROUTE: gets image from the db and disk via protected image route (only logged-in users can access their own images).
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

// PUT ROUTE: for updating a bucketlist item.
router.put("/:id", withAuth, async (req, res) => {
  try {
    const { item, description, completed } = req.body; // Include 'completed' field

    const [updated] = await BucketListItem.update(
      { item, description, completed }, // Update completed
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

// DELETE ROUTE: delete an image from database and disk.
router.delete("/:id/image", withAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Find item by ID and user session
    const item = await BucketListItem.findOne({
      where: { id, user_id: req.session.user_id },
    });

    if (!item) {
      return res.status(404).json({ message: "Bucket list item not found." });
    }

    if (!item.image) {
      return res.status(404).json({ message: "No image associated with this item." });
    }

    // Path relative to project root
    const imageRelativePath = item.image;
    const imagePath = path.resolve(__dirname, "../../", imageRelativePath);

    // Safely check if file exists, then delete
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      console.log(`✅ Deleted image file from disk: ${imagePath}`);
    } else {
      console.warn(`⚠️ File does not exist on disk: ${imagePath}`);
    }

    // Set image field to null in DB
    await BucketListItem.update({ image: null }, { where: { id } });

    console.log(`✅ Image reference removed from DB for item ID: ${id}`);
    res.status(200).json({ message: "Image deleted successfully." });

  } catch (error) {
    console.error("❌ Error deleting image:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// DELETE ROUTE: delete a bucketlist item and its image from disk
router.delete("/:id", withAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Find the bucket list item to get its image path before deletion
    const item = await BucketListItem.findOne({
      where: { id, user_id: req.session.user_id },
    });

    if (!item) {
      return res.status(404).json({ message: "No BucketListItem found with this id!" });
    }

    // If there's an associated image, delete it from disk
    if (item.image) {
      const imagePath = path.resolve(__dirname, "../../", item.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // ✅ Delete image file from disk
        console.log(`🗑️ Deleted image file from disk: ${imagePath}`);
      }
    }

    // Now delete the bucket list item from DB
    await BucketListItem.destroy({
      where: {
        id: id,
        user_id: req.session.user_id,
      },
    });

    res.status(200).json({ message: "Bucket list item and associated image deleted successfully." });
  } catch (err) {
    console.error("❌ Error deleting bucket list item and image:", err);
    res.status(500).json({ message: "Failed to delete item." });
  }
});

module.exports = router;
