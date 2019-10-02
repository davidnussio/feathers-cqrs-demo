/* eslint-disable no-console */
const express = require("@feathersjs/express");
const logger = require("./logger");
const app = require("./app");

// const router = express();
const mainApp = express().use(app.get("basePath"), app);

const port = app.get("port");
const server = mainApp.listen(port);

app.setup(server);

process.on("unhandledRejection", (reason, p) =>
  logger.error("Unhandled Rejection at: Promise ", p, reason)
);

server.on("listening", () =>
  logger.info(
    "Feathers application started on http://%s:%d",
    app.get("host"),
    port
  )
);
