const db = require("../config/connection");
const TRANS = require("../config/transaction");

const getAllFromTable = async (table) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const query = `
      SELECT * FROM ${table};
      `;
    const result = await client.query(query);
    await client.query(TRANS.COMMIT);
    return result.rows;
  } catch (error) {
    console.log(error);
    await client.query(TRANS.ROLLBACK);
  } finally {
    client.release();
  }
};

module.exports = {
  getAllFromTable,
};
