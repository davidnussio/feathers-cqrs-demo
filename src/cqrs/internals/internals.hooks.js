const { disallow } = require("feathers-hooks-common");

function castQueryParam(name, converter) {
  return async context => {
    const { query = {} } = context.params;

    if (query[name]) {
      if (typeof query[name] === "string") {
        query[name] = converter(query[name]);
      }
    }
  };
}

function routeToQuery(name) {
  return async context => {
    const { query = {}, route = {} } = context.params;

    if (route[name] && !query[name]) {
      query[name] = route[name];
    }
  };
}

module.exports = {
  before: {
    all: [],
    find: [
      routeToQuery("readModel"),
      routeToQuery("aggregateId"),
      castQueryParam("payload", Boolean),
      castQueryParam("startTime", Number),
      castQueryParam("finishTime", Number)
    ],
    get: [],
    create: [disallow("external")],
    update: [disallow("external")],
    patch: [disallow("external")],
    remove: [disallow("external")]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
