export function Table({ columns, data, keyField = "id", renderActions }) {
  return (
    <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
            {columns.map((col, idx) => (
              <th
                key={idx}
                className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300"
              >
                {col.label}
              </th>
            ))}
            {renderActions && (
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300 text-right">
                Aksi
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (renderActions ? 1 : 0)}
                className="px-6 py-8 text-center text-slate-500 dark:text-slate-400"
              >
                Data belum tersedia.
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={row[keyField]}
                className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
              >
                {columns.map((col, idx) => (
                  <td
                    key={idx}
                    className="px-6 py-4 text-sm text-slate-700 dark:text-slate-200"
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
                {renderActions && (
                  <td className="px-6 py-4 text-right">{renderActions(row)}</td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
