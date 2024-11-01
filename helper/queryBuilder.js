const insertQuery = (table, values, returning = null) => {
  let valuesArray = [];

  // Check if values is an array or a single object
  if (Array.isArray(values)) {
    valuesArray = values;
  } else if (typeof values === "object" && values !== null) {
    valuesArray = [values]; // Wrap the single object in an array
  } else {
    throw new Error("Values should be an object or an array of objects.");
  }

  let columnArray = [];
  let payloadArray = [];
  let valueArray = [];

  // Assuming the first object in the array has all the columns we need
  Object.keys(valuesArray[0]).forEach((key) => {
    columnArray.push(key);
  });

  // Build the payload and value arrays for multiple rows
  valuesArray.forEach((valueObj, rowIndex) => {
    let rowPlaceholders = [];
    Object.keys(valueObj).forEach((key, colIndex) => {
      rowPlaceholders.push(`$${rowIndex * columnArray.length + colIndex + 1}`);
      valueArray.push(valueObj[key]);
    });
    payloadArray.push(`(${rowPlaceholders.join(", ")})`);
  });

  const columns = columnArray.join(", ");
  const valuesString = payloadArray.join(", ");
  let query = `INSERT INTO ${table} (${columns}) VALUES ${valuesString}`;
  if (returning != null) {
    query += ` RETURNING ${returning}`;
  } else {
    query += ";";
  }

  return [query, valueArray];
};

const deleteQuery = (table, where) => {
  let query = "";
  let valueArray = [];
  const whereArray = Object.keys(where).map((item, index) => {
    valueArray.push(where[item]);
    return `${item} = $${index + 1}`;
  });
  query = "DELETE FROM " + table + " WHERE " + whereArray.join(" AND ") + ";";
  return [query, valueArray];
};

const updateQuery = (table, value, where, returning = null) => {
  let valueArray = [];
  let setArray = [];
  let whereArray = [];
  Object.keys(value).forEach((key, ix) => {
    setArray.push(key + ` = $${ix + 1}`);
  });
  Object.values(value).forEach((v) => {
    valueArray.push(v);
  });
  Object.keys(where).forEach((key) => {
    whereArray.push(key + ` = '${where[key]}'`);
  });
  let whereString = whereArray.join(" AND ");
  const setString = setArray.join(", ");
  let query = `UPDATE ${table} SET ${setString} WHERE ${whereString}`;
  if (returning != null) {
    query += ` RETURNING ${returning}`;
  } else {
    query += " ;";
  }
  return [query, valueArray];
};

// This function only update columns defined in columns array
const editItemQuery = (editedItems) => {
  // Define the table and columns to be updated
  const tableName = "purchase_order_item";
  const columns = ["description", "unit_price", "qty", "uom"];

  // Start building the SQL query
  let query = `UPDATE ${tableName} AS poi SET `;

  // Map columns to the updated values from the temporary table (aliased as "u")
  query += columns.map((column) => `${column} = u.${column}`).join(", ");

  query += ` FROM (VALUES `;

  // Iterate over each item and build the VALUES part of the query
  const valuesClause = editedItems
    .map((item) => {
      return `(
              '${item.id_po_item}',
              '${item.description}', 
              ${item.unit_price}, 
              ${item.qty}, 
              '${item.uom}' 
          )`;
    })
    .join(", ");

  // Append VALUES and create an alias for each column
  query += valuesClause;
  query += `) AS u(id_po_item, ${columns.join(", ")})`;

  // Finalize the query with the join condition
  query += ` WHERE poi.id_po_item = u.id_po_item;`;

  return query;
};

module.exports = {
  insertQuery,
  deleteQuery,
  updateQuery,
  editItemQuery,
};
