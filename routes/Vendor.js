const express = require("express");
const {
  handleGetAllVendor,
  handleGetVendorById,
  handleAddVendor,
  handleEditVendor,
} = require("../controllers/VendorController");
const isAuth = require("../middleware/auth");
const router = express.Router();

router.get("/", isAuth, handleGetAllVendor);
router.get("/:id_vendor", isAuth, handleGetVendorById);
router.patch("/:id_vendor", isAuth, handleEditVendor);
router.post("/", isAuth, handleAddVendor);

module.exports = router;
