// Initializes the `news` service on path `/news`
const { Internals } = require("./internals.class");
const hooks = require("./internals.hooks");
const readModelService = require("./readModel.service");
const historyService = require("./history.service");

module.exports = function(app) {
  const options = {};

  // Initialize our service with any options it requires
  app.use("/internals", new Internals(options, app));

  const internalsService = app.service("internals");

  internalsService.hooks(hooks);
  app.configure(readModelService);
  app.configure(historyService);
};
