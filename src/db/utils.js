import log from "loglevel";
import {
  defineCustomElements as jeepSqlite,
  applyPolyfills,
} from "jeep-sqlite/loader";
import { Capacitor } from "@capacitor/core";
import { CapacitorSQLite, SQLiteConnection } from "@capacitor-community/sqlite";

const LOG = "[SQLite]";
let capSQLite;
let isWeb;

const init = async ({ db } = {}) => {
  capSQLite = new SQLiteConnection(CapacitorSQLite);

  log.debug(LOG, "init");
  isWeb = Capacitor.getPlatform() === "web";

  log.debug(LOG, "polyfills");
  await applyPolyfills();
  await jeepSqlite(window);

  if (isWeb) {
    log.debug(LOG, "create jeep-sqlite component");
    const jeepElement = document.createElement("jeep-sqlite");
    document.body.appendChild(jeepElement);
    await customElements.whenDefined("jeep-sqlite");
    await capSQLite.initWebStore();
    log.debug(LOG, "web store initialized");
  } else {
    await capSQLite.echo("hello from SQLite");
  }

  if (!db) return;
  const { name, schema, version, getUpgrade } = db;
  const { result: dbExist } = await capSQLite.isDatabase(name);
  log.debug(LOG, "init db", { name, exist: dbExist });

  await capSQLite.closeAllConnections();
  await capSQLite.checkConnectionsConsistency();
  const con = await capSQLite.createConnection(name);
  await con.open();
  if (!dbExist) {
    log.debug(LOG, "create db...", { name });
    const { changes } = await con.execute(schema);
    log.debug(LOG, "db created", { name, changes });
  }


  // check db version
  const { version: dbver } = await con.getVersion();
  log.debug(LOG, "check db version", {
    name,
    version: dbver,
  });
  await capSQLite.closeConnection(name);

  // upgrade db
  if (version > dbver) {
    var upgrade = getUpgrade({ fromVersion: dbver, toVersion: version });
    if (upgrade) {
      log.debug(LOG, "upgrade db", {
        name,
        upgrade,
      });

      await capSQLite.addUpgradeStatement(
        name,
        upgrade.fromVersion,
        upgrade.toVersion,
        upgrade.statement,
        upgrade.set
      );

      const db = await capSQLite.createConnection(
        name,
        false,
        "no-encryption",
        version
      );
      await db.open();
      await db.close();
      await capSQLite.closeConnection(name);
    } else {
      log.debug(LOG, "upgrade not found", {
        name,
        fromVersion: dbver,
        toVersion: version,
      });
    }
  }

  log.debug(LOG, "done");
};

export { init, capSQLite, isWeb };
