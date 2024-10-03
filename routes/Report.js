const express = require("express");
const {
  handleGetComparisonReport,
  handleGenerateComparison,
} = require("../controllers/ReportController");
const router = express.Router();

router.get("/comparison", handleGetComparisonReport);
router.get("/comparison/xlsx", handleGenerateComparison);

module.exports = router;
