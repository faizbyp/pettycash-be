const db = require("../config/connection");
const TRANS = require("../config/transaction");
const { insertQuery } = require("../helper/queryBuilder");
const { updatePOItemCompletion } = require("./POItemModel");
const { v4: uuidv4 } = require("uuid");
const Emailer = require("../service/mail");
const { updatePOCompletion } = require("./POModel");

const postGR = async (payload, itemPayload) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    // GR
    const [query, value] = insertQuery("goods_receipt", payload, "id_gr");
    console.log(query);
    const result = await client.query(query, value);
    const id_gr = result.rows[0].id_gr;

    // GR ITEM
    itemPayload = itemPayload.map((item) => {
      delete item.description;
      delete item.id_po;
      delete item.uom;
      return {
        ...item,
        id_gr_item: uuidv4(),
        id_gr: id_gr,
      };
    });
    console.log("item payload", itemPayload);

    const itemInsert = itemPayload.map(({ is_complete, ...item }) => item);
    const [itemQuery, itemValue] = insertQuery("goods_receipt_item", itemInsert);
    console.log(itemQuery);
    const itemResult = await client.query(itemQuery, itemValue);
    const updateCompleteId = itemPayload
      .filter((item) => item.is_complete === true)
      .map((item) => item.id_po_item);
    await updatePOItemCompletion(client, updateCompleteId);

    await updatePOCompletion(client, payload.id_po);

    const Email = new Emailer();
    const emailResult = await Email.newGR(id_gr);
    console.log(emailResult);

    await client.query(TRANS.COMMIT);
    return id_gr;
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
        gr.id_po,
        gr.id_gr,
        gr.gr_date,
        po.po_date,
        SUM(gri.unit_price * gri.qty) *
          CASE
            WHEN gr.ppn = 0.11 THEN 1.11
            ELSE 1.0
          END
        AS grand_total,
        c.company_name,
        v.vendor_name,
        gr.status
      FROM goods_receipt gr
      JOIN purchase_order po ON gr.id_po = po.id_po
      JOIN mst_company c ON po.id_company = c.id_company
      JOIN mst_vendor v ON po.id_vendor = v.id_vendor
      JOIN goods_receipt_item gri ON gr.id_gr = gri.id_gr
      WHERE po.id_user = $1
      GROUP BY gr.id_po, gr.id_gr, po.po_date, c.company_name, v.vendor_name
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

const getGRById = async (id_gr) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const result = await client.query(
      `
      SELECT gr.*,
      SUM(gri.unit_price * gri.qty)
      AS sub_total,
      SUM(gri.unit_price * gri.qty) *
        CASE
          WHEN gr.ppn = 0.11 THEN 1.11
          ELSE 1.0
        END
      AS grand_total,
      po.id_company,
      po.id_vendor
      FROM goods_receipt gr 
      JOIN purchase_order po ON po.id_po = gr.id_po
      JOIN goods_receipt_item gri ON gr.id_gr = gri.id_gr
      WHERE gr.id_gr = $1
      GROUP BY gr.id_gr, po.id_company, po.id_vendor
      `,
      [id_gr]
    );

    if (result.rows.length === 0) {
      throw new Error("GR not found");
    }

    const [companyResult, vendorResult, itemResult] = await Promise.all([
      client.query(`SELECT * FROM mst_company WHERE id_company = $1`, [result.rows[0].id_company]),
      client.query(`SELECT * FROM mst_vendor WHERE id_vendor = $1`, [result.rows[0].id_vendor]),
      client.query(
        `
        SELECT
          gri.*,
          (gri.unit_price * gri.qty) AS amount,
          poi.uom,
          poi.description
        FROM
          goods_receipt_item gri
        JOIN
          purchase_order_item poi ON poi.id_po_item = gri.id_po_item
          WHERE id_gr = $1
        ORDER BY poi.description ASC`,
        [id_gr]
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

const getAllGR = async () => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [status, company, amount, data] = await Promise.all([
      await client.query(
        `
        SELECT status, COUNT(status)
        FROM goods_receipt
        GROUP BY status
        `
      ),
      await client.query(
        `
        SELECT c.company_name, count(c.company_name) AS company_count
        FROM goods_receipt gr
        JOIN purchase_order po ON gr.id_po = po.id_po
        JOIN mst_company c ON po.id_company = c.id_company 
        GROUP BY c.company_name
        ORDER BY company_name ASC
        `
      ),
      await client.query(
        `
        SELECT
        SUM(gri.unit_price * gri.qty) *
          CASE
            WHEN gr.ppn = 0.11 THEN 1.11
            ELSE 1.0
          END
        AS sum
        FROM goods_receipt gr
        JOIN goods_receipt_item gri ON gr.id_gr = gri.id_gr
        WHERE gr.status = 'approved'
        GROUP BY gr.ppn
        `
      ),
      await client.query(
        `
        SELECT 
          gr.id_po,
          gr.id_gr,
          gr.gr_date,
          po.po_date,
          SUM(gri.unit_price * gri.qty) *
            CASE
              WHEN gr.ppn = 0.11 THEN 1.11
              ELSE 1.0
            END
          AS grand_total,
          c.company_name,
          v.vendor_name,
          gr.status,
          u.name AS user_name
        FROM goods_receipt gr
        JOIN purchase_order po ON gr.id_po = po.id_po
        JOIN mst_company c ON po.id_company = c.id_company
        JOIN mst_vendor v ON po.id_vendor = v.id_vendor
        JOIN mst_user u ON po.id_user = u.id_user
        JOIN goods_receipt_item gri ON gr.id_gr = gri.id_gr
        GROUP BY gr.id_po, gr.id_gr, po.po_date, c.company_name, v.vendor_name, u.name
        ORDER BY gr_date DESC
        `
      ),
    ]);
    await client.query(TRANS.COMMIT);
    return [status.rows, company.rows, amount.rows[0], data.rows];
  } catch (error) {
    console.log(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

const GRApproval = async (payload, id_gr) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const Email = new Emailer();
    let result = null;
    if (payload.status === "approved") {
      const [update, user] = await Promise.all([
        client.query(
          `UPDATE goods_receipt
          SET status = $1, approval_by = $2, approval_date = $3
          WHERE id_gr = $4`,
          [payload.status, payload.id_user, payload.approval_date, id_gr]
        ),
        client.query(`SELECT name, email FROM mst_user WHERE id_user = $1`, [payload.id_user]),
      ]);
      result = update;
      const emailResult = await Email.GRApproved(id_gr, user.rows[0]);
      console.log(emailResult);
    } else if (payload.status === "rejected") {
      const [update, user] = await Promise.all([
        client.query(
          `UPDATE goods_receipt
          SET status = $1, approval_by = $2, approval_date = $3, reject_notes = $4
          WHERE id_gr = $5`,
          [payload.status, payload.id_user, payload.approval_date, payload.reject_notes, id_gr]
        ),
        client.query(`SELECT name, email FROM mst_user WHERE id_user = $1`, [payload.id_user]),
      ]);
      result = update;
      const emailResult = await Email.GRRejected(id_gr, user.rows[0], payload.reject_notes);
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

module.exports = { postGR, getGRByUser, getGRById, GRApproval, getAllGR };
