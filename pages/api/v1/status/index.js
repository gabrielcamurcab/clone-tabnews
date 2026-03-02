import database from "infra/database.js";
import { InternalServerError } from "infra/errors";

export default async function status(request, response) {
  try {
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
  } catch (error) {
    const publicErrorObject = new InternalServerError({
      cause: error,
    });

    console.log("\n Erro dentro do catch do controller");
    console.error(publicErrorObject);

    response.status(500).json(publicErrorObject);
  }
}
