type StatCardProps = {
  label: string;
  value: string;
  trend?: string;
  footer?: string;
};

export const StatCard = ({ label, value, trend, footer }: StatCardProps) => {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-slate-50">{value}</p>
      {trend ? <p className="mt-1 text-xs text-brand-200">{trend}</p> : null}
      {footer ? <p className="mt-4 text-sm text-slate-500">{footer}</p> : null}
    </div>
  );
};
