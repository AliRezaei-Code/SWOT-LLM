const records = [
  {
    id: "rec-1023",
    site: "District 5 Booster Station",
    generatedAt: "2025-10-15 06:05",
    dose: "2.1 mg/L",
    safety: 82,
    status: "Acknowledged"
  },
  {
    id: "rec-1022",
    site: "Village A Chlorination Kiosk",
    generatedAt: "2025-10-15 05:55",
    dose: "1.6 mg/L",
    safety: 74,
    status: "Pending review"
  },
  {
    id: "rec-1021",
    site: "Urban Treatment Plant",
    generatedAt: "2025-10-14 18:20",
    dose: "1.8 mg/L",
    safety: 90,
    status: "Closed"
  }
];

export const Records = () => {
  return (
    <div className="space-y-6">
      <header>
        <h3 className="text-lg font-semibold text-slate-100">Recommendation Records</h3>
        <p className="text-sm text-slate-400">
          Every generated recommendation is captured with citations, telemetry context, and operator actions for audit.
        </p>
      </header>

      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-100">Recent records</h4>
            <p className="text-xs text-slate-500">
              Filter by site, date, or status once the backend APIs are available.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <button className="rounded-md border border-slate-700 px-3 py-2 hover:border-brand-400 hover:text-brand-200">
              Export CSV
            </button>
            <button className="rounded-md border border-slate-700 px-3 py-2 hover:border-brand-400 hover:text-brand-200">
              View filters
            </button>
          </div>
        </div>
        <div className="mt-4 overflow-hidden rounded-lg border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead className="bg-slate-950/60 text-slate-400">
              <tr>
                <th className="px-4 py-2 text-left font-medium uppercase">Record ID</th>
                <th className="px-4 py-2 text-left font-medium uppercase">Site</th>
                <th className="px-4 py-2 text-left font-medium uppercase">Generated at</th>
                <th className="px-4 py-2 text-left font-medium uppercase">Dose</th>
                <th className="px-4 py-2 text-left font-medium uppercase">Safety</th>
                <th className="px-4 py-2 text-left font-medium uppercase">Status</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {records.map((record) => (
                <tr key={record.id}>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{record.id}</td>
                  <td className="px-4 py-3">{record.site}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{record.generatedAt}</td>
                  <td className="px-4 py-3">{record.dose}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-200">
                      {record.safety}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">{record.status}</td>
                  <td className="px-4 py-3">
                    <button className="text-xs font-semibold text-brand-200 hover:text-brand-100">
                      Open record
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <h4 className="text-sm font-semibold text-slate-100">Audit trail</h4>
        <div className="mt-4 space-y-3 text-sm text-slate-300">
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Hashing & versioning</p>
            <p className="mt-2 text-sm">
              Record store keeps a hash of every recommendation body, citation list, and telemetry snapshot for
              tamper detection.
            </p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Operator acknowledgements</p>
            <p className="mt-2 text-sm">
              Operators must confirm receipt or flag issues. Responses become part of the audit trail for reporting.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
