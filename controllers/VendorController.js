const { getAllFromTable } = require("../models/StandardQuery");
const { getVendorById, addVendor, editVendor } = require("../models/VendorModel");

const handleGetAllVendor = async (req, res) => {
  try {
    let result = await getAllFromTable("mst_vendor");
    res.status(200).send({
      message: `Success get vendors`,
      data: result,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
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
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const handleAddVendor = async (req, res) => {
  const payload = req.body;
  try {
    let result = await addVendor(payload);
    res.status(200).send({
      message: `Success add vendor`,
      data: result,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const handleEditVendor = async (req, res) => {
  const payload = req.body;
  const id_vendor = req.params.id_vendor;
  try {
    let result = await editVendor(payload, id_vendor);
    res.status(200).send({
      message: `Success edit vendor: ${id_vendor}`,
      data: result,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

module.exports = {
  handleGetAllVendor,
  handleGetVendorById,
  handleAddVendor,
  handleEditVendor,
};
