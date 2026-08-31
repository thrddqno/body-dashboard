import { BrowserRouter, Route, Routes } from "react-router-dom";

import { AppShell } from "@/components/AppShell";
import { AiAnalysisPage } from "@/pages/AiAnalysisPage";
import { DailyLogPage } from "@/pages/DailyLogPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { MeasurementsPage } from "@/pages/MeasurementsPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { WorkoutDetailPage } from "@/pages/WorkoutDetailPage";
import { WorkoutsPage } from "@/pages/WorkoutsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/measurements" element={<MeasurementsPage />} />
          <Route path="/workouts" element={<WorkoutsPage />} />
          <Route path="/workouts/:id" element={<WorkoutDetailPage />} />
          <Route path="/daily-log">
            <Route index element={<DailyLogPage />} />
            <Route path=":date" element={<DailyLogPage />} />
          </Route>
          <Route path="/analysis" element={<AiAnalysisPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
