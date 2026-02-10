import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./src/configs/schema.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: "postgresql://neondb_owner:npg_DsBOzZQ0j8Sn@ep-wandering-block-aicghyg4-pooler.c-4.us-east-1.aws.neon.tech/AI-course?sslmode=require",
    },
});
