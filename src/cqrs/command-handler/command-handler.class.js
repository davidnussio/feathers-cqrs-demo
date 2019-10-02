/* eslint-disable no-unused-vars */
const { Conflict } = require("@feathersjs/errors");
const Validator = require("fastest-validator");
const logger = require("../../logger");

exports.CommandHandler = class CommandHandler {
  constructor(options, app) {
    this.options = options || {};
    this.app = app;
    this.executeCommand = options.executeCommand;

    const validate = new Validator();
    this.check = validate.compile({
      aggregateName: { type: "string" },
      aggregateId: [{ type: "string" }, { type: "number" }],
      type: { type: "string" }
    });
  }

  async create(command) {
    try {
      logger.debug("Command recived");

      const isValidCommand = this.check(command);
      if (isValidCommand !== true) {
        throw new Error(JSON.stringify(isValidCommand));
      }

      logger.debug(
        "Valid command is ready to dispach [%s/%s]",
        command.aggregateName,
        command.type
      );

      await this.executeCommand(command);

      logger.debug("Command executed, aggregateId=%s", command.aggregateId);
      return command.aggregateId;
    } catch (err) {
      logger.error("Command handler %s", err.message);
      logger.error(err.cause);
      throw new Conflict(err.message, { errors: err.cause });
    }
  }
};
