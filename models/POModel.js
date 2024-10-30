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
        po.id_po,
        po.po_date,
        SUM(poi.unit_price * poi.qty) *
          CASE
            WHEN po.ppn = 0.11 THEN 1.11
            ELSE 1.0
          END
        AS grand_total,
        po.status,
        po.is_complete,
        c.company_name,
        v.vendor_name
      FROM purchase_order po
      JOIN mst_company c ON po.id_company = c.id_company
      JOIN mst_vendor v ON po.id_vendor = v.id_vendor
      LEFT JOIN purchase_order_item poi ON po.id_po = poi.id_po
      WHERE po.id_user = $1
      AND (po.status = $2 OR $2::VARCHAR IS NULL)
      AND (po.is_complete = $3 OR $3::VARCHAR IS NULL)
      GROUP BY po.id_po, c.company_name, v.vendor_name
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
      SELECT po.*,
      SUM(poi.unit_price * poi.qty) AS sub_total,
      SUM(poi.unit_price * poi.qty) *
        CASE
          WHEN po.ppn = 0.11 THEN 1.11
          ELSE 1.0
        END
      AS grand_total
      FROM purchase_order po
      JOIN purchase_order_item poi ON po.id_po = poi.id_po
      WHERE po.id_po = $1
      GROUP BY po.id_po
      `,
      [id_po]
    );

    if (result.rows.length === 0) {
      throw new Error("PO not found");
    }

    const [companyResult, vendorResult, itemResult, has_gr] = await Promise.all([
      client.query(`SELECT * FROM mst_company WHERE id_company = $1`, [result.rows[0].id_company]),
      client.query(`SELECT * FROM mst_vendor WHERE id_vendor = $1`, [result.rows[0].id_vendor]),
      client.query(
        `
        SELECT
          poi.*,
          (poi.unit_price * poi.qty) AS amount,
          ABS(COALESCE(SUM(gri.qty), 0) - poi.qty) AS remaining_qty
        FROM
          purchase_order_item poi
        LEFT JOIN
          goods_receipt_item gri ON gri.id_po_item = poi.id_po_item
          WHERE id_po = $1
        GROUP BY
          poi.id_po_item, poi.qty`,
        [id_po]
      ),
      client.query(
        `
        SELECT id_gr FROM goods_receipt WHERE id_po = $1
        `,
        [id_po]
      ),
    ]);

    await client.query(TRANS.COMMIT);

    const finalResult = {
      ...result.rows[0],
      has_gr: has_gr.rowCount !== 0,
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

const getAllPO = async (reqCancel) => {
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
        SELECT c.company_name, COUNT(c.company_name) AS company_count
        FROM purchase_order po
        JOIN mst_company c ON po.id_company = c.id_company 
        GROUP BY c.company_name
        ORDER BY company_name ASC
        `
      ),
      await client.query(
        `
        SELECT 
          po.id_po,
          po.po_date,
          SUM(poi.unit_price * poi.qty) *
            CASE
              WHEN po.ppn = 0.11 THEN 1.11
              ELSE 1.0
            END
          AS grand_total,
          po.status,
          po.is_complete,
          po.cancel_reason,
          c.company_name,
          v.vendor_name,
          u.name AS user_name
        FROM purchase_order po
        JOIN mst_company c ON po.id_company = c.id_company
        JOIN mst_vendor v ON po.id_vendor = v.id_vendor
        JOIN mst_user u ON po.id_user = u.id_user
        JOIN purchase_order_item poi on po.id_po = poi.id_po
        WHERE (po.cancel_reason IS NOT NULL AND po.cancel_reason <> '' OR NOT $1)
        GROUP BY po.id_po, c.company_name, v.vendor_name, u.name
        ORDER BY po_date DESC
        `,
        [reqCancel]
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
    const Email = new Emailer();
    let result = null;
    if (payload.status === "approved") {
      const [update, user] = await Promise.all([
        client.query(
          `UPDATE purchase_order
          SET status = $1, approval_by = $2, approval_date = $3
          WHERE id_po = $4`,
          [payload.status, payload.id_user, payload.approval_date, id_po]
        ),
        client.query(`SELECT name, email FROM mst_user WHERE id_user = $1`, [payload.id_user]),
      ]);
      result = update;
      const emailResult = await Email.POApproved(id_po, user.rows[0]);
      console.log(emailResult);
    } else if (payload.status === "rejected") {
      const [update, user] = await Promise.all([
        client.query(
          `UPDATE purchase_order
          SET status = $1, approval_by = $2, approval_date = $3, reject_notes = $4
          WHERE id_po = $5`,
          [payload.status, payload.id_user, payload.approval_date, payload.reject_notes, id_po]
        ),
        client.query(`SELECT name, email FROM mst_user WHERE id_user = $1`, [payload.id_user]),
      ]);
      result = update;
      const emailResult = await Email.PORejected(id_po, user.rows[0], payload.reject_notes);
      console.log(emailResult);
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

// THIS FUNCTION SHOULD BE CALLED INSIDE A DB CONNECTION AND TRANSACTION
const updatePOCompletion = async (client, id_po) => {
  try {
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
    return update.rows;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const reqCancelPO = async (reason, id_po) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const Email = new Emailer();
    // CTE for multiple query
    const result = await client.query(
      `
      WITH updated_po AS (
        UPDATE purchase_order SET cancel_reason = $1 WHERE id_po = $2 RETURNING id_po
      ),
      check_gr AS (
        SELECT id_gr FROM goods_receipt WHERE id_po = $2
      ),
      user_info AS (
        SELECT u.name FROM purchase_order po JOIN mst_user u ON po.id_user = u.id_user WHERE id_po = $2 
      )

      SELECT
        (SELECT COUNT(*) FROM check_gr) AS gr_count,
        (SELECT name FROM user_info) AS user_name
      FROM updated_po;
      `,
      [reason, id_po]
    );
    console.log(result.rows);
    if (parseInt(result.rows[0].gr_count) !== 0)
      throw new Error("Cannot cancel PO with existing GR");
    if (result.rows.length === 0) throw new Error("ID PO not found");

    const emailResult = await Email.newPOCancelReq(id_po, result.rows[0].user_name);
    console.log(emailResult);

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

const cancelPO = async (approval, notes, id_po) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const Email = new Emailer();
    let result = null;

    if (approval === "approved") {
      const [update, user] = await Promise.all([
        client.query(
          `UPDATE purchase_order
              SET status = 'canceled', approval_by = null, approval_date = null, cancel_reason = null
              WHERE id_po = $1`,
          [id_po]
        ),
        client.query(
          `
          SELECT u.name, u.email FROM purchase_order po JOIN mst_user u ON po.id_user = u.id_user WHERE id_po = $1`,
          [id_po]
        ),
      ]);
      result = update;
      const emailResult = await Email.POCancelReqApproved(id_po, user.rows[0]);
      console.log(emailResult);
    }
    if (approval === "rejected") {
      const [update, user] = await Promise.all([
        client.query(
          `UPDATE purchase_order
              SET cancel_reason = null
              WHERE id_po = $1`,
          [id_po]
        ),
        client.query(
          `
          SELECT u.name, u.email FROM purchase_order po JOIN mst_user u ON po.id_user = u.id_user WHERE id_po = $1`,
          [id_po]
        ),
      ]);
      result = update;
      const emailResult = await Email.POCancelReqRejected(id_po, user.rows[0], notes);
      console.log(emailResult);
    }

    await client.query(TRANS.COMMIT);
    console.log(result);
    return result;
  } catch (error) {
    console.log(error);
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
  reqCancelPO,
  cancelPO,
};
