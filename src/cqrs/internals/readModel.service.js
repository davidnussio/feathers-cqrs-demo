// Initializes the `news` service on path `/news`
const { ReadModelView } = require("./readModel.class");
const hooks = require("./internals.hooks");
const logger = require("../../logger");

module.exports = function(app) {
  const eventStore = app.get("eventStore");

  const aggregates = app.get("cqrs:internals:aggregates");

  aggregates.forEach(({ name, projection }) => {
    logger.info(`Configure readModel: ${name}`);
    app.set(`readModel/${name}`, projection);
  });

  const options = {
    eventStore
  };

  // Initialize our service with any options it requires
  app.use("/read-model", new ReadModelView(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service("read-model");

  app.use("/read-model/:readModel/:aggregateId", service);

  service.hooks(hooks);
};
