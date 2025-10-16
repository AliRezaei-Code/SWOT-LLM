export const Dashboard = () => {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold text-slate-100">Workspace Overview</h3>
        <p className="text-sm text-slate-400">
          Integrate telemetry, review corpus readiness, and track draft activity from this hub.
        </p>
      </section>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h4 className="text-sm font-semibold text-slate-200">Corpus Status</h4>
          <p className="mt-2 text-sm text-slate-400">Document ingestion pipeline not connected yet.</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h4 className="text-sm font-semibold text-slate-200">Telemetry</h4>
          <p className="mt-2 text-sm text-slate-400">Live telemetry dashboards coming in Phase 2.</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h4 className="text-sm font-semibold text-slate-200">Draft Activity</h4>
          <p className="mt-2 text-sm text-slate-400">Queue and review generated drafts once RAG is wired up.</p>
        </div>
      </div>
    </div>
  );
};
