const {
  getCompanyById,
  getAllCompany,
  addCompany,
  editCompany,
} = require("../models/CompanyModel");
const { getAllFromTable } = require("../models/StandardQuery");

const handleGetAllCompany = async (req, res) => {
  const type = req.query.type || null;
  const group = req.query.group || null;
  try {
    let result = await getAllCompany(type, group);
    res.status(200).send({
      message: `Success get companies`,
      data: result,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const handleGetCompanyById = async (req, res) => {
  const id = req.params.id_company;
  try {
    let result = await getCompanyById(id);
    res.status(200).send({
      message: `Success get company ${id}`,
      data: result,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const handleAddCompany = async (req, res) => {
  const payload = req.body;
  try {
    let result = await addCompany(payload);
    res.status(200).send({
      message: `Success add company`,
      data: result,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const handleEditCompany = async (req, res) => {
  const payload = req.body;
  const id_company = req.params.id_company;
  try {
    let result = await editCompany(payload, id_company);
    res.status(200).send({
      message: `Success edit company: ${id_company}`,
      data: result,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

module.exports = {
  handleGetAllCompany,
  handleGetCompanyById,
  handleAddCompany,
  handleEditCompany,
};
