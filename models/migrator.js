import database from "infra/database.js";
import { ServiceError } from "infra/errors";
import migrationRunner from "node-pg-migrate";
import { join } from "node:path";

const defaultMigrationsOptions = {
  dir: join("infra", "migrations"),
  dryRun: true,
  direction: "up",
  verbose: true,
  migrationsTable: "pg_migrations",
};

async function listPendingMigrations() {
  let dbClient;

  try {
    dbClient = await database.getNewClient();

    const pendingMigrations = await migrationRunner({
      ...defaultMigrationsOptions,
      dbClient,
    });

    return pendingMigrations;
  } catch (error) {
    throw new ServiceError({
      message: "Erro ao listar as migrações pendentes.",
      cause: error,
    });
  } finally {
    dbClient?.end();
  }
}

async function runPendingMigrations() {
  let dbClient;

  try {
    dbClient = await database.getNewClient();

    const migratedMigrations = await migrationRunner({
      ...defaultMigrationsOptions,
      dryRun: false,
      dbClient,
    });

    return migratedMigrations;
  } catch (error) {
    throw new ServiceError({
      message: "Erro ao executar as migrações pendentes.",
      cause: error,
    });
  } finally {
    dbClient?.end();
  }
}

const migrator = {
  listPendingMigrations,
  runPendingMigrations,
};

export default migrator;
