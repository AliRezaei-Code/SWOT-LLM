import { useState } from "react";

import { StatCard } from "@/components/StatCard";

const sites = [
  { id: "district-5", name: "District 5 Booster Station" },
  { id: "village-a", name: "Village A Chlorination Kiosk" },
  { id: "urban-plant", name: "Urban Treatment Plant" }
];

const metrics = [
  {
    label: "Average residual",
    value: "1.8 mg/L",
    trend: "+0.2 vs target",
    footer: "Stay within 1.5–2.0 mg/L band."
  },
  {
    label: "Flow rate",
    value: "32 L/min",
    trend: "-12% vs last run",
    footer: "Check for partially closed valves."
  },
  {
    label: "Safety score",
    value: "78 / 100",
    trend: "Medium risk",
    footer: "Telemetry QC flag: turbidity spikes."
  }
];

const recentEvents = [
  {
    time: "07:15",
    event: "Residual dipped below 1.0 mg/L",
    action: "Flagged for operator review."
  },
  {
    time: "09:40",
    event: "Turbidity hit 6 NTU",
    action: "Suggested staged dose increase."
  },
  {
    time: "11:05",
    event: "Dose adjustment queued",
    action: "Awaiting confirmation."
  }
];

export const Telemetry = () => {
  const [selectedSite, setSelectedSite] = useState(sites[0].id);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">Telemetry Overview</h3>
          <p className="text-sm text-slate-400">
            Monitor residuals, flow, turbidity, and safety scoring for each installation.
          </p>
        </div>
        <label className="text-sm font-medium text-slate-300">
          Site
          <select
            className="ml-3 rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            value={selectedSite}
            onChange={(event) => setSelectedSite(event.target.value)}
          >
            {sites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
          </select>
        </label>
      </header>

      <section className="grid gap-4 lg:grid-cols-3">{metrics.map((metric) => <StatCard key={metric.label} {...metric} />)}</section>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h4 className="text-sm font-semibold text-slate-100">Latest readings</h4>
          <p className="text-xs text-slate-500">
            Data refreshed every 5 minutes. QC checks ensure sensor drift is accounted for.
          </p>
          <div className="mt-4 overflow-hidden rounded-lg border border-slate-800">
            <table className="min-w-full divide-y divide-slate-800 text-sm">
              <thead className="bg-slate-950/60 text-slate-400">
                <tr>
                  <th className="px-4 py-2 text-left font-medium uppercase">Timestamp</th>
                  <th className="px-4 py-2 text-left font-medium uppercase">Residual (mg/L)</th>
                  <th className="px-4 py-2 text-left font-medium uppercase">Turbidity (NTU)</th>
                  <th className="px-4 py-2 text-left font-medium uppercase">Flow (L/min)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                <tr>
                  <td className="px-4 py-2">11:55</td>
                  <td className="px-4 py-2">1.9</td>
                  <td className="px-4 py-2">3.4</td>
                  <td className="px-4 py-2">31.8</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">11:50</td>
                  <td className="px-4 py-2">1.7</td>
                  <td className="px-4 py-2">3.9</td>
                  <td className="px-4 py-2">32.1</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">11:45</td>
                  <td className="px-4 py-2">1.5</td>
                  <td className="px-4 py-2">4.2</td>
                  <td className="px-4 py-2">32.8</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <h4 className="text-sm font-semibold text-slate-100">Recent events</h4>
            <ul className="mt-3 space-y-3 text-sm text-slate-300">
              {recentEvents.map((item) => (
                <li key={item.time} className="rounded-md border border-slate-800 bg-slate-950/60 p-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{item.time}</span>
                    <span>{selectedSite}</span>
                  </div>
                  <p className="mt-2 font-medium text-slate-100">{item.event}</p>
                  <p className="mt-1 text-xs text-slate-400">{item.action}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <h4 className="text-sm font-semibold text-slate-100">Operational guidance</h4>
            <p className="mt-2 text-sm text-slate-300">
              RAG-powered assistant will tailor dosing adjustments, flush sequences, and follow-up tasks here.
            </p>
            <button
              type="button"
              className="mt-4 inline-flex items-center justify-center rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-400"
            >
              Open operator assistant
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
