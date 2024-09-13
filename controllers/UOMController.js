const { getAllFromTable } = require("../models/StandardQuery");
const { addUOM } = require("../models/UOMModel");

const handleGetAllUOM = async (req, res) => {
  try {
    let result = await getAllFromTable("mst_uom");
    res.status(200).send({
      message: `Success get UOM`,
      data: result,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const handleAddUOM = async (req, res) => {
  const payload = req.body;
  try {
    let result = await addUOM(payload);
    res.status(200).send({
      message: `Success add UOM`,
      data: result,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

module.exports = {
  handleGetAllUOM,
  handleAddUOM,
};
