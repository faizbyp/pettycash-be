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

module.exports = {
  insertQuery,
  deleteQuery,
  updateQuery,
};
