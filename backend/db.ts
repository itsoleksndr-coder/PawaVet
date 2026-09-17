import pg from "pg";
export interface QueryResult<T> {
  rows: T[];
}
export interface Sql {
  query<T extends pg.QueryResultRow = Record<string, unknown>>(
    sql: string,
    params?: unknown[],
  ): Promise<QueryResult<T>>;
}
export interface Database extends Sql {
  transaction<T>(fn: (sql: Sql) => Promise<T>): Promise<T>;
}
export function database(url = process.env.DATABASE_URL): Database {
  // Never silently fall back to browser storage or ephemeral local files.
  const pool = new pg.Pool({
    connectionString: url,
    max: 5,
    connectionTimeoutMillis: 5000,
  });
  return {
    async query<T extends pg.QueryResultRow>(sql: string, params?: unknown[]) {
      if (!url) throw new Error("DATABASE_URL is not configured");
      return pool.query<T>(sql, params);
    },
    async transaction<T>(fn: (sql: Sql) => Promise<T>) {
      if (!url) throw new Error("DATABASE_URL is not configured");
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const value = await fn(client);
        await client.query("COMMIT");
        return value;
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },
  };
}
