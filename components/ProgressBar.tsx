interface Props {
  completed: number;
  total: number;
}

export function ProgressBar({ completed, total }: Props) {
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">進捗</span>
        <span className="text-xs font-bold text-indigo-600">{percentage}%</span>
      </div>
      <div className="h-1 bg-slate-100 w-full">
        <div
          className="h-full bg-indigo-600 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-[#6B6B6B] mt-1">{completed} / {total} 本完了</p>
    </div>
  );
}
