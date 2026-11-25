export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="bg-[#151C2C] border border-slate-800/90 rounded-xl p-10 text-center flex flex-col items-center justify-center">
      {Icon && (
        <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <h3 className="text-base font-semibold text-white">{title}</h3>
      {description && (
        <p className="text-sm text-slate-400 mt-1.5 max-w-md">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
