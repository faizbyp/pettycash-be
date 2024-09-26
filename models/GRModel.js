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

const getGRByUser = async (id_user) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const result = await client.query(
      `
      SELECT 
        gr.id,
        gr.id_po,
        gr.id_gr,
        gr.gr_date,
        gr.grand_total,
        c.company_name,
        v.vendor_name
      FROM goods_receipt gr
      JOIN purchase_order po ON gr.id_po = po.id_po
      JOIN mst_company c ON po.id_company = c.id_company
      JOIN mst_vendor v ON po.id_vendor = v.id_vendor
      WHERE po.id_user = $1
      ORDER BY gr_date DESC
      `,
      [id_user]
    );
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

module.exports = { postGR, getGRByUser };
