const { getCompanyById } = require("../models/CompanyModel");
const { getAllFromTable } = require("../models/StandardQuery");

const handleGetAllCompany = async (req, res) => {
  try {
    let result = await getAllFromTable("mst_company");
    res.status(200).send({
      message: `Success get companies`,
      data: result,
    });
  } catch (err) {
    res.status(500).send({
      message: err.stack,
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
  } catch (err) {
    res.status(500).send({
      message: err.stack,
    });
  }
};

module.exports = {
  handleGetAllCompany,
  handleGetCompanyById,
};
