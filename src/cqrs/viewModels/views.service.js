const { Views } = require("./views.class");
const createModel = require("../../models/news.model");
const hooks = require("./views.hooks");
const logger = require("../../logger");

module.exports = function(app) {
  const viewModels = app.get("cqrs:internals:viewModels");

  viewModels.forEach(({ name, route, projection: createProjection }) => {
    logger.info(`Configure view model: ${name}`);
    const Model = createModel(app, name);
    const paginate = app.get("paginate");

    const options = {
      Model,
      paginate
    };

    // TODO: Better if start with /view-model/{route}
    app.use(route, new Views(options, app));
    const service = app.service(name);

    service.hooks(hooks);

    const projection = createProjection(app);

    Object.keys(projection).forEach(eventName => {
      app.on(eventName, projection[eventName]);
    });
  });
};
