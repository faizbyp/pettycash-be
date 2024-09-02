const { getAllFromTable } = require("../models/StandardQuery");
const { getVendorById } = require("../models/VendorModel");

const handleGetAllVendor = async (req, res) => {
  try {
    let result = await getAllFromTable("mst_vendor");
    res.status(200).send({
      message: `Success get vendors`,
      data: result,
    });
  } catch (err) {
    res.status(500).send({
      message: err.stack,
    });
  }
};

const handleGetVendorById = async (req, res) => {
  const id = req.params.id_vendor;
  try {
    let result = await getVendorById(id);
    res.status(200).send({
      message: `Success get vendor ${id}`,
      data: result,
    });
  } catch (err) {
    res.status(500).send({
      message: err.stack,
    });
  }
};

module.exports = {
  handleGetAllVendor,
  handleGetVendorById,
};
