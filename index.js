import { development, staging, production } from "./db/knexfile.js";
import { config } from "dotenv";
import app from "./app.js";
import knex from "knex";
config({ path: "./config.env" });

const mode = process.env.NODE_ENV;
let knexConfig;
if (mode === "production") {
  knexConfig = production;
} else if (mode === "staging") {
  knexConfig = staging;
} else {
  knexConfig = development;
}

const applicationKnex = knex(knexConfig);

applicationKnex.schema.hasTable("users").then(function (exists) {
  if (!exists) {
    return applicationKnex.schema.createTable("users", function (t) {
      t.uuid("id").primary().notNullable().unique();
      t.string("firstName", 100).notNullable();
      t.string("lastName", 100).notNullable();
      t.string("password").notNullable();
      t.string("email", 100).notNullable().unique();
    });
  }
});

applicationKnex.schema.hasTable("account").then(function (exists) {
  if (!exists) {
    return applicationKnex.schema.createTable("account", function (t) {
      t.uuid("id").primary().notNullable().unique();
      t.uuid("accountNumber").notNullable().unique();
      t.decimal("balance").unsigned();
      t.uuid("ownerId").references("id").inTable("users").notNullable();
    });
  }
});

const port = process.env.PORT || 4000;

export const server = app.listen(port, () => {
  console.log(`App running in ${mode} mode on port ${port}....`);
});

process.on("unhandledRejection", (err) => {
  console.log("unhandled rejection, Shutting down....");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

export default applicationKnex;
