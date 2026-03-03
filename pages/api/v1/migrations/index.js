import { createRouter } from "next-connect";
import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database.js";
import controller from "infra/controller";

const router = createRouter();

router.get(getHandler).post(postHandler);

export default router.handler(controller.errorHandlers);

const defaultMigrationsOptions = {
  dir: join("infra", "migrations"),
  dryRun: true,
  direction: "up",
  verbose: true,
  migrationsTable: "pg_migrations",
};

async function getHandler(request, response) {
  let dbClient;

  try {
    dbClient = await database.getNewClient();

    const pendingMigrations = await migrationRunner({
      ...defaultMigrationsOptions,
      dbClient,
    });
    response.status(200).json(pendingMigrations);
  } finally {
    dbClient?.end();
  }
}

async function postHandler(request, response) {
  let dbClient;

  try {
    dbClient = await database.getNewClient();

    const migratedMigrations = await migrationRunner({
      ...defaultMigrationsOptions,
      dryRun: false,
      dbClient,
    });

    if (migratedMigrations.length > 0) {
      return response.status(201).json(migratedMigrations);
    }

    return response.status(200).json(migratedMigrations);
  } finally {
    dbClient?.end();
  }
}
