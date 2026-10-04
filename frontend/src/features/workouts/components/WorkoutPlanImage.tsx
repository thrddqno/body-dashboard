import { forwardRef } from "react";

import type { PlannedExercise, PlannedWorkout } from "@/types/plannedWorkout";
import { formatFullDateString } from "@/utils/formatters";

interface WorkoutPlanImageProps {
  date: string;
  plan: PlannedWorkout;
}

function getExerciseDetails(exercise: PlannedExercise): string[] {
  const details: string[] = [];
  const setPrescription = "setPrescription" in exercise
    && typeof exercise.setPrescription === "string"
    ? exercise.setPrescription
    : undefined;

  if (setPrescription) {
    details.push(setPrescription);
  } else if (exercise.sets != null && exercise.reps) {
    details.push(`${exercise.sets} x ${exercise.reps}`);
  } else if (exercise.sets != null) {
    details.push(`${exercise.sets} set${exercise.sets === 1 ? "" : "s"}`);
  }

  if (exercise.rir) details.push(`RIR ${exercise.rir}`);
  if (exercise.rest) details.push(`Rest ${exercise.rest}`);

  return details;
}

export const WorkoutPlanImage = forwardRef<HTMLDivElement, WorkoutPlanImageProps>(
  function WorkoutPlanImage({ date, plan }, ref) {
    const useTwoColumns = plan.exercises.length > 7;

    return (
      <div
        ref={ref}
        data-testid="workout-plan-image"
        style={{
          background: "#f6f7f9",
          color: "#111827",
          fontFamily: "Arial, Helvetica, sans-serif",
          height: 1920,
          overflow: "hidden",
          padding: "72px",
          width: 1080,
        }}
      >
        <div className="flex h-full flex-col">
          <header className="border-b-2 border-[#111827] pb-10">
            <div className="flex items-center justify-between gap-8">
              <div className="flex items-center gap-5">
                <div className="flex h-20 w-20 items-center justify-center rounded-[8px] bg-[#0f5132] font-serif text-[46px] text-[#d7f171]">
                  M
                </div>
                <div>
                  <p className="text-[22px] font-black uppercase text-[#0f5132]">Move Free</p>
                  <p className="mt-1 text-[20px] text-[#5b6472]">Body Dashboard</p>
                </div>
              </div>
              <span className="rounded-[8px] bg-[#d7f171] px-5 py-3 text-[19px] font-black uppercase text-[#111827]">
                Planned workout
              </span>
            </div>

            <p className="mt-12 text-[22px] font-black uppercase text-[#0f5132]">
              {formatFullDateString(date)}
            </p>
            <h1 className="mt-3 font-serif text-[68px] font-medium leading-none text-[#111827]">
              {plan.title}
            </h1>
            <div className="mt-4 flex items-end justify-between gap-8">
              <p className="text-[27px] leading-tight text-[#5b6472]">{plan.subtitle}</p>
              <p className="shrink-0 text-[22px] font-bold text-[#111827]">
                {plan.exercises.length} exercise{plan.exercises.length === 1 ? "" : "s"}
              </p>
            </div>
          </header>

          <main className="min-h-0 flex-1 pt-9">
            {plan.warmup.length > 0 ? (
              <section className="mb-8 rounded-[8px] border border-dashed border-[#9aa3af] bg-white px-7 py-5">
                <h2 className="text-[19px] font-black uppercase text-[#0f5132]">Warm-up</h2>
                <p className="mt-2 text-[23px] leading-snug text-[#111827]">
                  {plan.warmup.join(" | ")}
                </p>
              </section>
            ) : null}

            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[20px] font-black uppercase text-[#0f5132]">Main plan</h2>
                <span className="text-[18px] font-bold uppercase text-[#5b6472]">Sets | Reps | Effort | Rest</span>
              </div>
              <div className={useTwoColumns ? "grid grid-cols-2 gap-4" : "space-y-3"}>
                {plan.exercises.map((exercise, index) => {
                  const details = getExerciseDetails(exercise);

                  return (
                    <article
                      key={`${exercise.name}-${index}`}
                      className="rounded-[8px] border border-[#d8dde5] bg-white px-6 py-4"
                    >
                      <div className="flex items-start gap-4">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[#0f5132] text-[20px] font-black text-white">
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <h3 className="font-serif text-[29px] font-medium leading-tight text-[#111827]">
                            {exercise.name}
                          </h3>
                          {details.length > 0 ? (
                            <p className="mt-1 text-[22px] font-bold leading-snug text-[#0f5132]">
                              {details.join(" | ")}
                            </p>
                          ) : null}
                          {exercise.notes ? (
                            <p className="mt-2 text-[19px] leading-snug text-[#5b6472]">
                              {exercise.notes}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            {plan.optional && plan.optional.length > 0 ? (
              <section className="mt-7 border-t border-[#d8dde5] pt-5">
                <h2 className="text-[19px] font-black uppercase text-[#0f5132]">Optional</h2>
                <p className="mt-2 text-[21px] leading-snug text-[#111827]">{plan.optional.join(" | ")}</p>
              </section>
            ) : null}

            {plan.guardrails.length > 0 ? (
              <section className="mt-7 rounded-[8px] border border-[#e3c894] bg-[#f4ead2] px-7 py-5">
                <h2 className="text-[19px] font-black uppercase text-[#b45309]">Guardrails</h2>
                <ul className="mt-2 grid grid-cols-2 gap-x-8 gap-y-1 text-[20px] leading-snug text-[#111827]">
                  {plan.guardrails.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </section>
            ) : null}
          </main>

          <footer className="mt-7 flex items-center justify-between border-t border-[#d8dde5] pt-5 text-[17px] font-bold uppercase text-[#5b6472]">
            <span>Move Free | Today&apos;s training plan</span>
            <span>Train with control</span>
          </footer>
        </div>
      </div>
    );
  },
);
