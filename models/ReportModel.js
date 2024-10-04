const db = require("../config/connection");
const TRANS = require("../config/transaction");
const { insertQuery } = require("../helper/queryBuilder");
const ExcelJS = require("exceljs");

const getComparisonReport = async (
  gr_start_date,
  gr_end_date,
  po_start_date,
  po_end_date,
  company
) => {
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
        WHERE ((gr.gr_date >= $1 OR $1::DATE IS NULL) AND (gr.gr_date <= $2 OR $2::DATE IS NULL))
        AND ((po.po_date >= $3 OR $3::DATE IS NULL) AND (po.po_date <= $4 OR $4::DATE IS NULL))
        AND (c.id_company LIKE COALESCE($5, '%'))
        GROUP BY 
          gr.id, po.id_po, gr.id_gr, po.po_date, gr.gr_date, c.id_company, c.company_name, v.id_vendor, v.vendor_name, po.grand_total, gr.grand_total, u.name, po.sub_total, po.ppn
        ORDER BY gr.gr_date DESC
      `,
      [gr_start_date, gr_end_date, po_start_date, po_end_date, company]
    );
    console.log(result.rows);

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

const generateComparisonExcel = async (
  gr_start_date,
  gr_end_date,
  po_start_date,
  po_end_date,
  company
) => {
  try {
    const rowData = await getComparisonReport(
      gr_start_date,
      gr_end_date,
      po_start_date,
      po_end_date,
      company
    );
    const workbook = new ExcelJS.Workbook();

    let masterSheet = workbook.addWorksheet("Master");
    masterSheet.columns = [
      { header: "ID Confirmation", key: "id_gr", width: 25 },
      { header: "ID Plan", key: "id_po", width: 15 },
      { header: "User", key: "user_name", width: 20 },
      { header: "Confirmation Date", key: "gr_date", width: 20 },
      { header: "Plan Date", key: "po_date", width: 20 },
      { header: "Company", key: "company_name", width: 25 },
      { header: "Vendor", key: "vendor_name", width: 25 },
      { header: "Confirmation Subtotal", key: "gr_sub", width: 15 },
      { header: "Plan Subtotal", key: "po_sub", width: 15 },
      { header: "Confirmation PPN", key: "gr_ppn", width: 15 },
      { header: "Plan PPN", key: "po_ppn", width: 15 },
      { header: "Confirmation Total", key: "gr_total", width: 20 },
      { header: "Plan Total", key: "po_total", width: 20 },
    ];
    masterSheet.getRow(1).font = { bold: true };

    let detailSheet = workbook.addWorksheet("Details (Item)");
    detailSheet.columns = [
      { header: "ID Confirmation", key: "id_gr", width: 15 },
      { header: "Item", key: "description", width: 25 },
      { header: "Confirmation Qty", key: "gr_qty", width: 20 },
      { header: "Plan Qty", key: "po_qty", width: 20 },
      { header: "UOM", key: "uom", width: 10 },
      { header: "Confirmation Unit Price", key: "gr_unit_price", width: 20 },
      { header: "Plan Unit Price", key: "po_unit_price", width: 20 },
      { header: "Confirmation Amount", key: "gr_amount", width: 15 },
      { header: "Plan Amount", key: "po_amount", width: 15 },
    ];
    detailSheet.getRow(1).font = { bold: true };

    rowData.forEach((row) => {
      masterSheet.addRow({
        id_gr: row.id_gr,
        id_po: row.id_po,
        gr_date: row.gr_date,
        po_date: row.po_date,
        user_name: row.user_name,
        company_name: row.company_name,
        vendor_name: row.vendor_name,
        gr_sub: row.gr_sub,
        po_sub: row.po_sub,
        gr_ppn: row.gr_ppn,
        po_ppn: row.po_ppn,
        gr_total: row.gr_total,
        po_total: row.po_total,
      });

      row.items.forEach((item) => {
        detailSheet.addRow({
          id_gr: row.id_gr,
          description: item.description,
          gr_qty: item.gr_qty,
          po_qty: item.po_qty,
          uom: item.uom,
          gr_unit_price: item.gr_unit_price,
          po_unit_price: item.po_unit_price,
          gr_amount: item.gr_amount,
          po_amount: item.po_amount,
        });
      });
    });

    return workbook;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = { getComparisonReport, generateComparisonExcel };
