const db = require("../config/connection");
const TRANS = require("../config/transaction");

const getCompanyById = async (id) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const q = `
      SELECT * FROM mst_company WHERE id_company = $1;
      `;
    const result = await client.query(q, [id]);
    await client.query(TRANS.COMMIT);
    return result.rows[0];
  } catch (err) {
    console.log(err);
    await client.query(TRANS.ROLLBACK);
  } finally {
    client.release();
  }
};

module.exports = {
  getCompanyById,
};
