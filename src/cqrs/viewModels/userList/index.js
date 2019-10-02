const { eventTypes: eventNews } = require("../../aggregates/user");

module.exports = {
  name: "user-list",
  route: "/user-list",
  projection: app => ({
    [eventNews.CREATED]: event => {
      app.service("user-list").create({
        _id: event.aggregateId,
        username: event.payload.username,
        email: event.payload.email
      });
    }
  })
};
