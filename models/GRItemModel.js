const db = require("../config/connection");
const TRANS = require("../config/transaction");
const { insertQuery } = require("../helper/queryBuilder");
const { updatePOItemCompletion } = require("./POItemModel");

const postGRItem = async (payload) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);

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
