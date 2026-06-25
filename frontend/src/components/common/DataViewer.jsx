
const formatRupiah = (angka) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(angka || 0);
};

const formatValue = (value, key = '') => {
  if (value === null || value === undefined) {
    return <span className="text-slate-400 italic">null</span>;
  }
  if (typeof value === 'boolean') {
    return value ? (
      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">Ya</span>
    ) : (
      <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs">Tidak</span>
    );
  }
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return `[ ${value.length} item ]`;
    }
    // Check if it's a date object
    if (value instanceof Date) {
      return value.toLocaleString('id-ID');
    }
    return JSON.stringify(value);
  }
  
  // Basic ISO date string check
  if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
      return d.toLocaleString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
  
  // Format numbers that look like nominal/currency
  const currencyKeys = ['nominal', 'amount', 'saldo', 'pemasukan', 'pengeluaran', 'target_dana', 'dana_terkumpul', 'biaya', 'total', 'harga', 'kas', 'infaq', 'shadaqah', 'zakat', 'wakaf'];
  const isIdField = key && key.toLowerCase().endsWith('id');
  const isCurrency = !isIdField && key && currencyKeys.some(k => key.toLowerCase().includes(k));

  if (typeof value === 'number') {
    if (isIdField) {
      return String(value);
    }
    if (isCurrency) {
      let val = value;
      // Kas nominal is stored in cents, so we divide by 100
      if (key === 'nominal') {
        val = value / 100;
      }
      return formatRupiah(val);
    }
    return new Intl.NumberFormat('id-ID').format(value);
  }

  // Handle numeric strings that match currency keys
  if (typeof value === 'string' && isCurrency && !isNaN(Number(value))) {
    let val = Number(value);
    if (key === 'nominal') {
      val = val / 100;
    }
    return formatRupiah(val);
  }
  
  return String(value);
};

const formatKey = (key) => {
  // Convert camelCase to Title Case (e.g., createdAt -> Created At)
  const result = key.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
};

export function DataViewer({ data, className = '' }) {
  if (!data || typeof data !== 'object') {
    return <div className="text-sm text-slate-500 italic">Tidak ada data</div>;
  }

  // Filter out noisy internal Mongoose fields
  const entries = Object.entries(data).filter(([key]) => key !== '__v');

  if (entries.length === 0) {
    return <div className="text-sm text-slate-500 italic">Data kosong</div>;
  }

  return (
    <div className={`flex flex-col space-y-0 ${className}`}>
      {entries.map(([key, value]) => (
        <div 
          key={key} 
          className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-slate-200/50 dark:border-slate-700/50 last:border-0 gap-1 sm:gap-4"
        >
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 w-1/3 shrink-0">
            {formatKey(key)}
          </span>
          <span className="text-sm font-medium text-slate-800 dark:text-slate-200 text-left sm:text-right break-all">
            {formatValue(value, key)}
          </span>
        </div>
      ))}
    </div>
  );
}
