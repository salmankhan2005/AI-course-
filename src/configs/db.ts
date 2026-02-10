import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const sql = neon("postgresql://neondb_owner:npg_DsBOzZQ0j8Sn@ep-wandering-block-aicghyg4-pooler.c-4.us-east-1.aws.neon.tech/AI-course?sslmode=require");
export const db = drizzle(sql);
