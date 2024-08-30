const express = require("express");
const CompanyController = require("../controllers/CompanyController");
const router = express.Router();

router.get("/", CompanyController.getAll);

module.exports = router;
