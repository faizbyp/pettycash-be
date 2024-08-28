const Item = require("../models/itemModel");

const ItemController = {
  getAll: async (req, res) => {
    try {
      let result = await Item.getAll();
      res.status(200).send({
        message: `Success get items`,
        data: result,
      });
    } catch (err) {
      res.status(500).send({
        message: err.stack,
      });
    }
  },
};

module.exports = ItemController;
