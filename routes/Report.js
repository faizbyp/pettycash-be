const express = require("express");
const {
  handleGetComparisonReport,
  handleGenerateComparison,
  handleGetChartData,
} = require("../controllers/ReportController");
const router = express.Router();

router.get("/chart", handleGetChartData);
router.get("/comparison", handleGetComparisonReport);
router.get("/comparison/xlsx", handleGenerateComparison);

module.exports = router;
