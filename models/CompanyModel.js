const db = require("../config/connection");
const TRANS = require("../config/transaction");

const getCompanyById = async (id) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const query = `
      SELECT * FROM mst_company WHERE id_company = $1;
      `;
    const result = await client.query(query, [id]);
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
  getCompanyById,
};
