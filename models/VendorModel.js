const db = require("../config/connection");
const TRANS = require("../config/transaction");
const { insertQuery, updateQuery } = require("../helper/queryBuilder");

const getVendorById = async (id) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const query = `
      SELECT * FROM mst_vendor WHERE id_vendor = $1;
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

const addVendor = async (payload) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [query, value] = insertQuery("mst_vendor", payload, "vendor_name");
    console.log(query, value);
    const result = await client.query(query, value);
    await client.query(TRANS.COMMIT);
    return result.rows[0].vendor_name;
  } catch (error) {
    console.log(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

const editVendor = async (payload, id) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [query, value] = updateQuery(
      "mst_vendor",
      payload,
      { id_vendor: id },
      "id_vendor, vendor_name"
    );
    const result = await client.query(query, value);
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
  addVendor,
  editVendor,
};
