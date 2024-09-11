const express = require("express");
const {
  handleGetAllVendor,
  handleGetVendorById,
  handleAddVendor,
  handleEditVendor,
} = require("../controllers/VendorController");
const router = express.Router();

router.get("/", handleGetAllVendor);
router.get("/:id_vendor", handleGetVendorById);
router.patch("/:id_vendor", handleEditVendor);
router.post("/", handleAddVendor);

module.exports = router;
