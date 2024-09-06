const { getCompanyById } = require("../models/CompanyModel");
const { getAllFromTable } = require("../models/StandardQuery");

const handleGetAllCompany = async (req, res) => {
  try {
    let result = await getAllFromTable("mst_company");
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

module.exports = {
  handleGetAllCompany,
  handleGetCompanyById,
};
