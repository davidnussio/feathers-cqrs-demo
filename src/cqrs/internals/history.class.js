const logger = require("../../logger");

async function run(eventStore, eventFilter, withPayload) {
  let eventCount = 0;
  const state = [];

  const eventHandler = async event => {
    logger.debug("→ event", event);
    state.push({
      version: event.aggregateVersion,
      timestamp: event.timestamp,
      datetime: new Date(event.timestamp).toISOString(),
      eventType: event.type,
      ...{ ...(withPayload && { payload: event.payload }) }
    });
    eventCount++;
  };

  await eventStore.loadEvents(eventFilter, eventHandler);

  logger.info("Loaded %d", eventCount);
  return state;
}

async function regenerateViewModel(eventStore, eventFilter, projections) {
  let eventCount = 0;

  const eventHandler = async event => {
    logger.info("→ event", event);
    const handler = projections[event.type];
    if (typeof handler === "function") {
      await handler(event);
    }
    eventCount++;
  };

  await eventStore.loadEvents(eventFilter, eventHandler);

  logger.info("Loaded %d", eventCount);
  return eventCount;
}

exports.History = class History {
  constructor(options, app) {
    this.options = options || {};
    this.app = app;
    this.eventStore = options.eventStore;
  }

  async create(object, params) {
    const { viewModels = [] } = params.query;

    const viewModelServices = this.app
      .get("cqrs:internals:viewModels")
      .filter(v => viewModels.includes(v.name));

    logger.info("quit", viewModelServices);

    const result = Promise.all(
      viewModelServices.map(viewModelService => {
        const projection = viewModelService.projection(this.app);
        const eventTypes = Object.keys(projection).map(eventType => eventType);
        const eventFilter = {
          eventTypes
          // aggregateIds: [aggregateId], // Or null to load ALL aggregate ids
          // startTime, // Or null to load events from beginning of time
          // finishTime // Or null to load events to current time
        };
        return regenerateViewModel(this.eventStore, eventFilter, projection);
      })
    );

    return result;
  }

  async find(params) {
    // console.log(params);
    const hrstart = process.hrtime();
    const {
      query: { readModel, aggregateId, payload = false, startTime, finishTime }
    } = params;

    logger.info(
      `Load event history for aggregate ${readModel} with aggregateId ${aggregateId}`
    );

    logger.info(
      `Options: payload=%s, startTime=%s, finishTime=%s`,
      payload,
      startTime,
      finishTime
    );

    const eventFilter = {
      // eventTypes: ["news/created"] // Or null to load ALL event types
      aggregateIds: [aggregateId], // Or null to load ALL aggregate ids
      startTime, // Or null to load events from beginning of time
      finishTime // Or null to load events to current time
    };

    // const projection = this.app.get(`readModel/${readModel}`);

    const result = await run(this.eventStore, eventFilter, !!payload);

    const hrend = process.hrtime(hrstart);
    logger.info(
      `Materialized ${readModel} with aggregateId ${aggregateId} %ds %dms`,
      hrend[0],
      hrend[1] / 1000000
    );
    return result;
  }
};
