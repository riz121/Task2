const express = require("express");
const multer = require("multer");
const xlsx = require("xlsx");
const Food = require("../model/Food");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "../uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Upload and process Excel
router.post("/excel", upload.single("file"), async (req, res) => {
  try {
    // Read Excel
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
      defval: null, // keep empty cells as null
    });

    if (sheetData.length === 0) {
      return res.status(400).json({ message: "Excel file is empty" });
    }

    // 🔹 First row already converted by `xlsx` as keys
    // Example: [ { name: "Rizwan", age: 27 }, { name: "Hamza", age: 30 } ]

    // Create dynamic collection name (e.g., file name without extension)
    const collectionName = req.file.originalname.split(".")[0];

    // Insert into MongoDB (dynamic collection)
    const Model = mongoose.connection.collection(collectionName);
    await Model.insertMany(sheetData);

    res.json({
      message: "Excel uploaded and data inserted successfully",
      collection: collectionName,
      insertedCount: sheetData.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error processing file", error });
  }
});

module.exports = router;
