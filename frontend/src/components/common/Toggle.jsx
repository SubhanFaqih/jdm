import { useState } from "react";
import { motion } from "framer-motion";

export function Toggle({
  id,
  name,
  label,
  defaultChecked = true,
  className = "",
}) {
  const [isChecked, setIsChecked] = useState(defaultChecked);
  const [prevDefaultChecked, setPrevDefaultChecked] = useState(defaultChecked);

  // Menerapkan pola yang direkomendasikan React (menghindari useEffect untuk sync prop)
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (defaultChecked !== prevDefaultChecked) {
    setPrevDefaultChecked(defaultChecked);
    setIsChecked(defaultChecked);
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Hidden checkbox so it works with native HTML form submission (FormData) */}
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={isChecked}
        onChange={(e) => setIsChecked(e.target.checked)}
        className="hidden"
      />

      <button
        type="button"
        role="switch"
        aria-checked={isChecked}
        onClick={() => setIsChecked(!isChecked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 ${
          isChecked ? "bg-brand-primary" : "bg-slate-300 dark:bg-slate-700"
        }`}
      >
        <motion.span
          layout
          initial={false}
          animate={{
            x: isChecked ? 22 : 2,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
          className="inline-block h-5 w-5 rounded-full bg-white shadow-sm"
        />
      </button>

      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
          onClick={() => setIsChecked(!isChecked)}
        >
          {label}
        </label>
      )}
    </div>
  );
}
