const db = require("../config/connection");
const TRANS = require("../config/transaction");
const { insertQuery } = require("../helper/queryBuilder");

const postGR = async (payload) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [query, value] = insertQuery("goods_receipt", payload, "id_gr");
    console.log(query);
    const result = await client.query(query, value);
    await client.query(TRANS.COMMIT);
    return result.rows[0].id_gr;
  } catch (error) {
    console.log(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = { postGR };
