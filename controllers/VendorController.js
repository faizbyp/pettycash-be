const Vendor = require("../models/VendorModel");

const VendorController = {
  getAll: async (req, res) => {
    try {
      let result = await Vendor.getAll();
      res.status(200).send({
        message: `Success get vendor`,
        data: result,
      });
    } catch (err) {
      res.status(500).send({
        message: err.stack,
      });
    }
  },
};

module.exports = VendorController;
