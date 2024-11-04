const {
  postPO,
  getPOByUser,
  getPOById,
  getAllPO,
  POApproval,
  reqCancelPO,
  cancelPO,
  editPO,
} = require("../models/POModel");
const { v4: uuidv4 } = require("uuid");

const handlePostPO = async (req, res) => {
  try {
    let payload = req.body.data;
    let itemPayload = payload.items.map(({ amount, ...rest }) => rest);

    // PO payload
    delete payload.items;
    delete payload.sub_total;
    delete payload.grand_total;
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
  const req_cancel = req.query.req_cancel || false;
  try {
    const [status, company, data] = await getAllPO(req_cancel);
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

const handleReqCancelPO = async (req, res) => {
  const cancel_reason = req.body.cancel_reason;
  const id_po = decodeURIComponent(req.params.id_po);
  try {
    if (!id_po) {
      throw new Error("Bad Request");
    }
    if (!cancel_reason) {
      throw new Error("Reason is required");
    }
    const result = await reqCancelPO(cancel_reason, id_po);
    res.status(200).send({
      message: `PO ${id_po} cancel request sent`,
    });
  } catch (error) {
    if (error.message === "Bad Request" || error.message === "Reason is required") {
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

const handleCancelPO = async (req, res) => {
  const approval = req.body.status;
  const notes = req.body.notes;
  const id_po = decodeURIComponent(req.params.id_po);
  try {
    if (!id_po) {
      throw new Error("Bad Request");
    }
    const result = await cancelPO(approval, notes, id_po);
    res.status(200).send({
      message: `PO ${id_po} cancel approval success`,
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

const handleEditPO = async (req, res) => {
  let payload = req.body.data;
  let added_items = payload.added_items || [];
  const edited_items = payload.edited_items || [];
  const deleted_items = payload.deleted_items || [];
  payload = {
    ...payload,
    ppn: payload.ppn ? 0.11 : 0,
    status: "pending",
  };

  // DELETE UNNECESSARY DATA
  unnecessaryData = [
    "added_items",
    "edited_items",
    "deleted_items",
    "id_company",
    "id_vendor",
    "id_user",
    "sub_total",
    "grand_total",
  ];
  unnecessaryData.forEach((prop) => delete payload[prop]);
  added_items = added_items.map(({ id_po_item, amount, id, ...rest }) => ({
    ...rest,
    id_po_item: uuidv4(),
  }));

  const idPO = decodeURIComponent(req.params.id_po);
  try {
    if (!idPO) {
      throw new Error("Bad Request");
    }
    const result = await editPO(payload, added_items, edited_items, deleted_items, idPO);
    res.status(200).send({
      message: `PO ${idPO} edited.\nStatus set to pending`,
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
  handleReqCancelPO,
  handleCancelPO,
  handleEditPO,
};
