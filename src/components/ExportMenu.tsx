import React from 'react';
import { Download, FileText, FileSpreadsheet, FileJson } from 'lucide-react';
import toast from 'react-hot-toast';

interface ExportMenuProps {
  data: any;
  filename?: string;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({ data, filename = 'export' }) => {
  const exportAsJSON = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    downloadBlob(blob, `${filename}.json`);
    toast.success('Exported as JSON');
  };

  const exportAsCSV = () => {
    if (Array.isArray(data)) {
      const headers = Object.keys(data[0] || {});
      const csv = [
        headers.join(','),
        ...data.map(row => headers.map(h => row[h]).join(','))
      ].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      downloadBlob(blob, `${filename}.csv`);
      toast.success('Exported as CSV');
    } else {
      toast.error('Data must be an array for CSV export');
    }
  };

  const exportAsText = () => {
    const text = JSON.stringify(data, null, 2);
    const blob = new Blob([text], { type: 'text/plain' });
    downloadBlob(blob, `${filename}.txt`);
    toast.success('Exported as Text');
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-2 p-2">
      <button
        onClick={exportAsJSON}
        className="flex items-center gap-2 px-4 py-2 hover:bg-nature-100 rounded-xl transition-all text-left"
      >
        <FileJson size={18} className="text-blue-500" />
        <span className="text-sm font-medium">Export as JSON</span>
      </button>
      <button
        onClick={exportAsCSV}
        className="flex items-center gap-2 px-4 py-2 hover:bg-nature-100 rounded-xl transition-all text-left"
      >
        <FileSpreadsheet size={18} className="text-emerald-500" />
        <span className="text-sm font-medium">Export as CSV</span>
      </button>
      <button
        onClick={exportAsText}
        className="flex items-center gap-2 px-4 py-2 hover:bg-nature-100 rounded-xl transition-all text-left"
      >
        <FileText size={18} className="text-amber-500" />
        <span className="text-sm font-medium">Export as Text</span>
      </button>
    </div>
  );
};
