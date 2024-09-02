const express = require("express");
const { handleGetAllCompany, handleGetCompanyById } = require("../controllers/CompanyController");
const router = express.Router();

router.get("/", handleGetAllCompany);
router.get("/:id_company", handleGetCompanyById);

module.exports = router;
