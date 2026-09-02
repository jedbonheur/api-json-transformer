import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app.js";

const config = {
  maxReplacements: 2,
  maxBodyBytes: 1_000_000,
};

describe("POST /replace", () => {
  it("returns transformed JSON and the replacement count", async () => {
    const app = createApp(config);

    const response = await request(app)
      .post("/replace")
      .send({
        pet: "dog",
        animals: ["dog", "dog"],
        note: "dog park",
      })
      .expect("Content-Type", /json/)
      .expect("X-Replacements-Made", "2")
      .expect(200);

    expect(response.body).toEqual({
      pet: "cat",
      animals: ["cat", "dog"],
      note: "dog park",
    });
  });
  it("accepts a string as the root JSON value", async () => {
    const app = createApp(config);

    const response = await request(app)
      .post("/replace")
      .set("Content-Type", "application/json")
      .send('"dog"')
      .expect("X-Replacements-Made", "1")
      .expect(200);

    expect(response.body).toBe("cat");
  });

  it("distinguishes JSON null from a missing body", async () => {
    const app = createApp(config);

    const nullResponse = await request(app)
      .post("/replace")
      .set("Content-Type", "application/json")
      .send("null")
      .expect("X-Replacements-Made", "0")
      .expect(200);

    expect(nullResponse.body).toBeNull();

    const emptyResponse = await request(app)
      .post("/replace")
      .set("Content-Type", "application/json")
      .expect(400);

    expect(emptyResponse.body).toEqual({
      error: "A JSON body is required",
    });
  });
  it("rejects unsupported content types", async () => {
    const app = createApp(config);

    await request(app)
      .post("/replace")
      .set("Content-Type", "text/plain")
      .send('{"pet":"dog"}')
      .expect("Content-Type", /json/)
      .expect(415, {
        error: "Content-Type must be application/json",
      });
  });

  it("returns JSON for malformed request bodies", async () => {
    const app = createApp(config);

    const response = await request(app)
      .post("/replace")
      .set("Content-Type", "application/json")
      .send('{"pet":')
      .expect("Content-Type", /json/)
      .expect(400);

    expect(response.body).toEqual({
      error: "Request body is not valid JSON",
    });
  });

  it("rejects bodies over the configured size", async () => {
    const app = createApp({
      ...config,
      maxBodyBytes: 20,
    });

    const response = await request(app)
      .post("/replace")
      .send({
        pet: "dog",
        padding: "1234567890",
      })
      .expect("Content-Type", /json/)
      .expect(413);

    expect(response.body).toEqual({
      error: "JSON body is too large",
    });
  });
  it("applies the maximum independently to concurrent requests", async () => {
    const app = createApp({
      ...config,
      maxReplacements: 1,
    });

    const responses = await Promise.all(
      Array.from({ length: 25 }, () =>
        request(app).post("/replace").send(["dog", "dog"]).expect(200),
      ),
    );

    for (const response of responses) {
      expect(response.body).toEqual(["cat", "dog"]);
      expect(response.headers["x-replacements-made"]).toBe("1");
    }
  });
});

describe("supporting routes", () => {
  it("reports that the service is healthy", async () => {
    const app = createApp(config);

    await request(app)
      .get("/health")
      .expect("Content-Type", /json/)
      .expect(200, {
        status: "ok",
      });
  });

  it("returns a JSON response for an unknown route", async () => {
    const app = createApp(config);

    await request(app)
      .get("/does-not-exist")
      .expect("Content-Type", /json/)
      .expect(404, {
        error: "Route not found",
      });
  });
});
