const { getAllFromTable } = require("../models/StandardQuery");

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

module.exports = {
  handleGetAllUOM,
};
