const db = require("../config/connection");
const TRANS = require("../config/transaction");
const { insertQuery } = require("../helper/queryBuilder");
const { updatePOItemCompletion } = require("./POItemModel");

const postGRItem = async (payload) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const insert = payload.map(({ is_complete, ...item }) => item);
    const [query, value] = insertQuery("goods_receipt_item", insert);
    console.log(query);
    console.log(payload);
    const result = await client.query(query, value);
    const updateCompleteId = payload
      .filter((item) => item.is_complete === true)
      .map((item) => item.id_po_item);
    await updatePOItemCompletion(client, updateCompleteId);
    await client.query(TRANS.COMMIT);
    return result.rows[0];
  } catch (error) {
    console.log(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  postGRItem,
};
