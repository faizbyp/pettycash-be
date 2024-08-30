const { getAll } = require("../models/StandardQuery");

const CompanyController = {
  getAll: async (req, res) => {
    try {
      let result = await getAll("mst_company");
      res.status(200).send({
        message: `Success get companies`,
        data: result,
      });
    } catch (err) {
      res.status(500).send({
        message: err.stack,
      });
    }
  },
};

module.exports = CompanyController;
