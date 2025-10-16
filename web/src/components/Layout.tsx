import { NavLink } from "react-router-dom";
import { ReactNode } from "react";

const navItems = [
  { to: "/dashboard", label: "Overview" },
  { to: "/draft", label: "Internal Drafting" },
  { to: "/templates", label: "Template Library" },
  { to: "/telemetry", label: "Telemetry Dashboard" },
  { to: "/daily-runs", label: "Automated Runs" },
  { to: "/records", label: "Records & Audit" }
];

export const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      <aside className="bg-slate-900 px-6 py-8 border-r border-slate-800">
        <h1 className="text-lg font-semibold tracking-wide text-brand-200">WQTA Console</h1>
        <p className="text-sm text-slate-400 mt-2 leading-relaxed">
          Guided workspace for water quality grant support and operational readiness.
        </p>
        <nav className="mt-8 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "block px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive ? "bg-brand-500/10 text-brand-200" : "text-slate-300 hover:bg-slate-800"
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="bg-slate-950">
        <header className="border-b border-slate-800 px-10 py-6">
          <h2 className="text-xl font-semibold text-slate-100">Water Quality Technical Assistant</h2>
          <p className="text-sm text-slate-400">
            Orchestrate internal grant drafting, telemetry monitoring, and safety assurance in one workspace.
          </p>
        </header>
        <section className="px-10 py-8">{children}</section>
      </main>
    </div>
  );
};
