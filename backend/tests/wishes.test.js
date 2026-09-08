const request = require("supertest");
const app = require("../src/app");
const { pool, ensureTable } = require("../src/db");

beforeAll(async () => {
  await ensureTable();
});

afterAll(async () => {
  await pool.end();
});

describe("GET /api/health", () => {
  it("responds with status ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

describe("POST /api/wishes", () => {
  it("creates a wish with valid data", async () => {
    const res = await request(app)
      .post("/api/wishes")
      .send({ text: "Que este demo funcione en CI", author: "Roberto" });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      text: "Que este demo funcione en CI",
      author: "Roberto",
    });
    expect(res.body.id).toBeDefined();
    expect(res.body.created_at).toBeDefined();
  });

  it("defaults author to Anónimo when not provided", async () => {
    const res = await request(app)
      .post("/api/wishes")
      .send({ text: "Un deseo sin autor" });

    expect(res.status).toBe(201);
    expect(res.body.author).toBe("Anónimo");
  });

  it("rejects an empty text", async () => {
    const res = await request(app).post("/api/wishes").send({ text: "" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it("rejects a missing text field", async () => {
    const res = await request(app).post("/api/wishes").send({ author: "Roberto" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it("rejects a whitespace-only text", async () => {
    const res = await request(app).post("/api/wishes").send({ text: "   " });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});
