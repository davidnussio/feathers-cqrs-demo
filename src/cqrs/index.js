/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const fs = require("fs");
const commandHandler = require("resolve-command").default;
const createEsStorage = require("resolve-storage-lite").default;
// const createSnapshotAdapter = require("resolve-snapshot-lite").default;
const createEventStore = require("resolve-es").default;

const logger = require("../logger");

// the news-aggregate.js file is placed below
const viewsService = require("./viewModels/views.service");
const commandHandlerService = require("./command-handler/command-handler.service");
const internalServices = require("./internals/internals.service");

module.exports = function(app) {
  const aggregates = ["news", "user"].map(file => {
    return require(`./aggregates/${file}`);
  });

  app.set("cqrs:internals:aggregates", aggregates);

  const viewModels = fs
    .readdirSync(`${__dirname}/viewModels`, { withFileTypes: true })
    .map(dirent => {
      if (dirent.isDirectory() === false) {
        return false;
      }

      const requiredFile = `${__dirname}/viewModels/${dirent.name}/index.js`;
      const err = fs.accessSync(requiredFile, fs.constants.F_OK);

      if (err) {
        logger.error(`${requiredFile} does not exits`);
        throw new Error(`${requiredFile} does not exits`);
      }
      const requiredViewModel = require(requiredFile);
      logger.info(
        `Loaded view model ${requiredViewModel.name} → (route: ${requiredViewModel.route})`
      );
      return requiredViewModel;
    })
    .filter(vm => vm);

  app.set("cqrs:internals:viewModels", viewModels);

  const publishEvent = context => async event => {
    logger.info("Send event type", event.type);
    await context.emit(event.type, event);
  };

  const eventStore = createEventStore({
    storage: createEsStorage({ databaseFile: "./data/event-store.sqlite" }),
    publishEvent: publishEvent(app)
  });

  // const snapshotAdapter = createSnapshotAdapter({
  //   databaseFile: "./data/aggregates-snapshot.sqlite",
  //   bucketSize: 100
  // });

  const execute = commandHandler({
    eventStore,
    aggregates
    // snapshotAdapter
  });

  app.set("eventStore", eventStore);
  app.set("executeCommand", execute);

  app.configure(commandHandlerService);
  app.configure(internalServices);
  app.configure(viewsService);
};
