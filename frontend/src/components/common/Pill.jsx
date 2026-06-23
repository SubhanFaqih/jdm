
/**
 * A reusable white pill label often overlapping top edges.
 */
export function Pill({ text, className = '' }) {
  return (
    <div className={`bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-sm px-6 py-1 rounded-full whitespace-nowrap ${className}`}>
      {text}
    </div>
  );
}
