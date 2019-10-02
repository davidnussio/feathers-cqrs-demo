const { eventTypes: eventNews } = require("../../aggregates/news");

module.exports = {
  name: "news-list",
  route: "/news-list",
  projection: app => ({
    [eventNews.CREATED]: event => {
      app
        .service("news-list")
        .create({ title: event.payload.title, _id: event.aggregateId });
    },
    [eventNews.DELETED]: event => {
      app.service("news-list").remove(event.aggregateId);
    },
    [eventNews.CREATED]: event => {
      app.service("news-list").create({
        _id: event.aggregateId,
        title: event.payload.title,
        voted: 0,
        comments: 0
      });
    },
    [eventNews.UPVOTED]: async event => {
      const view = await app.service("news-list").get(event.aggregateId);

      await app.service("news-list").patch(event.aggregateId, {
        ...view,
        voted: view.voted + 1
      });
    },
    [eventNews.COMMENT_CREATED]: async event => {
      const view = await app.service("news-list").get(event.aggregateId);

      await app.service("news-list").patch(event.aggregateId, {
        ...view,
        comments: view.comments + 1
      });
    }
  })
};
