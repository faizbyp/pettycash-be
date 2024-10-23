const db = require("../config/connection");
const TRANS = require("../config/transaction");
const { insertQuery } = require("../helper/queryBuilder");
const { postPOItem } = require("./POItemModel");
const { v4: uuidv4 } = require("uuid");
const Emailer = require("../service/mail");

const postPO = async (payload, itemPayload) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);

    // PO
    const [query, value] = insertQuery("purchase_order", payload, "id_po");
    console.log(query);
    const result = await client.query(query, value);
    const id_po = result.rows[0].id_po;

    // PO ITEM
    itemPayload = itemPayload.map((item) => ({
      ...item,
      id_po_item: uuidv4(),
      id_po: id_po,
    }));
    const [itemQuery, itemValue] = insertQuery("purchase_order_item", itemPayload);
    console.log(itemQuery, itemPayload);
    const itemResult = await client.query(itemQuery, itemValue);

    const Email = new Emailer();
    const emailResult = await Email.newPO(id_po);
    console.log(emailResult);

    await client.query(TRANS.COMMIT);
    return id_po;
  } catch (error) {
    console.log(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

const getPOByUser = async (id_user, status, is_complete) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const result = await client.query(
      `
      SELECT 
        po.id,
        po.id_po,
        po.po_date,
        po.grand_total,
        po.status,
        c.company_name,
        v.vendor_name
      FROM purchase_order po
      JOIN mst_company c ON po.id_company = c.id_company
      JOIN mst_vendor v ON po.id_vendor = v.id_vendor
      WHERE po.id_user = $1
      AND (po.status = $2 OR $2::VARCHAR IS NULL)
      AND (po.is_complete = $3 OR $3::VARCHAR IS NULL)
      ORDER BY po_date DESC
      `,
      [id_user, status, is_complete]
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

const getPOById = async (id_po) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const result = await client.query(
      `
      SELECT * FROM purchase_order WHERE id_po = $1
      `,
      [id_po]
    );

    if (result.rows.length === 0) {
      throw new Error("PO not found");
    }

    const [companyResult, vendorResult, itemResult] = await Promise.all([
      client.query(`SELECT * FROM mst_company WHERE id_company = $1`, [result.rows[0].id_company]),
      client.query(`SELECT * FROM mst_vendor WHERE id_vendor = $1`, [result.rows[0].id_vendor]),
      client.query(
        `
        SELECT
          poi.*,
          ABS(COALESCE(SUM(gri.qty), 0) - poi.qty) AS remaining_qty
        FROM
          purchase_order_item poi
        LEFT JOIN
          goods_receipt_item gri ON gri.id_po_item = poi.id_po_item
          WHERE id_po = $1
        GROUP BY
          poi.id, poi.id_po_item, poi.qty`,
        [id_po]
      ),
    ]);

    await client.query(TRANS.COMMIT);

    const finalResult = {
      ...result.rows[0],
      company: companyResult.rows[0],
      vendor: vendorResult.rows[0],
      items: itemResult.rows,
    };

    return finalResult;
  } catch (error) {
    console.log(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

const getAllPO = async () => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [status, company, data] = await Promise.all([
      await client.query(
        `
        SELECT status, COUNT(status)
        FROM purchase_order
        GROUP BY status
        `
      ),
      await client.query(
        `
        SELECT c.company_name, count(c.company_name) AS company_count
        FROM purchase_order po
        JOIN mst_company c ON po.id_company = c.id_company 
        GROUP BY c.company_name
        ORDER BY company_count DESC
        LIMIT 5
        `
      ),
      await client.query(
        `
        SELECT 
          po.id,
          po.id_po,
          po.po_date,
          po.grand_total,
          po.status,
          c.company_name,
          v.vendor_name,
          u.name AS user_name
        FROM purchase_order po
        JOIN mst_company c ON po.id_company = c.id_company
        JOIN mst_vendor v ON po.id_vendor = v.id_vendor
        JOIN mst_user u ON po.id_user = u.id_user
        ORDER BY po_date DESC
        `
      ),
    ]);
    await client.query(TRANS.COMMIT);
    return [status.rows, company.rows, data.rows];
  } catch (error) {
    console.log(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

const POApproval = async (payload, id_po) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    let result = null;
    if (payload.status === "approved") {
      result = await client.query(
        `UPDATE purchase_order
        SET status = $1, approval_by = $2, approval_date = $3
        WHERE id_po = $4`,
        [payload.status, payload.id_user, payload.approval_date, id_po]
      );
    } else if (payload.status === "rejected") {
      result = await client.query(
        `UPDATE purchase_order
        SET status = $1, approval_by = $2, approval_date = $3, reject_notes = $4
        WHERE id_po = $5`,
        [payload.status, payload.id_user, payload.approval_date, payload.reject_notes, id_po]
      );
    }
    await client.query(TRANS.COMMIT);
    return result.rowCount;
  } catch (error) {
    console.log(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

const updatePOCompletion = async (id_po) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const result = await client.query(
      `
      SELECT id_po_item, is_complete FROM purchase_order_item WHERE id_po = $1 AND is_complete <> true
    `,
      [id_po]
    );
    const allItemComplete = result.rows.length === 0;
    let update = "tes";
    if (allItemComplete) {
      update = await client.query(`UPDATE purchase_order SET is_complete = true WHERE id_po = $1`, [
        id_po,
      ]);
    }
    console.log(update);
    await client.query(TRANS.COMMIT);
    return update.rows;
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  postPO,
  getPOByUser,
  getPOById,
  getAllPO,
  POApproval,
  updatePOCompletion,
};
