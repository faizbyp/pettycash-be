const db = require("../config/connection");
const TRANS = require("../config/transaction");
const { insertQuery } = require("../helper/queryBuilder");

// THIS FUNCTION SHOULD BE CALLED INSIDE A DB CONNECTION AND TRANSACTION
const updatePOItemCompletion = async (client, id_po_items) => {
  try {
    const remaining = await client.query(`
      SELECT
        poi.id_po_item,
        ABS(COALESCE(SUM(gri.qty), 0) - poi.qty) AS remaining_qty
      FROM
        purchase_order_item poi
      LEFT JOIN
        goods_receipt_item gri ON gri.id_po_item = poi.id_po_item
      GROUP BY
        poi.id_po_item, poi.qty
      HAVING
        ABS(COALESCE(SUM(gri.qty), 0) - poi.qty) = 0
    `);
    const remainingQty = remaining.rows;
    const zeroRemaining = remainingQty.map((item) => item.id_po_item);
    const array = [...new Set([...id_po_items, ...zeroRemaining])];
    const result = await client.query(
      `
      UPDATE purchase_order_item
      SET is_complete = true
      WHERE id_po_item = ANY($1::varchar[])
    `,
      [array]
    );
    return result.rows;
  } catch (error) {
    console.error(error);
    throw error;
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
  getRemainingItem,
  updatePOItemCompletion,
};
