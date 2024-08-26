import log from "loglevel";

import { ref } from "@vue/runtime-core";
import { Retrier } from "@jsier/retrier";
import { capSQLite, isWeb } from "../db/utils";

const LOG = "[SQLite]";
let _dbs = [];

export default ({ dbName = "db", component = "???" } = {}) => {
  let capSQLiteConnection;

  const init = async () => {
    log.log(LOG, "initializing connection", { dbName, component });
    if (_dbs.includes(dbName)) {
      log.log(LOG, "already initializing", { dbName, component });
      return Promise.reject(`already initializing connection`);
    }

    _dbs.push(dbName);

    try {
      const { result: consistency } =
        await capSQLite.checkConnectionsConsistency(dbName);

      log.log(LOG, "check connections consistency", {
        dbName,
        component,
        consistency,
      });

      const { result: isConnection } = await capSQLite.isConnection(dbName);
      log.log(LOG, "check if a connection exists", {
        dbName,
        component,
        exists: isConnection,
      });

      if (isConnection && consistency) {
        log.log(LOG, "retrieve connection", { dbName, component });
        capSQLiteConnection = await capSQLite.retrieveConnection(dbName);
      } else {
        log.log(LOG, "create connection", { dbName, component });
        capSQLiteConnection = await capSQLite.createConnection(
          dbName,
          false,
          "no-encryption",
          1
        );
      }

      const { result: dbExists } = await capSQLite.isDatabase(dbName);
      log.log(LOG, "check if database exists", {
        dbName,
        component,
        exists: dbExists,
      });

      const index = _dbs.indexOf(dbName);
      if (index > -1) {
        _dbs.splice(index, 1);
      }

      ready.value = true;
      log.log(LOG, "connection initialized", { dbName, component });

      return capSQLiteConnection;
    } catch (err) {
      log.err("[SQLite] init", dbName, err);
      throw err;
    }
  };

  const execute = async ({ statement, transaction = true }) => {
    log.log("[SQLite] executing statement", dbName, statement);
    try {
      await open();
      const { changes } = await capSQLiteConnection.execute(
        statement,
        transaction
      );
      log.log("[SQLite] statement executed", dbName, changes);
      return changes;
    } catch (err) {
      log.error("[SQLite] execute", dbName, err);
      throw err;
    } finally {
      await close();
    }
  };

  const query = async ({ statement, values = [] }) => {
    log.log("[SQLite] querying", { dbName });
    try {
      await open();
      const { values: results } = await capSQLiteConnection.query(
        statement,
        values
      );
      log.log("[SQLite] query data", dbName, results);
      return results;
    } catch (err) {
      log.error("[SQLite] query", dbName, err);
      throw err;
    } finally {
      await close();
    }
  };

  const querySingle = async ({ statement, values = [] }) => {
    log.log("[SQLite] querying", { dbName });
    try {
      const result = await query({ statement, values });
      if (!result || result.length === 0) {
        return undefined;
      }

      return result[0];
    } catch (err) {
      log.error("[SQLite] query single", dbName, err);
      throw err;
    }
  };

  const run = async ({ statement, values = [], transaction = true }) => {
    log.log(LOG, "run statement", {
      dbName,
      statement,
      values,
      transaction,
    });

    try {
      await open();
      const { changes } = await capSQLiteConnection.run(
        statement,
        values,
        transaction
      );
      log.log(LOG, "statement runned", { dbName, changes });
      return changes;
    } catch (err) {
      log.error(LOG, "run", { dbName, err });
      throw err;
    } finally {
      await close();
    }
  };

  const open = async () => {
    if (!capSQLiteConnection) return;
    log.log("[SQLite] opening", dbName);

    try {
      const { result } = await capSQLiteConnection.isDBOpen();
      if (result) {
        log.log("[SQLite] already opened", dbName);
        return;
      }

      await capSQLiteConnection.open();
      log.log("[SQLite] opened", dbName);

      try
      {
        var z = await capSQLiteConnection.query("SELECT * FROM options");
        log.log("zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz", z);
      }
      catch(err)
      {
        log.error("Error executing SELECT * FROM options", err);
      }

    } catch (err) {
      log.error("[SQLite] open", dbName, err);
      throw err;
    }
  };

  const close = async () => {
    if (!capSQLiteConnection) return;
    log.log("[SQLite] closing", dbName);

    try {
      const { result } = await capSQLiteConnection.isDBOpen();
      if (!result) {
        log.log("[SQLite] already closed", dbName);
        return;
      }

      await capSQLiteConnection.close();
      log.log("[SQLite] closed", dbName);
    } catch (err) {
      log.error("[SQLite] close", dbName, err);
      throw err;
    }
  };

  const saveToStore = async () => {
    if (!isWeb) return;
    try {
      log.log(LOG, "saving to store", { dbName });
      await capSQLite.saveToStore(dbName);
      log.log(LOG, "data saved", { dbName });
    } catch (err) {
      log.error("[SQLite] close", dbName, err);
      throw err;
    }
  };

  const getVersion = async () => {
    if (!capSQLiteConnection) return;

    try {
      await open();
      const { version } = await capSQLiteConnection.getVersion();
      log.log("[SQLite] get-version", { dbName, version });
      return version;
    } catch (err) {
      log.error("[SQLite] get-version", { dbName, err });
      throw err;
    } finally {
      await close();
    }
  };

  const ready = ref(false);
  const fileName = `${dbName}SQLite.db`;

  log.log(LOG, "component mounted", {
    dbName,
    component,
  });

  const options = {
    limit: 3,
    firstAttemptDelay: 0,
    delay: 250,
    keepRetryingIf: () => !ready.value,
    stop,
  };

  const retrier = new Retrier(options);
  retrier.resolve(init).then(
    () => log.debug(LOG, component, "initialized"),
    () => log.debug(LOG, component, "initialiized rejected")
  );

  return {
    capSQLite,
    capSQLiteConnection,
    isWeb,
    execute,
    query,
    querySingle,
    run,
    ready,
    saveToStore,
    dbName,
    fileName,
    getVersion,
  };
};
