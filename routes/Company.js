const express = require("express");
const {
  handleGetAllCompany,
  handleGetCompanyById,
  handleAddCompany,
  handleEditCompany,
} = require("../controllers/CompanyController");
const router = express.Router();

router.get("/", handleGetAllCompany);
router.post("/", handleAddCompany);
router.get("/:id_company", handleGetCompanyById);
router.patch("/:id_company", handleEditCompany);

module.exports = router;
