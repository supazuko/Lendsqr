import { createRequire } from "module";
import { fileURLToPath } from "url";
const require = createRequire(import.meta.url);
const path = require("path");
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const development = {
  client: "sqlite3",
  connection: {
    filename: path.join(__dirname, "db.sqlite3"),
  },
  migrations: {
    tableName: "knex_migrations",
  },
  useNullAsDefault: true,
};
export const staging = {
  client: "mysql",
  connection: {
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: "knex_migrations",
  },
};
export const production = {
  client: "mysql",
  connection: {
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: "knex_migrations",
  },
};
