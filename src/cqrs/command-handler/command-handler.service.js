// Initializes the `commandHandler` service on path `/command-handler`
const { CommandHandler } = require("./command-handler.class");
const hooks = require("./command-handler.hooks");

module.exports = function(app) {
  const executeCommand = app.get("executeCommand");

  const options = {
    executeCommand
  };

  // Initialize our service with any options it requires
  app.use("/command-handler", new CommandHandler(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service("command-handler");

  service.hooks(hooks);
};
