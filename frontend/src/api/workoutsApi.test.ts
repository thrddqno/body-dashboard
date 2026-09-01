import { listWorkoutPage, listWorkoutsByDateRange } from "@/api/workoutsApi";

describe("workoutsApi", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("requests a paginated workout page", async () => {
    const response = {
      workouts: [],
      page: 1,
      pageSize: 15,
      totalElements: 20,
      totalPages: 2,
    };
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(response), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const controller = new AbortController();

    await expect(listWorkoutPage(1, 15, controller.signal)).resolves.toEqual(response);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/workouts/page?page=1&size=15",
      expect.objectContaining({
        headers: expect.any(Headers),
        signal: controller.signal,
      }),
    );
  });

  it("requests workouts within a date range", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("[]", { status: 200, headers: { "Content-Type": "application/json" } }),
    );

    await expect(listWorkoutsByDateRange("2026-08-31", "2026-09-06")).resolves.toEqual([]);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/workouts?from=2026-08-31&to=2026-09-06",
      expect.objectContaining({ headers: expect.any(Headers) }),
    );
  });
});
