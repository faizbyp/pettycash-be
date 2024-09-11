const express = require("express");
const {
  handleGetAllVendor,
  handleGetVendorById,
  handleAddVendor,
} = require("../controllers/VendorController");
const router = express.Router();

router.get("/", handleGetAllVendor);
router.get("/:id_vendor", handleGetVendorById);
router.post("/", handleAddVendor);

module.exports = router;
