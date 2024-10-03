const { v4: uuidv4 } = require("uuid");
const { parseFormUpload } = require("../helper/fileUpload");
const { postGR, getGRByUser, getGRById } = require("../models/GRModel");
const { postGRItem } = require("../models/GRItemModel");
const { getRemainingItem } = require("../models/POItemModel");
const { getPOById, updatePOCompletion } = require("../models/POModel");
const { getComparisonReport } = require("../models/ReportModel");

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

module.exports = { handleGetComparisonReport };
