const { postPOItem } = require("../models/POItemModel");
const { v4: uuidv4 } = require("uuid");
const { parseFormUpload } = require("../helper/fileUpload");
const { postGR } = require("../models/GRModel");
const { postGRItem } = require("../models/GRItemModel");

const handlePostGR = async (req, res) => {
  try {
    let { payload, filename } = await parseFormUpload(req, {
      uploadDir: "/invoice",
    });
    let itemPayload = payload.items;

    // GR payload
    delete payload.items;
    payload = {
      ...payload,
      id_gr: uuidv4(),
      ppn: payload.ppn ? 0.11 : 0,
      invoice_file: filename,
    };
    console.log("payload", payload);
    let result = await postGR(payload);
    // GR item payload
    itemPayload = itemPayload.map((item) => {
      delete item.description;
      delete item.id_po;
      delete item.uom;
      return {
        ...item,
        id_gr_item: uuidv4(),
        id_gr: result,
      };
    });
    console.log("item payload", itemPayload);
    await postGRItem(itemPayload);

    res.status(200).send({
      message: "Success create Order Confirmation",
      // id_po: result,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

module.exports = { handlePostGR };
