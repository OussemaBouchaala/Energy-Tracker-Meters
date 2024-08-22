const statement_get_all = `
SELECT id
  ,value
  ,date
  ,comment
  ,last_modified modified
FROM readings;
`;

const statement_get_by_id = `
SELECT id
  ,value
  ,date
  ,comment
  , last_modified modified
FROM readings
WHERE id = ?;
`;

const statement_delete_by_id = `
DELETE FROM readings WHERE id = ?;
`;

const statement_insert = `
INSERT INTO readings (value,date,comment)
VALUES (?, ?, ?);
`;

const statement_update = `
UPDATE readings SET
value=?,
date=?,
comment=?
WHERE id = ?
`;

export default {
  getAll: () => ({
    statement: statement_get_all,
  }),
  getById: ({ id }) => ({
    statement: statement_get_by_id,
    values: [id],
  }),
  add: ({ value,date,comment }) => ({
    statement: statement_insert,
    values: [value,date,comment],
  }),
  deleteById: ({ id }) => ({
    statement: statement_delete_by_id,
    values: [id],
  }),
  update: ({ value,date,comment, id }) => ({
    statement: statement_update,
    values: [value,date,comment, id],
  }),
};
