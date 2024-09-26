const db = require("../config/connection");
const TRANS = require("../config/transaction");
const { insertQuery } = require("../helper/queryBuilder");

const postPOItem = async (payload) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [query, value] = insertQuery("purchase_order_item", payload);
    console.log(query);
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

const getRemainingItem = async (id) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const result = await client.query(
      `
      SELECT
        poi.id_po_item,
        poi.qty AS poi_qty,
        COALESCE(SUM(gri.qty), 0) AS total_gri_qty,
        ABS(COALESCE(SUM(gri.qty), 0) - poi.qty) AS remaining_qty
      FROM
        purchase_order_item poi
      LEFT JOIN
        goods_receipt_item gri ON gri.id_po_item = poi.id_po_item
      GROUP BY
        poi.id_po_item, poi.qty;
      `
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

module.exports = {
  postPOItem,
  getRemainingItem,
};
