const schema = `


CREATE TABLE IF NOT EXISTS options(
  id INTEGER PRIMARY KEY,
  name TEXT ,
  value TEXT,
	last_modified	INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE IF NOT EXISTS groups(
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
	last_modified	INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE IF NOT EXISTS meters(
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  unit TEXT,
  start_value REAL,
  description TEXT,
  user TEXT,
  last_modified	INTEGER DEFAULT (strftime('%s', 'now'))
);
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS readings(
  id INTEGER PRIMARY KEY,
  value REAL,
  date DATE,
  comment TEXT,
  meter_id INTEGER,
  average REAL,
  last_modified	INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (meter_id) REFERENCES meters(id) 
  ON DELETE CASCADE
  ON UPDATE NO ACTION
);

INSERT INTO options (name, value) VALUES ('locale', 'en');
INSERT INTO options (name, value) VALUES ('theme', 'dark');
`

//`;
//  

const upgrades = [
  // {
  //   fromVersion: 1,
  //   toVersion: 10,
  //   statement: statement_v10,
  //   // required, to update database version
  //   set: [
  //     {
  //       statement: "SELECT id FROM users",
  //       values: [],
  //     },
  //   ],
  // },
];

const getUpgrade = ({ fromVersion, toVersion }) => {
  return upgrades.find(
    (u) => u.fromVersion === fromVersion && u.toVersion === toVersion
  );
};

export default {
  name: "db",
  version: 2,
  schema,
  getUpgrade,
};
