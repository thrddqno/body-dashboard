import { requestJson } from "@/api/httpClient";

describe("requestJson", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("parses backend api error payloads including field errors", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          timestamp: "2026-08-31T12:00:00",
          status: 400,
          error: "Bad Request",
          message: "Request validation failed",
          fieldErrors: {
            weightKg: "weightKg must be positive",
          },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    await expect(requestJson("/body-metrics")).rejects.toMatchObject({
      message: "Request validation failed",
      status: 400,
      fieldErrors: {
        weightKg: "weightKg must be positive",
      },
    });
  });
});
