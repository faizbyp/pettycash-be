const db = require("../config/connection");
const TRANS = require("../config/transaction");

const getAllFromTable = async (table) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const q = `
      SELECT * FROM ${table};
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

module.exports = {
  getAllFromTable,
};
