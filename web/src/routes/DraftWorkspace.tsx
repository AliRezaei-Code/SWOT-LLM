import { useMemo, useState } from "react";

import { Stepper } from "@/components/Stepper";

const steps = [
  {
    id: "template",
    title: "Template selection",
    description: "Choose the LaTeX shell and required sections."
  },
  {
    id: "project",
    title: "Project metadata",
    description: "Capture scope, partners, and funding context."
  },
  {
    id: "prompt",
    title: "Prompt design",
    description: "Write targeted questions to steer retrieval."
  },
  {
    id: "review",
    title: "Preview & export",
    description: "Validate citations then export LaTeX bundle."
  }
];

const templateOptions = [
  {
    id: "grant-default",
    name: "Grant Template v1.0",
    summary: "Executive summary, objectives, implementation, and M&E."
  },
  {
    id: "feasibility-2024",
    name: "Feasibility Study",
    summary: "Situation analysis, technical design, costing, sustainability."
  },
  {
    id: "report-quarterly",
    name: "Quarterly Operations Report",
    summary: "Performance metrics, incident log, corrective actions."
  }
];

export const DraftWorkspace = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [project, setProject] = useState({
    title: "",
    region: "",
    partners: ""
  });

  const currentStep = useMemo(() => {
    if (!selectedTemplate) return "template";
    if (!project.title || !project.region) return "project";
    if (!query.trim()) return "prompt";
    return "review";
  }, [selectedTemplate, project, query]);

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
          <h3 className="text-lg font-semibold text-slate-100">Workflow Steps</h3>
          <p className="text-sm text-slate-400">
            Follow the guided sequence to keep drafts compliant with internal standards.
          </p>
          <div className="mt-6">
            <Stepper steps={steps} currentStep={currentStep} />
          </div>
          <button
            type="button"
            className="mt-6 inline-flex items-center justify-center rounded-md border border-slate-700 px-3 py-2 text-sm font-medium text-slate-300 hover:border-brand-400 hover:text-brand-200"
          >
            View template library
          </button>
        </div>
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <h3 className="text-lg font-semibold text-slate-100">Template Selection</h3>
            <p className="text-sm text-slate-400">Choose the structure that matches your deliverable.</p>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              {templateOptions.map((option) => {
                const active = option.id === selectedTemplate;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectedTemplate(option.id)}
                    className={[
                      "rounded-lg border p-4 text-left transition",
                      active
                        ? "border-brand-400 bg-brand-500/10 text-brand-100"
                        : "border-slate-800 bg-slate-950/60 text-slate-200 hover:border-brand-500/40"
                    ].join(" ")}
                  >
                    <p className="text-sm font-semibold">{option.name}</p>
                    <p className="mt-2 text-xs text-slate-400">{option.summary}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <h3 className="text-lg font-semibold text-slate-100">Project Metadata</h3>
            <p className="text-sm text-slate-400">
              These fields describe the context sent to the RAG pipeline and populate LaTeX front matter.
            </p>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <label className="text-sm font-medium text-slate-300">
                Project title
                <input
                  className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950/70 p-3 text-sm text-slate-100 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                  value={project.title}
                  onChange={(event) => setProject((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="Chlorination Expansion Programme"
                />
              </label>
              <label className="text-sm font-medium text-slate-300">
                Region or district
                <input
                  className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950/70 p-3 text-sm text-slate-100 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                  value={project.region}
                  onChange={(event) => setProject((prev) => ({ ...prev, region: event.target.value }))}
                  placeholder="Northern Province"
                />
              </label>
              <label className="text-sm font-medium text-slate-300">
                Partners
                <input
                  className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950/70 p-3 text-sm text-slate-100 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                  value={project.partners}
                  onChange={(event) => setProject((prev) => ({ ...prev, partners: event.target.value }))}
                  placeholder="Water Utility, UNICEF, MoH"
                />
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <h3 className="text-lg font-semibold text-slate-100">Prompt Design</h3>
            <p className="text-sm text-slate-400">
              Combine objectives and telemetry context into focused prompts. The assistant retrieves and cites
              relevant references automatically.
            </p>
            <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_280px]">
              <textarea
                className="h-48 w-full rounded-md border border-slate-700 bg-slate-950/70 p-3 text-sm text-slate-100 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Focus on chlorine dosing guidance for community systems with high turbidity events..."
              />
              <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Prompt helpers</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-300">
                  <li>• Reference SOP IDs or document titles for targeted retrieval.</li>
                  <li>• Include telemetry anomalies to trigger safety scoring checks.</li>
                  <li>• Highlight reporting requirements for LaTeX tables or annexes.</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-400"
                disabled
              >
                Queue Draft (RAG Pending)
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:border-brand-400 hover:text-brand-200"
              >
                Save configuration
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
            <h3 className="text-lg font-semibold text-slate-100">Preview & Validation</h3>
            <p className="text-sm text-slate-400">
              When the RAG pipeline is connected, citation highlights and LaTeX preview will render below.
            </p>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-lg border border-dashed border-slate-700 p-4 text-sm text-slate-500">
                Retrieval summary and citation mapping placeholder.
              </div>
              <div className="rounded-lg border border-dashed border-slate-700 p-4 text-sm text-slate-500">
                LaTeX preview placeholder.
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-xs font-medium uppercase tracking-wide text-brand-200">
                Validation status: awaiting first draft
              </span>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-brand-400 hover:text-brand-200"
              >
                Download latest LaTeX
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
