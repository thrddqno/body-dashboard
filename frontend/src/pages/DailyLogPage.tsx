import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ApiError } from "@/api/httpClient";
import { getDailyLog, saveDailyLog } from "@/api/dailyLogsApi";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { PageHeader } from "@/components/PageHeader";
import { DailyLogForm } from "@/features/dailyLogs/components/DailyLogForm";
import type { DailyLogRequest, EnergyLevel } from "@/types/dailyLog";
import { formatDateInputValue, isValidLocalDateString } from "@/utils/dates";
import { parseOptionalInteger } from "@/utils/forms";
import { formatFullDateString, sleepHoursInputToMinutes, sleepMinutesToHoursInput } from "@/utils/formatters";

interface DailyLogFormValues {
  sleepHours: string;
  steps: string;
  energy: EnergyLevel | "";
  painNotes: string;
  recoveryNotes: string;
  estimatedCalories: string;
  estimatedProteinGrams: string;
}

const emptyValues: DailyLogFormValues = {
  sleepHours: "",
  steps: "",
  energy: "",
  painNotes: "",
  recoveryNotes: "",
  estimatedCalories: "",
  estimatedProteinGrams: "",
};

function mapToRequest(values: DailyLogFormValues): DailyLogRequest {
  return {
    sleepMinutes: sleepHoursInputToMinutes(values.sleepHours),
    steps: parseOptionalInteger(values.steps),
    energy: values.energy || null,
    painNotes: values.painNotes.trim() ? values.painNotes : null,
    recoveryNotes: values.recoveryNotes.trim() ? values.recoveryNotes : null,
    estimatedCalories: parseOptionalInteger(values.estimatedCalories),
    estimatedProteinGrams: parseOptionalInteger(values.estimatedProteinGrams),
  };
}

export function DailyLogPage() {
  const navigate = useNavigate();
  const { date } = useParams();
  const selectedDate = date ?? formatDateInputValue(new Date());
  const isSelectedDateValid = isValidLocalDateString(selectedDate);
  const selectedDateRef = useRef(selectedDate);

  const [values, setValues] = useState<DailyLogFormValues>(emptyValues);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string>();
  const [saveMessage, setSaveMessage] = useState<string>();

  useEffect(() => {
    selectedDateRef.current = selectedDate;
  }, [selectedDate]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadDailyLog() {
      setIsLoading(true);
      setError(undefined);
      setSaveMessage(undefined);

      if (!isSelectedDateValid) {
        setError("Choose a valid date in YYYY-MM-DD format.");
        setIsLoading(false);
        return;
      }

      try {
        const dailyLog = await getDailyLog(selectedDate, controller.signal);
        setValues({
          sleepHours: sleepMinutesToHoursInput(dailyLog.sleepMinutes),
          steps: dailyLog.steps?.toString() ?? "",
          energy: dailyLog.energy ?? "",
          painNotes: dailyLog.painNotes ?? "",
          recoveryNotes: dailyLog.recoveryNotes ?? "",
          estimatedCalories: dailyLog.estimatedCalories?.toString() ?? "",
          estimatedProteinGrams: dailyLog.estimatedProteinGrams?.toString() ?? "",
        });
      } catch (loadError) {
        if (loadError instanceof Error && loadError.name === "AbortError") {
          return;
        }

        if (loadError instanceof ApiError && loadError.status === 404) {
          setValues(emptyValues);
        } else {
          setError(loadError instanceof Error ? loadError.message : "Unable to load daily log.");
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadDailyLog();

    return () => controller.abort();
  }, [isSelectedDateValid, selectedDate]);

  async function handleSubmit() {
    const submittedDate = selectedDate;
    setIsSubmitting(true);
    setFormError(undefined);

    try {
      const saved = await saveDailyLog(selectedDate, mapToRequest(values));
      if (selectedDateRef.current !== submittedDate) return;
      setValues({
        sleepHours: sleepMinutesToHoursInput(saved.sleepMinutes),
        steps: saved.steps?.toString() ?? "",
        energy: saved.energy ?? "",
        painNotes: saved.painNotes ?? "",
        recoveryNotes: saved.recoveryNotes ?? "",
        estimatedCalories: saved.estimatedCalories?.toString() ?? "",
        estimatedProteinGrams: saved.estimatedProteinGrams?.toString() ?? "",
      });
      setSaveMessage("Daily log saved.");
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : "Unable to save daily log.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Daily log"
        title={isSelectedDateValid ? formatFullDateString(selectedDate) : "Invalid date"}
        description="Record sleep, steps, energy, recovery notes, calories, and protein for a specific date."
        actions={
          <input
            type="date"
            value={isSelectedDateValid ? selectedDate : ""}
            onChange={(event) => navigate(`/daily-log/${event.target.value}`)}
            disabled={isSubmitting}
            className="form-control min-w-44 text-sm"
          />
        }
      />
      {isLoading ? <LoadingState label="Loading daily log" /> : null}
      {error ? <ErrorState message={error} /> : null}
      {!isLoading && !error ? (
        <>
          {saveMessage ? <div aria-live="polite" className="rounded-[8px] border border-[#bdd6c1] bg-[var(--low-bg)] px-4 py-3 text-sm text-[var(--green)]">{saveMessage}</div> : null}
          <DailyLogForm
            values={values}
            isSubmitting={isSubmitting}
            formError={formError}
            onChange={setValues}
            onSubmit={handleSubmit}
          />
        </>
      ) : null}
    </main>
  );
}
