const readinessItems = [
  {
    label: "Internal corpus ingestion",
    status: "In progress",
    description: "Prioritize grant manuals, SOPs, and internal guidance."
  },
  {
    label: "RAG pipeline integration",
    status: "Not started",
    description: "Wire Express API to retrieval and generation modules."
  },
  {
    label: "Telemetry adapters",
    status: "Design phase",
    description: "Confirm data contracts for residual, turbidity, and flow."
  },
  {
    label: "LaTeX validation",
    status: "Planned",
    description: "Implement schema checks before exports are released."
  }
];

const activity = [
  {
    title: "Draft workspace updated",
    detail: "Added multi-step wizard for template selection and prompt design.",
    time: "Today 10:15"
  },
  {
    title: "Telemetry module scaffolded",
    detail: "Monitoring dashboard placeholders ready for RAG outputs.",
    time: "Yesterday 16:40"
  },
  {
    title: "Daily runs queue",
    detail: "Scheduler cards defined for dosing checks and corpus refresh.",
    time: "Yesterday 09:25"
  }
];

export const Dashboard = () => {
  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">Workspace Overview</h3>
          <p className="text-sm text-slate-400">
            Track readiness for internal grant drafting and external operator support. Quick links below jump
            into the major workflows.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <a
              href="/draft"
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-brand-500/40"
            >
              <p className="text-sm font-semibold text-slate-100">Internal drafting</p>
              <p className="mt-2 text-sm text-slate-400">
                Configure prompts, preview citations, and export LaTeX packages.
              </p>
              <span className="mt-3 inline-flex text-xs font-semibold uppercase tracking-wide text-brand-200">
                Phase 1 focus
              </span>
            </a>
            <a
              href="/telemetry"
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-brand-500/40"
            >
              <p className="text-sm font-semibold text-slate-100">External operations</p>
              <p className="mt-2 text-sm text-slate-400">
                Review telemetry, safety scores, and operator-facing recommendations.
              </p>
              <span className="mt-3 inline-flex text-xs font-semibold uppercase tracking-wide text-slate-400">
                Phase 2 preparation
              </span>
            </a>
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Latest activity</p>
          <ul className="mt-3 space-y-3 text-sm text-slate-300">
            {activity.map((item) => (
              <li key={item.title} className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{item.time}</span>
                </div>
                <p className="mt-1 font-semibold text-slate-100">{item.title}</p>
                <p className="mt-1 text-xs text-slate-400">{item.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h4 className="text-sm font-semibold text-slate-200">Corpus sources</h4>
          <p className="mt-2 text-2xl font-semibold text-slate-100">0 / 85</p>
          <p className="mt-2 text-xs text-slate-500">
            Documents tagged for ingestion. Connect backend to update this metric.
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h4 className="text-sm font-semibold text-slate-200">Drafts generated</h4>
          <p className="mt-2 text-2xl font-semibold text-slate-100">0</p>
          <p className="mt-2 text-xs text-slate-500">Pending RAG integration.</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h4 className="text-sm font-semibold text-slate-200">Telemetry sites</h4>
          <p className="mt-2 text-2xl font-semibold text-slate-100">3</p>
          <p className="mt-2 text-xs text-slate-500">Prototype data streams configured for UI testing.</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h4 className="text-sm font-semibold text-slate-200">Safety compliance</h4>
          <p className="mt-2 text-2xl font-semibold text-slate-100">82%</p>
          <p className="mt-2 text-xs text-slate-500">Calculated placeholder based on recent mock runs.</p>
        </div>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <h4 className="text-sm font-semibold text-slate-100">Readiness checklist</h4>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {readinessItems.map((item) => (
            <div key={item.label} className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-100">{item.label}</p>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
                  {item.status}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-400">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
