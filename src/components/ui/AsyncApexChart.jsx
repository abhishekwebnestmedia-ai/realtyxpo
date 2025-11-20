import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

// Lazy-load react-apexcharts to avoid hard dependency until runtime
export default function AsyncApexChart(props) {
  const { series, options, type = 'line', height = 200 } = props;
  const [ApexChart, setApexChart] = useState(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let mounted = true;
    import('react-apexcharts')
      .then((mod) => {
        if (!mounted) return;
        const Comp = mod && mod.default ? mod.default : mod;
        setApexChart(() => Comp);
      })
      .catch((err) => {
        // If the package is missing, we set a flag and fall back to a tiny static fallback
        console.warn('react-apexcharts failed to load', err);
        setLoadError(true);
      });
    return () => { mounted = false; };
  }, []);

  if (loadError) {
    return (
      <div className="rounded-lg border border-gray-100 p-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>Charts are unavailable (install react-apexcharts)</span>
        </div>
        <div className="mt-2 text-xs">Install with: <code>npm i react-apexcharts apexcharts</code></div>
      </div>
    );
  }

  if (!ApexChart) {
    return (
      <div className="rounded-lg border border-gray-100 p-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Loading chart...
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-100 p-2">
      <ApexChart options={options} series={series} type={type} height={height} />
    </div>
  );
}
