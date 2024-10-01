const { v4: uuidv4 } = require("uuid");
const { parseFormUpload } = require("../helper/fileUpload");
const { postGR, getGRByUser, getGRById } = require("../models/GRModel");
const { postGRItem } = require("../models/GRItemModel");
const { getRemainingItem } = require("../models/POItemModel");
const { getPOById, updatePOCompletion } = require("../models/POModel");

const handleGetPOForGR = async (req, res) => {
  const id_po = decodeURIComponent(req.params.id_po);
  try {
    let result = await getPOById(id_po);
    result = {
      ...result,
      items: result.items.filter((item) => item.is_complete !== true),
    };
    res.status(200).send({
      message: `Success get PO: ${id_po}`,
      data: result,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

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
      id_gr: "CFM" + Math.floor(1000 + Math.random() * 9000) + "-" + payload.id_po,
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

    await updatePOCompletion(payload.id_po);

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

const handleGetGRByUser = async (req, res) => {
  const id_user = req.params.id_user;
  try {
    const result = await getGRByUser(id_user);
    res.status(200).send({
      message: `Success get user GR: ${id_user}`,
      data: result,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const handleGetGRById = async (req, res) => {
  const id_gr = decodeURIComponent(req.params.id_gr);
  try {
    const result = await getGRById(id_gr);
    res.status(200).send({
      message: `Success get GR: ${id_gr}`,
      data: result,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const handleGetRemainingItem = async (req, res) => {
  try {
    const result = await getRemainingItem();
    res.status(200).send({
      message: `Success get remaining item`,
      data: result,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

module.exports = {
  handlePostGR,
  handleGetGRByUser,
  handleGetRemainingItem,
  handleGetPOForGR,
  handleGetGRById,
};
