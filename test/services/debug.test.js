const app = require("../../src/app");

describe("'debug' service", () => {
  it("registered the service", () => {
    const service = app.service("debug");
    expect(service).toBeTruthy();
  });
});
