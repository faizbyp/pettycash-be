const express = require("express");
const { handleGetAllVendor, handleGetVendorById } = require("../controllers/VendorController");
const router = express.Router();

router.get("/", handleGetAllVendor);
router.get("/:id_vendor", handleGetVendorById);

module.exports = router;
