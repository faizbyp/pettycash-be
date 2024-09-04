const insertQuery = (table, value, returning = null) => {
  let payloadArray = [];
  let valueArray = [];
  let columnArray = [];
  Object.keys(value).forEach((key, index) => {
    columnArray.push(key);
    payloadArray.push("$" + (index + 1));
    valueArray.push(value[key]);
  });

  const column = columnArray.join(", ");
  const values = payloadArray.join(", ");
  let query = `INSERT INTO ${table} (${column}) VALUES (${values})`;
  if (returning != null) {
    query += `RETURNING ${returning}`;
  } else {
    query += ";";
  }

  return [query, valueArray];
};

// const updateItem = (toTable, val, where, returning = null) => {
//   let value = [];
//   let insertCol = [];
//   let whereCol = [];
//   delete val[`${where.col}`];
//   Object.keys(val).forEach((key, ix) => {
//     insertCol.push(key + ` = $${ix + 1}`);
//   });
//   Object.values(val).forEach((v) => {
//     value.push(v);
//   });
//   Object.keys(where).forEach((key) => {
//     whereCol.push(key + `= '${where[key]}'`);
//   });
//   let whereScr = whereCol.join(" and ");
//   const qinsertCol = insertCol.join(", ");
//   let query = `UPDATE ${toTable} SET ${qinsertCol} WHERE ${whereScr}`;
//   if (returning != null) {
//     query += `RETURNING ${returning}`;
//   } else {
//     query += " ;";
//   }
//   return [query, value];
// };

module.exports = {
  insertQuery,
};
