const { postPO } = require("../models/POModel");

const handlePostPO = async (req, res) => {
  try {
    const payload = req.body.data;
    let result = await postPO(payload);
    res.status(200).send({
      message: "Success add PO",
      id_po: result,
    });
  } catch (err) {
    res.status(500).send({
      message: err.stack,
    });
  }
};

module.exports = {
  handlePostPO,
};
