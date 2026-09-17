import "dotenv/config";
import { readFile } from "node:fs/promises";
import { database } from "../backend/db";
const db = database();
await db.transaction(async (sql) => {
  for (const file of ["001_clinic.sql", "002_urgent_queue.sql"])
    await sql.query(await readFile("migrations/" + file, "utf8"));
});
console.log("Migrations applied.");
process.exit(0);
