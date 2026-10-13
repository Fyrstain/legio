describe("deployment URL handling", () => {
  const previousPublicUrl = process.env.PUBLIC_URL;

  afterEach(() => {
    if (previousPublicUrl === undefined) delete process.env.PUBLIC_URL;
    else process.env.PUBLIC_URL = previousPublicUrl;
    jest.resetModules();
  });

  it("keeps the application base path in navigation links", () => {
    process.env.PUBLIC_URL = "/legio/";
    jest.resetModules();
    const { getPublicPath, toPublicUrl } = require("./PublicUrl");

    expect(getPublicPath()).toBe("/legio");
    expect(toPublicUrl("ImplementationGuide")).toBe("/legio/ImplementationGuide");
  });

  it("does not strip a similarly prefixed route", () => {
    process.env.PUBLIC_URL = "/legio/";
    jest.resetModules();
    const { toAppPathname } = require("./PublicUrl");

    expect(toAppPathname("https://example.test/legio-next/Home")).toBe("/legio-next/Home");
  });
});

export {};
