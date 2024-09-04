const { postPO } = require("../models/POModel");

const handlePostPO = async (req, res) => {
  try {
    const payload = req.body.data;
    let result = await postPO(payload);
    res.status(200).send({
      message: "Success add PO",
      id_po: result,
    });
  } catch (error) {
    res.status(500).send({
      message: error.stack,
    });
  }
};

module.exports = {
  handlePostPO,
};
