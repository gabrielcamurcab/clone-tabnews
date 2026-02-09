import database from "infra/database.js";
import orcherstrator from "tests/orcherstrator";
import database from "infra/database.js";

beforeAll(async () => {
  await orcherstrator.waitForAllServices();
  await database.query("drop schema public cascade; create schema public;");
});

describe("POST /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    describe("Running pending migrations", () => {
      test("For the first time", async () => {
        const response1 = await fetch(
          "http://localhost:3000/api/v1/migrations",
          {
            method: "POST",
          },
        );
        expect(response1.status).toBe(201);

        const response1Body = await response1.json();

        const countMigrations = response1Body.length;

        const testQuery = await database.query(
          "SELECT count(*) count FROM pg_migrations",
        );
        const count = parseInt(testQuery.rows[0].count);

        expect(Array.isArray(response1Body)).toBe(true);
        expect(count).toBe(countMigrations);
      });
      test("For the second time", async () => {
        const response2 = await fetch(
          "http://localhost:3000/api/v1/migrations",
          {
            method: "POST",
          },
        );
        expect(response2.status).toBe(200);

        const response2Body = await response2.json();

        expect(Array.isArray(response2Body)).toBe(true);
        expect(response2Body.length).toBe(0);
      });
    });
  });
});
