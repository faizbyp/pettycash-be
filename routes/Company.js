const express = require("express");
const {
  handleGetAllCompany,
  handleGetCompanyById,
  handleAddCompany,
  handleEditCompany,
} = require("../controllers/CompanyController");
const isAuth = require("../middleware/auth");
const router = express.Router();

router.get("/", isAuth, handleGetAllCompany);
router.post("/", isAuth, handleAddCompany);
router.get("/:id_company", isAuth, handleGetCompanyById);
router.patch("/:id_company", isAuth, handleEditCompany);

module.exports = router;
