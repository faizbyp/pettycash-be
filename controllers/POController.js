const { postPOItem } = require("../models/POItemModel");
const { postPO } = require("../models/POModel");
const { v4: uuidv4 } = require("uuid");

const handlePostPO = async (req, res) => {
  try {
    const payload = req.body.data;
    let itemPayload = payload.items;

    // PO payload
    delete payload.items;
    let result = await postPO(payload);
    // PO item payload
    itemPayload = itemPayload.map((item) => ({
      ...item,
      id_po_item: uuidv4(),
      id_po: result,
    }));
    console.log(itemPayload);
    await postPOItem(itemPayload);

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
