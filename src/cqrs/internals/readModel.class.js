const logger = require("../../logger");

async function run(eventStore, eventFilter, projection) {
  let eventCount = 0;
  let state = projection.Init();

  const eventHandler = event => {
    logger.debug("→ event", event);
    state = projection[event.type](state, event);
    eventCount++;
  };

  await eventStore.loadEvents(eventFilter, eventHandler);

  logger.info("Loaded %d events", eventCount);

  return state;
}

exports.ReadModelView = class ReadModelView {
  constructor(options, app) {
    this.options = options || {};
    this.app = app;
    this.eventStore = options.eventStore;
  }

  async find(params) {
    const hrstart = process.hrtime();
    const {
      query: { readModel, aggregateId, payload = false, finishTime }
    } = params;

    logger.info(aggregateId, params);

    logger.info(
      `Load event history for aggregate '${readModel}' with aggregateId '${aggregateId}'`
    );

    logger.info(`Options: payload=%s, finishTime=%s`, payload, finishTime);

    const eventFilter = {
      // eventTypes: ["news/created"] // Or null to load ALL event types
      aggregateIds: [aggregateId], // Or null to load ALL aggregate ids
      finishTime // Or null to load events to current time
    };

    const projection = this.app.get(`readModel/${readModel}`);

    const result = await run(this.eventStore, eventFilter, projection);

    const hrend = process.hrtime(hrstart);
    logger.info(
      `Materialized ${readModel} with aggregateId ${aggregateId} %ds %dms`,
      hrend[0],
      hrend[1] / 1000000
    );
    return result;
  }
};
