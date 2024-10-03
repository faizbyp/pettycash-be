const express = require("express");
const { handleGetComparisonReport } = require("../controllers/ReportController");
const router = express.Router();

router.get("/comparison", handleGetComparisonReport);

module.exports = router;
