import { NavLink, Outlet } from "react-router-dom";

const navigationItems = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/measurements", label: "Measurements" },
  { to: "/workouts", label: "Workouts" },
  { to: "/daily-log", label: "Daily log" },
  { to: "/analysis", label: "AI analysis" },
];

export function AppShell() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 h-[68px] border-b border-[var(--line)] bg-[rgba(246,247,249,0.92)] backdrop-blur-md">
        <div className="shell mx-auto flex h-full w-full max-w-[1180px] items-center justify-between gap-5 px-5">
          <NavLink to="/" className="flex shrink-0 items-center gap-3 text-[var(--ink)] no-underline">
            <span className="font-serif-display flex h-[34px] w-[34px] items-center justify-center rounded-[8px] bg-[var(--green)] text-xl text-[var(--lime)]">
              M
            </span>
            <span>
              <span className="block text-[11px] font-black uppercase leading-none text-[var(--green)]">Move Free</span>
              <span className="mobile-optional mt-1 block text-xs text-[var(--muted)]">Body Dashboard</span>
            </span>
          </NavLink>
          <nav aria-label="Primary" className="hidden min-[700px]:block">
            <ul className="flex min-w-max gap-1">
              {navigationItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `nav-link px-3 py-2 ${
                        isActive
                          ? "bg-[var(--ink)] text-white"
                          : "text-[var(--muted)] hover:bg-white hover:text-[var(--ink)]"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <details className="relative min-[700px]:hidden">
            <summary className="button-secondary cursor-pointer list-none">Menu</summary>
            <nav aria-label="Primary mobile" className="absolute right-0 top-11 w-48 rounded-[8px] border border-[var(--line)] bg-white p-2 shadow-[0_8px_24px_rgba(17,24,39,0.08)]">
              <ul className="space-y-1">
                {navigationItems.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        `nav-link w-full justify-start px-3 py-2 ${
                          isActive
                            ? "bg-[var(--ink)] text-white"
                            : "text-[var(--muted)] hover:bg-[var(--paper)] hover:text-[var(--ink)]"
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </details>
          <span className="mobile-optional flex shrink-0 items-center gap-2 text-[11px] font-bold uppercase text-[var(--muted)]">
            <span className="h-2 w-2 rounded-full bg-[#54a876] ring-4 ring-[#dbeadd]" />
            Dashboard
          </span>
        </div>
      </header>
      <div className="shell mx-auto w-full max-w-[1180px] px-5 pb-10 pt-8">
        <Outlet />
      </div>
    </div>
  );
}
