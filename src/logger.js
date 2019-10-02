const prettier = require("pino-pretty");
const logger = require("pino")({
  level: "info",
  prettyPrint: { translateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss.l'Z'" },
  prettier
});

module.exports = logger;
