const db = require("../config/connection");
const TRANS = require("../config/transaction");

const getAllCompany = async (type, group) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const query = `
    SELECT * FROM mst_company c 
    WHERE (c.company_type = $1 OR $2::VARCHAR IS NULL) 
    AND (c.company_group = $3 OR $4::VARCHAR IS NULL);
    `;
    const result = await client.query(query, [type, type, group, group]);
    await client.query(TRANS.COMMIT);
    return result.rows;
  } catch (error) {
    console.log(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

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
  getAllCompany,
  getCompanyById,
};
