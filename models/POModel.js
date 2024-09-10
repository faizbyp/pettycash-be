const db = require("../config/connection");
const TRANS = require("../config/transaction");
const { insertQuery } = require("../helper/queryBuilder");

const postPO = async (payload) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [query, value] = insertQuery("purchase_order", payload, "id_po");
    console.log(query);
    const result = await client.query(query, value);
    await client.query(TRANS.COMMIT);
    return result.rows[0].id_po;
  } catch (error) {
    console.log(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

const getPOByUser = async (id_user) => {
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
      client.query(`SELECT * FROM purchase_order_item WHERE id_po = $1`, [id_po]),
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
    const result = await client.query(
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

module.exports = {
  postPO,
  getPOByUser,
  getPOById,
  getAllPO,
  POApproval,
};
