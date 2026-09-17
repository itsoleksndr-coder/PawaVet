import { createApp } from "../backend/app";
import { database } from "../backend/db";
export default createApp(database());
