/**
 * A reusable clean container with white background and soft shadow.
 */
export function CleanCard({ children, className = '', ...props }) {
  return (
    <div className={`bg-brand-bg-secondary rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-brand-border ${className}`} {...props}>
      {children}
    </div>
  );
}
