import "dotenv/config";
import { db, migrate } from "../server/db";
await migrate();
console.log("Database schema is ready.");
await (await db()).close();
