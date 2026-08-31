import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { AppShell } from "@/components/AppShell";
import { NotFoundPage } from "@/pages/NotFoundPage";

describe("NotFoundPage route", () => {
  it("renders inside the application shell for unknown routes", () => {
    render(
      <MemoryRouter initialEntries={["/unknown"]}>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Page not found")).toBeInTheDocument();
    expect(screen.getByText("Body Dashboard")).toBeInTheDocument();
  });
});
