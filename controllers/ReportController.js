const { v4: uuidv4 } = require("uuid");
const { parseFormUpload } = require("../helper/fileUpload");
const { postGR, getGRByUser, getGRById } = require("../models/GRModel");
const { postGRItem } = require("../models/GRItemModel");
const { getRemainingItem } = require("../models/POItemModel");
const { getPOById, updatePOCompletion } = require("../models/POModel");
const { getComparisonReport, generateComparisonExcel } = require("../models/ReportModel");

const handleGetComparisonReport = async (req, res) => {
  try {
    let result = await getComparisonReport();
    res.status(200).send({
      message: `Success get comparison`,
      data: result,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const handleGenerateComparison = async (req, res) => {
  try {
    const data = await generateComparisonExcel();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=" + "data.xlsx");

    await data.xlsx.write(res);
    res.status(200);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).send({
      messsage: error.message,
    });
  }
};

module.exports = { handleGetComparisonReport, handleGenerateComparison };