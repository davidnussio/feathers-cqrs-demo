const { eventTypes: eventNews } = require("../../aggregates/news");

module.exports = {
  name: "news-stats",
  route: "/news-stats",
  projection: app => ({
    [eventNews.CREATED]: event => {
      app.service("news-stats").create({
        _id: event.aggregateId,
        title: event.payload.title,
        voted: 0,
        comments: 0
      });
    },
    [eventNews.UPVOTED]: async event => {
      const view = await app.service("news-stats").get(event.aggregateId);

      await app.service("news-stats").patch(event.aggregateId, {
        ...view,
        voted: view.voted + 1
      });
    },
    [eventNews.COMMENT_CREATED]: async event => {
      const view = await app.service("news-stats").get(event.aggregateId);

      await app.service("news-stats").patch(event.aggregateId, {
        ...view,
        comments: view.comments + 1
      });
    }
  })
};
