const { postPO, getPOByUser, getPOById, getAllPO, POApproval } = require("../models/POModel");
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
    let result = await postPO(payload, itemPayload);

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
  const status = req.query.status || null;
  const is_complete = req.query.is_complete || null;
  try {
    const result = await getPOByUser(id_user, status, is_complete);
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

const handleGetPOById = async (req, res) => {
  const id_po = decodeURIComponent(req.params.id_po);
  try {
    const result = await getPOById(id_po);
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

const handleGetAllPO = async (req, res) => {
  try {
    const [status, company, data] = await getAllPO();
    const statusCount = status.reduce((accumulator, current) => {
      accumulator[current.status] = parseInt(current.count);
      return accumulator;
    }, {});

    res.status(200).send({
      message: `Success get all PO`,
      status_count: statusCount,
      company_count: company,
      data: data,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const handlePOApproval = async (req, res) => {
  let payload = req.body;
  const id_po = decodeURIComponent(req.params.id_po);
  try {
    if (!payload.id_user || !payload.status || !payload.approval_date || !id_po) {
      throw new Error("Bad Request");
    }
    const result = await POApproval(payload, id_po);
    res.status(200).send({
      message: `PO ${id_po} ${payload.status}`,
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
  handlePostPO,
  handleGetPOByUser,
  handleGetPOById,
  handleGetAllPO,
  handlePOApproval,
};
