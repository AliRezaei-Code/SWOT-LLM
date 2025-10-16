type Step = {
  id: string;
  title: string;
  description: string;
};

export const Stepper = ({ steps, currentStep }: { steps: Step[]; currentStep: string }) => {
  return (
    <ol className="space-y-4">
      {steps.map((step) => {
        const active = step.id === currentStep;
        return (
          <li
            key={step.id}
            className={[
              "rounded-lg border p-4 transition",
              active
                ? "border-brand-400/70 bg-brand-500/10 shadow-lg shadow-brand-500/10"
                : "border-slate-800 bg-slate-900/60"
            ].join(" ")}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-100">{step.title}</p>
                <p className="mt-1 text-sm text-slate-400">{step.description}</p>
              </div>
              <span
                className={[
                  "mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                  active ? "bg-brand-500 text-white" : "bg-slate-800 text-slate-300"
                ].join(" ")}
              >
                {steps.indexOf(step) + 1}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
};
