import request from "supertest";
import { createTestApp } from "../../helpers/test-server";

describe("Health Check API", () => {
  let app: ReturnType<typeof createTestApp>;

  beforeEach(() => {
    app = createTestApp();
  });

  it("should return health status", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});
