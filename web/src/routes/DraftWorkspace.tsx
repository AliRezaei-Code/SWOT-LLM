import { useState } from "react";

export const DraftWorkspace = () => {
  const [query, setQuery] = useState("");

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h3 className="text-lg font-semibold text-slate-100">Draft Parameters</h3>
          <p className="text-sm text-slate-400">
            Describe the grant focus or operational question to ground retrieval.
          </p>
          <label className="mt-4 block text-sm font-medium text-slate-300">
            Draft prompt
            <textarea
              className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-100 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              rows={6}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="e.g., Outline chlorination expansion plan for District 5 facilities."
            />
          </label>
          <button
            type="button"
            className="mt-4 inline-flex items-center justify-center rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-400"
            disabled
          >
            Queue Draft (API Pending)
          </button>
          <p className="mt-2 text-xs text-slate-500">
            Backend endpoint will submit this prompt to the RAG pipeline and return a draft preview.
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
          <h3 className="text-lg font-semibold text-slate-100">Preview</h3>
          <p className="text-sm text-slate-400">
            Once connected, this panel will show retrieval highlights, draft sections, and LaTeX output.
          </p>
          <div className="mt-4 grid gap-4">
            <div className="rounded-lg border border-dashed border-slate-700 p-4 text-sm text-slate-500">
              Retrieval results and citation context will appear here.
            </div>
            <div className="rounded-lg border border-dashed border-slate-700 p-4 text-sm text-slate-500">
              Draft outline and LaTeX preview will render in this panel.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
