const axios = require("axios");
const url = require("url");
const uuid = require("uuid/v4");
const Fakerator = require("fakerator");
const app = require("../src/app");

const fake = Fakerator("it-IT");

const port = app.get("port") || 8998;
const getUrl = pathname =>
  url.format({
    hostname: app.get("host") || "localhost",
    protocol: "http",
    port,
    pathname
  });

console.log(getUrl("command-handler-url"));
const rand = max => Math.ceil(Math.random() * max);

// const aggregateId = uuid();
// const aggregateId = "2294bf00-d88e-11e9-a056-7b043254e4c0";
const aggregateName = "news";
const userId1 = "e32e4231-31d1-4be3-9546-6a65d8006092";
// const userId2 = "5f1c21d0-631c-4cdb-9ab4-d545b7f6000f";

(async () => {
  for (let a = 0; a < rand(2); a++) {
    const aggregateId = uuid().toString();
    // eslint-disable-next-line no-await-in-loop
    await axios.post(getUrl("command-handler"), {
      aggregateId,
      aggregateName,
      type: "createNews",
      payload: {
        title: fake.names.name(),
        userId: userId1,
        text: fake.names.name()
      }
    });
    for (let i = 0; i < rand(20); i++) {
      // eslint-disable-next-line no-await-in-loop
      await axios.post(getUrl("command-handler"), {
        aggregateId,
        aggregateName,
        type: "upvoteNews",
        payload: {
          userId: uuid().toString()
        }
      });
    }
    for (let i = 0; i < rand(100); i++) {
      // eslint-disable-next-line no-await-in-loop
      await axios.post(getUrl("command-handler"), {
        aggregateId,
        aggregateName,
        type: "createComment",
        payload: {
          commentId: uuid().toString(),
          comment: fake.names.name(),
          userId: userId1
        }
      });
    }
  }
})();
