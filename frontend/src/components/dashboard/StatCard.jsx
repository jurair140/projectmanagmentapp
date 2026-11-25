export default function StatCard({ label, value, icon: Icon, accentClass = 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20', subtext }) {
  return (
    <div className="bg-[#151C2C] border border-slate-800/90 rounded-xl p-5 hover:border-slate-700/80 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
          <p className="text-2xl font-bold text-white mt-2 tabular-nums">{value}</p>
          {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-lg border shrink-0 ${accentClass}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}
