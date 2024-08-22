const statement_get_all = `
SELECT id
  , name
  , unit
  , start_value startValue
  , description
  , user
  , last_modified modified
FROM meters;
`;

const statement_get_by_id = `
SELECT id
  , name
  , unit
  , start_value startValue
  , description
  , user
  , last_modified modified
FROM meters
WHERE id = ?;
`;

const statement_delete_by_id = `
DELETE FROM meters WHERE id = ?;
`;

const statement_insert = `
INSERT INTO meters (name, unit, start_value, description, user)
VALUES (?, ?, ?, ?, ?);
`;

const statement_update = `
UPDATE meters SET
name = ?,
unit = ?,
start_value = ?,
description = ?
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
  add: ({ name, unit, startValue, description, user = "app" }) => ({
    statement: statement_insert,
    values: [name, unit, startValue, description, user],
  }),
  deleteById: ({ id }) => ({
    statement: statement_delete_by_id,
    values: [id],
  }),
  update: ({ name, unit, startValue, description, id }) => ({
    statement: statement_update,
    values: [name, unit, startValue, description, id],
  }),
};
