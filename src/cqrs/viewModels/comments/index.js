const { eventTypes: eventNews } = require("../../aggregates/news");

module.exports = {
  name: "comments",
  route: "/comments",
  projection: app => ({
    [eventNews.COMMENT_CREATED]: async event => {
      const {
        aggregateId,
        payload: { commentId, comment, createdBy }
      } = event;

      const [news, user] = await Promise.all([
        app
          .service("read-model")
          .find({ query: { readModel: "news", aggregateId } }),
        app
          .service("read-model")
          .find({ query: { readModel: "user", aggregateId: createdBy } })
      ]);

      return app.service("comments").create({
        commentId,
        comment,
        user: { userId: createdBy, ...user },
        newsTitle: news.title
      });
    }
  })
};
