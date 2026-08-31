import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { AppShell } from "@/components/AppShell";

describe("AppShell", () => {
  it("does not expose the removed Analytics page in navigation", () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<p>Dashboard content</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.queryByRole("link", { name: "Analytics" })).not.toBeInTheDocument();
  });
});
