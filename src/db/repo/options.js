const statement_get_all = `
SELECT id
  , name
  , value
  , last_modified modified
FROM options;
`;

const statement_get_by_name = `
SELECT id
  , name
  , value
  , last_modified modified
FROM options
WHERE name = ?;
`;

const statement_insert = `
INSERT INTO options (name, value)
VALUES (?, ?);
`;

const statement_update = `
UPDATE options SET
name = ?,
value =?
WHERE id=?
`;

export default {
    getAll: () => ({
      statement: statement_get_all,
    }),
    getByName: ({ name }) => ({
      statement: statement_get_by_name,
      values: [name],
    }),
    add: ({ name, value }) => ({
      statement: statement_insert,
      values: [name, value],
    }),
    update: ({ name, value, id }) => ({
      statement: statement_update,
      values: [name, value, id],
    }),
  };