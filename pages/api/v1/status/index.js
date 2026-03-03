import { createRouter } from "next-connect";
import database from "infra/database.js";
import { InternalServerError, MethodNotAllowedError } from "infra/errors";

const router = createRouter();

router.get(getHandler);

export default router.handler({
  onNoMatch: onNoMatchHandler,
  onError: onErrorHandler,
});

function onNoMatchHandler(request, response) {
  const publicErrorObject = new MethodNotAllowedError();
  response.status(publicErrorObject.status_code).json(publicErrorObject);
}

function onErrorHandler(error, request, response) {
  const publicErrorObject = new InternalServerError({
    cause: error,
  });

  console.log("\n Erro dentro do catch do next-connect:");
  console.error(publicErrorObject);

  response.status(500).json(publicErrorObject);
}

async function getHandler(request, response) {
  const updatedAt = new Date().toISOString();

  const databaseVersionResult = await database.query("SHOW server_version;");
  const databaseVersionValue = databaseVersionResult.rows[0].server_version;

  const maxConnectionsResult = await database.query("SHOW max_connections;");
  const maxConnectionsValue = parseInt(
    maxConnectionsResult.rows[0].max_connections,
  );

  const databaseName = process.env.POSTGRES_DB;
  const databaseStats = await database.query({
    text: "SELECT count(*)::int AS total_connections FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });

  const databaseTotalConnections = databaseStats.rows[0].total_connections;

  const dependencies = {
    database: {
      version: databaseVersionValue,
      max_connections: maxConnectionsValue,
      opened_connections: databaseTotalConnections,
    },
  };

  response.status(200).json({
    updated_at: updatedAt,
    dependencies,
  });
}
