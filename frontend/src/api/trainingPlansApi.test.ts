import { getTrainingPlan } from "@/api/trainingPlansApi";

describe("trainingPlansApi", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads the persisted training plan for an ISO date", async () => {
    const response = {
      date: "2026-09-01",
      dayOfWeek: "TUESDAY",
      workoutType: "PUSH",
      type: "workout",
      title: "Push",
      subtitle: "Chest, shoulders, triceps",
      warmup: [],
      exercises: [],
      guardrails: [],
      optional: [],
    };
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(response), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(getTrainingPlan("2026-09-01")).resolves.toEqual(response);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/training-plans/2026-09-01",
      expect.objectContaining({ headers: expect.any(Headers) }),
    );
  });

  it("requests a persisted template by workout type", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({}), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await getTrainingPlan("2026-09-01", undefined, "UPPER");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/training-plans/2026-09-01?workoutType=UPPER",
      expect.objectContaining({ headers: expect.any(Headers) }),
    );
  });
});
