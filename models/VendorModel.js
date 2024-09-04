const db = require("../config/connection");
const TRANS = require("../config/transaction");

const getVendorById = async (id) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const q = `
      SELECT * FROM mst_vendor WHERE id_vendor = $1;
      `;
    const result = await client.query(q, [id]);
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
  getVendorById,
};
