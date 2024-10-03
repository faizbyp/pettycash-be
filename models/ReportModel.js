const db = require("../config/connection");
const TRANS = require("../config/transaction");
const { insertQuery } = require("../helper/queryBuilder");

const getComparisonReport = async () => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const result = await client.query(
      `
      SELECT 
        gr.id,
        po.id_po,
        gr.id_gr,
        po.po_date,
        gr.gr_date,
        c.id_company,
        c.company_name,
        v.id_vendor,
        v.vendor_name,
        po.sub_total AS po_sub,
        gr.sub_total AS gr_sub,
        po.ppn AS po_ppn,
        gr.ppn AS gr_ppn,
        po.grand_total AS po_total,
        gr.grand_total AS gr_total,
        u.name AS user_name,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id_po_item', gri.id_po_item,
            'id_gr_item', gri.id_gr_item,
            'description', poi.description,
            'gr_qty', gri.qty,
            'po_qty', poi.qty,
            'gr_unit_price', gri.unit_price,
            'po_unit_price', poi.unit_price,
            'uom', poi.uom,
            'gr_amount', gri.amount,
            'po_amount', poi.amount
          )
        ) AS items
        FROM goods_receipt gr
        JOIN purchase_order po ON gr.id_po = po.id_po
        JOIN mst_company c ON po.id_company = c.id_company
        JOIN mst_vendor v ON po.id_vendor = v.id_vendor
        JOIN mst_user u ON po.id_user = u.id_user
        JOIN 
          goods_receipt_item gri ON gr.id_gr = gri.id_gr
        JOIN 
          purchase_order_item poi ON gri.id_po_item = poi.id_po_item
        GROUP BY 
          gr.id, po.id_po, gr.id_gr, po.po_date, gr.gr_date, c.id_company, c.company_name, v.id_vendor, v.vendor_name, po.grand_total, gr.grand_total, u.name, po.sub_total, po.ppn
        ORDER BY gr.gr_date DESC
      `
    );

    const items = await client.query(
      `
      SELECT 
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

module.exports = { getComparisonReport };
