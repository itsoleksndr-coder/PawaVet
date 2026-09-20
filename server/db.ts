import { Pool } from "pg";
import type { PGlite } from "@electric-sql/pglite";

export interface Sql {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    params?: unknown[],
  ): Promise<{ rows: T[] }>;
}
export interface Database extends Sql {
  transaction<T>(fn: (tx: Sql) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}
let connection: Promise<Database> | undefined;
export function db(): Promise<Database> {
  if (!connection)
    connection = connect().catch((error) => {
      connection = undefined;
      throw error;
    });
  return connection;
}
async function connect(): Promise<Database> {
  if (process.env.DATABASE_URL) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      connectionTimeoutMillis: 10000,
    });
    return {
      query: (sql, params) => pool.query(sql, params),
      transaction: async (fn) => {
        const client = await pool.connect();
        try {
          await client.query("BEGIN");
          const result = await fn(client);
          await client.query("COMMIT");
          return result;
        } catch (error) {
          await client.query("ROLLBACK");
          throw error;
        } finally {
          client.release();
        }
      },
      close: () => pool.end(),
    };
  }
  // Embedded Postgres is deliberately restricted to local development/testing.
  if (process.env.VERCEL || !process.env.LOCAL_DATABASE_PATH)
    throw new Error(
      "DATABASE_URL is required. No demo storage fallback is enabled.",
    );
  const { PGlite: LocalPostgres } = await import("@electric-sql/pglite");
  const local: PGlite = new LocalPostgres(process.env.LOCAL_DATABASE_PATH);
  await local.waitReady;
  return {
    query: (sql, params) => local.query(sql, params),
    transaction: (fn) => local.transaction((tx) => fn(tx)),
    close: () => local.close(),
  };
}
export async function migrate() {
  const database = await db();
  await database.transaction(async (tx) => {
    await tx.query(
      `CREATE TABLE IF NOT EXISTS clinics (id text PRIMARY KEY, profile jsonb NOT NULL, data jsonb NOT NULL)`,
    );
    await tx.query(
      `CREATE TABLE IF NOT EXISTS users (id text PRIMARY KEY, email text UNIQUE NOT NULL, password_hash text NOT NULL, clinic_id text NOT NULL REFERENCES clinics(id), profile jsonb NOT NULL)`,
    );
    await tx.query(
      `CREATE TABLE IF NOT EXISTS sessions (token_hash text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id), expires_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now())`,
    );
    await tx.query(
      `CREATE TABLE IF NOT EXISTS login_limits (key text PRIMARY KEY, attempts integer NOT NULL, reset_at timestamptz NOT NULL)`,
    );
    await tx.query(
      `CREATE INDEX IF NOT EXISTS sessions_user_id ON sessions(user_id)`,
    );
  });
}
