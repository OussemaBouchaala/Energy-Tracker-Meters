const statement_get_all = `
SELECT id
  ,value
  ,date
  ,comment
  ,average
  ,meter_id
  ,last_modified modified
FROM readings
WHERE meter_id =?;
`;

const statement_get_by_id = `
SELECT id
  ,value
  ,date
  ,comment
  ,average
  ,meter_id
  , last_modified modified
FROM readings
WHERE id = ?;
`;

const statement_delete_by_id = `
DELETE FROM readings WHERE id = ?;
`;

const statement_insert = `
INSERT INTO readings (value,date,comment,average,meter_id)
VALUES (?, ?, ?, ?, ?);
`;

const statement_update = `
UPDATE readings SET
value=?,
date=?,
comment=?,
average=?,
meter_id=?
WHERE id = ?
`;

export default {
  getAll: ({ meter_id }) => ({
    statement: statement_get_all,
    values: [meter_id],
  }),
  getById: ({ id }) => ({
    statement: statement_get_by_id,
    values: [id],
  }),
  add: ({ value,date,comment,average,meter_id }) => ({
    statement: statement_insert,
    values: [value,date,comment,average,meter_id],
  }),
  deleteById: ({ id }) => ({
    statement: statement_delete_by_id,
    values: [id],
  }),
  update: ({ value,date,comment,average,meter_id, id }) => ({
    statement: statement_update,
    values: [value,date,comment,average,meter_id, id],
  }),
};
