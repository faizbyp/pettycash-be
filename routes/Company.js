const express = require("express");
const {
  handleGetAllCompany,
  handleGetCompanyById,
  handleAddCompany,
} = require("../controllers/CompanyController");
const router = express.Router();

router.get("/", handleGetAllCompany);
router.post("/", handleAddCompany);
router.get("/:id_company", handleGetCompanyById);

module.exports = router;
