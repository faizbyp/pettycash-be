const { postPOItem } = require("../models/POItemModel");
const { postPO, getPOByUser } = require("../models/POModel");
const { v4: uuidv4 } = require("uuid");

const handlePostPO = async (req, res) => {
  try {
    let payload = req.body.data;
    let itemPayload = payload.items;

    // PO payload
    delete payload.items;
    payload = {
      ...payload,
      ppn: payload.ppn ? 0.11 : 0,
    };
    console.log(payload);
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
      message: error.message,
    });
  }
};

const handleGetPOByUser = async (req, res) => {
  const id_user = req.params.id_user;
  try {
    const result = await getPOByUser(id_user);
    console.log(result);
    res.status(200).send({
      message: `Success get user PO: ${id_user}`,
      data: result,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

module.exports = {
  handlePostPO,
  handleGetPOByUser,
};
