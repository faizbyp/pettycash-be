const { v4: uuidv4 } = require("uuid");
const { parseFormUpload } = require("../helper/fileUpload");
const { postGR, getGRByUser, getGRById } = require("../models/GRModel");
const { postGRItem } = require("../models/GRItemModel");
const { getRemainingItem } = require("../models/POItemModel");
const { getPOById, updatePOCompletion } = require("../models/POModel");
const { getComparisonReport, generateComparisonExcel } = require("../models/ReportModel");

const handleGetComparisonReport = async (req, res) => {
  const gr_date = req.query.gr_date || null;
  const po_date = req.query.po_date || null;
  const company = req.query.company ? req.query.company + "%" : null;

  try {
    let result = await getComparisonReport(gr_date, po_date, company);
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
  const po_date = req.query.po_date || null;
  const gr_date = req.query.gr_date || null;
  const company = req.query.company ? req.query.company + "%" : null;

  try {
    const data = await generateComparisonExcel(gr_date, po_date, company);

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
