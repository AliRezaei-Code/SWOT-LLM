const templates = [
  {
    id: "grant-default",
    name: "Grant Template v1.0",
    owner: "Internal Programs",
    sections: ["Executive Summary", "Objectives", "Implementation", "Monitoring & Evaluation"],
    status: "Published"
  },
  {
    id: "feasibility-2024",
    name: "Feasibility Study",
    owner: "Technical Services",
    sections: ["Baseline Assessment", "Design Alternatives", "Costing", "Risk Register"],
    status: "Draft"
  },
  {
    id: "ops-quarterly",
    name: "Quarterly Operations Report",
    owner: "Field Ops",
    sections: ["Performance Metrics", "Incident Log", "Corrective Actions", "Next Quarter Plan"],
    status: "Published"
  }
];

export const Templates = () => {
  return (
    <div className="space-y-6">
      <header>
        <h3 className="text-lg font-semibold text-slate-100">Template Library</h3>
        <p className="text-sm text-slate-400">
          Manage the LaTeX structures that keep internal outputs consistent and audit ready.
        </p>
      </header>

      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-100">Available templates</h4>
            <p className="text-xs text-slate-500">
              Import more templates or sync from the knowledge base repository.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <button className="rounded-md border border-slate-700 px-3 py-2 hover:border-brand-400 hover:text-brand-200">
              New template
            </button>
            <button className="rounded-md border border-slate-700 px-3 py-2 hover:border-brand-400 hover:text-brand-200">
              Upload LaTeX
            </button>
          </div>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {templates.map((template) => (
            <div key={template.id} className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-100">{template.name}</p>
                <span
                  className={[
                    "rounded-full px-3 py-1 text-xs font-semibold",
                    template.status === "Published"
                      ? "bg-brand-500/10 text-brand-200"
                      : "bg-slate-800 text-slate-300"
                  ].join(" ")}
                >
                  {template.status}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-400">Maintainer: {template.owner}</p>
              <p className="mt-3 text-xs uppercase tracking-wide text-slate-500">Sections</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-300">
                {template.sections.map((section) => (
                  <li key={section}>• {section}</li>
                ))}
              </ul>
              <button className="mt-3 text-xs font-semibold text-brand-200 hover:text-brand-100">
                Open editor
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <h4 className="text-sm font-semibold text-slate-100">Template governance</h4>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300">
            Version control hooks ensure template updates trigger RAG revalidation before release.
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300">
            Required sections can be flagged so missing content blocks drafts from export.
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300">
            Template metadata links to SOP citations for automated referencing.
          </div>
        </div>
      </section>
    </div>
  );
};
