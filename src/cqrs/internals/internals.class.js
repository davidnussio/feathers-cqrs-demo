exports.Internals = class Internals {
  constructor(options, app) {
    this.options = options || {};
    this.app = app;
    this.eventStore = options.eventStore;
  }

  initializeAggregatesInfo() {
    const aggregates = this.app.get("cqrs:internals:aggregates");
    const aggregatesInfo = aggregates.map(aggregate => {
      const commands = Object.keys(aggregate.commands);
      return { name: aggregate.name, commands, events: aggregate.eventTypes };
    });
    this.aggregatesInfo = aggregatesInfo;
  }

  initializeViewModelsInfo() {
    const viewModels = this.app.get("cqrs:internals:viewModels");
    const viewModelsInfo = viewModels.map(viewModel => {
      const { name, route, projection } = viewModel;
      const eventHandlers = Object.keys(projection());
      return { name, route, eventHandlers };
    });
    this.viewModelsInfo = viewModelsInfo;
  }

  async find() {
    this.initializeAggregatesInfo();
    this.initializeViewModelsInfo();
    return { aggregates: this.aggregatesInfo, viewModels: this.viewModelsInfo };
  }
};
