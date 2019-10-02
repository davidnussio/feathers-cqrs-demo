const app = require("../../src/app");

describe("'commandHandler' service", () => {
  it("registered the service", () => {
    const service = app.service("command-handler");
    expect(service).toBeTruthy();
  });

  xit("create news", async () => {
    const service = app.service("command-handler");
    const command = {
      aggregateId: "id130001",
      aggregateName: "news",
      type: "createNews",
      payload: {
        title: "new title",
        userId: "user-id",
        text: "News content"
      }
    };
    const response = await service.create(command);
    expect(response).toEqual("argh");
  });
});
