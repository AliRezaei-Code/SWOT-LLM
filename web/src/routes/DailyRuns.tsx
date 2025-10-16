const jobs = [
  {
    id: "scheduler-01",
    name: "District 5 daily dosing check",
    nextRun: "Tomorrow 06:00",
    status: "On schedule",
    notes: "Uses telemetry and local SOPs."
  },
  {
    id: "scheduler-02",
    name: "Weekly grant corpus refresh",
    nextRun: "Friday 18:00",
    status: "Pending",
    notes: "Awaiting new procurement documents."
  }
];

const runHistory = [
  {
    timestamp: "Today 06:05",
    job: "District 5 daily dosing check",
    outcome: "Recommendation sent to operator channel.",
    status: "Success"
  },
  {
    timestamp: "Yesterday 06:05",
    job: "District 5 daily dosing check",
    outcome: "Safety score 82, no action.",
    status: "Success"
  },
  {
    timestamp: "Mon 18:10",
    job: "Weekly grant corpus refresh",
    outcome: "Ingested 14 new documents.",
    status: "Success"
  }
];

export const DailyRuns = () => {
  return (
    <div className="space-y-6">
      <header>
        <h3 className="text-lg font-semibold text-slate-100">Automated Daily Runs</h3>
        <p className="text-sm text-slate-400">
          Configure background jobs that keep telemetry insights and grant drafts current.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h4 className="text-sm font-semibold text-slate-100">Scheduled jobs</h4>
          <p className="text-xs text-slate-500">
            Jobs blend telemetry ingestion, RAG draft generation, and notification workflows.
          </p>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            {jobs.map((job) => (
              <li key={job.id} className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-100">{job.name}</p>
                  <span className="text-xs font-semibold uppercase text-brand-200">{job.status}</span>
                </div>
                <p className="mt-2 text-xs text-slate-400">Next run: {job.nextRun}</p>
                <p className="mt-2 text-xs text-slate-500">{job.notes}</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                  <button className="rounded-md border border-slate-700 px-3 py-1 hover:border-brand-400 hover:text-brand-200">
                    Edit
                  </button>
                  <button className="rounded-md border border-slate-700 px-3 py-1 hover:border-brand-400 hover:text-brand-200">
                    Run now
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h4 className="text-sm font-semibold text-slate-100">Run history</h4>
          <div className="mt-3 space-y-3 text-sm text-slate-300">
            {runHistory.map((entry) => (
              <div key={entry.timestamp} className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{entry.timestamp}</span>
                  <span className="text-brand-200">{entry.status}</span>
                </div>
                <p className="mt-2 font-semibold text-slate-100">{entry.job}</p>
                <p className="mt-1 text-xs text-slate-400">{entry.outcome}</p>
                <button className="mt-3 text-xs font-semibold text-brand-200 hover:text-brand-100">
                  View recommendation record
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <h4 className="text-sm font-semibold text-slate-100">Notification channels</h4>
        <p className="mt-2 text-sm text-slate-400">
          Configure operator alerts (SMS, email, radio) once the messaging adapter is wired in.
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-dashed border-slate-700 p-4 text-sm text-slate-400">
            SMS gateway placeholder
          </div>
          <div className="rounded-lg border border-dashed border-slate-700 p-4 text-sm text-slate-400">
            Email digest template placeholder
          </div>
          <div className="rounded-lg border border-dashed border-slate-700 p-4 text-sm text-slate-400">
            Radio dispatch summary placeholder
          </div>
        </div>
      </section>
    </div>
  );
};
