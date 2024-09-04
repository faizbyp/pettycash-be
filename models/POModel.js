const db = require("../config/connection");
const TRANS = require("../config/transaction");
const { insertQuery } = require("../helper/queryBuilder");

const postPO = async (payload) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [query, value] = insertQuery("purchase_order", payload, "id_po");
    console.log(query);
    const result = await client.query(query, value);
    await client.query(TRANS.COMMIT);
    return result.rows[0].id_po;
  } catch (err) {
    console.log(err);
    await client.query(TRANS.ROLLBACK);
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  postPO,
};
