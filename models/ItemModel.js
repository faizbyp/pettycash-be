const db = require("../config/connection");
const TRANS = require("../config/transaction");

Item = {};

Item.getAll = async () => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const q = `
      SELECT * FROM mst_item;
      `;
    const result = await client.query(q);
    await client.query(TRANS.COMMIT);
    return result.rows;
  } catch (err) {
    console.log(err);
    await client.query(TRANS.ROLLBACK);
  } finally {
    client.release();
  }
};

module.exports = Item;
