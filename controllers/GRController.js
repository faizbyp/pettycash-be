const { parseFormUpload } = require("../helper/fileUpload");
const { postGR, getGRByUser, getGRById, GRApproval, getAllGR } = require("../models/GRModel");
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
    let result = await postGR(payload, itemPayload);

    await updatePOCompletion(payload.id_po);

    res.status(200).send({
      message: `Success create Order Confirmation: ${payload.id_gr}`,
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

const handleGetAllGR = async (req, res) => {
  try {
    const result = await getAllGR();
    res.status(200).send({
      message: `Success get all GR`,
      data: result,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const handleGRApproval = async (req, res) => {
  let payload = req.body;
  const id_gr = decodeURIComponent(req.params.id_gr);
  try {
    if (!payload.id_user || !payload.status || !payload.approval_date || !id_gr) {
      throw new Error("Bad Request");
    }
    const result = await GRApproval(payload, id_gr);
    res.status(200).send({
      message: `GR ${id_gr} ${payload.status}`,
    });
  } catch (error) {
    if (error.message === "Bad Request") {
      res.status(400).send({
        message: error.message,
      });
    } else {
      res.status(500).send({
        message: error.message,
      });
    }
  }
};

module.exports = {
  handlePostGR,
  handleGetGRByUser,
  handleGetRemainingItem,
  handleGetPOForGR,
  handleGetGRById,
  handleGRApproval,
  handleGetAllGR,
};
