const express = require("express");
const VendorController = require("../controllers/VendorController");
const router = express.Router();

router.get("/", VendorController.getAll);

module.exports = router;
