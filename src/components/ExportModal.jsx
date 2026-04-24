import React, { useState, useRef, useEffect, useCallback } from 'react';
import usePlanStore from '../store/usePlanStore';
import { exportAsText, exportAsCSV, exportAsJSON, downloadFile } from '../utils/export';
import { X, FileText, Table, Image, Copy, FileJson, Check } from 'lucide-react';

const EXPORT_OPTIONS = [
  { id: 'pdf', icon: FileText, title: 'PDF Export', desc: 'Formatted meal plan document', color: 'terra' },
  { id: 'csv', icon: Table, title: 'Spreadsheet', desc: 'CSV for Excel / Google Sheets', color: 'sage' },
  { id: 'image', icon: Image, title: 'Share Image', desc: 'Screenshot of your plan', color: 'protein' },
  { id: 'text', icon: Copy, title: 'Copy as Text', desc: 'Paste anywhere', color: 'bark' },
  { id: 'json', icon: FileJson, title: 'JSON Export', desc: 'Raw data for developers', color: 'sage' },
];

const COLOR_CLASSES = {
  terra: 'bg-terra-50 border-terra-200 text-terra-600 hover:bg-terra-100',
  sage: 'bg-sage-50 border-sage-200 text-sage-600 hover:bg-sage-100',
  protein: 'bg-protein-50 border-protein-200 text-protein-600 hover:bg-protein-100',
  bark: 'bg-cream-50 border-cream-200 text-bark-600 hover:bg-cream-100',
};

const BTN_CLASSES = {
  terra: 'bg-terra-500 hover:bg-terra-600',
  sage: 'bg-sage-500 hover:bg-sage-600',
  protein: 'bg-protein-500 hover:bg-protein-600',
  bark: 'bg-bark-500 hover:bg-bark-600',
};

export default function ExportModal({ onClose }) {
  const activePlan = usePlanStore((s) => s.activePlan);
  const planViewMode = usePlanStore((s) => s.planViewMode);
  const userPreferences = usePlanStore((s) => s.userPreferences);

  const [loadingId, setLoadingId] = useState(null);
  const [successId, setSuccessId] = useState(null);
  const [pdfError, setPdfError] = useState(false);
  const [imageError, setImageError] = useState(false);
  const overlayRef = useRef(null);

  const isWeekly = planViewMode === 'week';
  const planData = isWeekly ? activePlan.weekly : activePlan.daily;

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleOverlayClick = useCallback((e) => {
    if (e.target === overlayRef.current) onClose();
  }, [onClose]);

  function showSuccess(id) {
    setSuccessId(id);
    setLoadingId(null);
    setTimeout(() => setSuccessId(null), 1500);
  }

  async function handleExport(id) {
    if (!planData) return;
    setLoadingId(id);
    setPdfError(false);
    setImageError(false);

    try {
      switch (id) {
        case 'pdf': {
          try {
            const [{ default: PlanPDF }, { pdf }] = await Promise.all([
              import('./PlanPDF'),
              import('@react-pdf/renderer'),
            ]);
            const doc = <PlanPDF planData={planData} prefs={userPreferences} isWeekly={isWeekly} />;
            const blob = await pdf(doc).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `meal-plan-${new Date().toISOString().slice(0, 10)}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            showSuccess(id);
          } catch {
            setPdfError(true);
            setLoadingId(null);
          }
          break;
        }

        case 'csv': {
          const csv = exportAsCSV(planData, userPreferences, isWeekly);
          downloadFile(csv, `meal-plan-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
          showSuccess(id);
          break;
        }

        case 'image': {
          try {
            const html2canvas = (await import('html2canvas')).default;
            const el = document.querySelector('[data-plan-ref]');
            if (!el) throw new Error('Plan element not found');
            const canvas = await html2canvas(el, {
              backgroundColor: '#FFF8E7',
              scale: 2,
              useCORS: true,
            });
            canvas.toBlob((blob) => {
              if (!blob) return;
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `meal-plan-${new Date().toISOString().slice(0, 10)}.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
              showSuccess('image');
            }, 'image/png');
          } catch (err) {
            console.warn('Image export failed', err);
            setImageError(true);
            setLoadingId(null);
          }
          break;
        }

        case 'text': {
          const text = exportAsText(planData, userPreferences, isWeekly);
          await navigator.clipboard.writeText(text);
          showSuccess(id);
          break;
        }

        case 'json': {
          const json = exportAsJSON(planData, userPreferences);
          downloadFile(json, `meal-plan-${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
          showSuccess(id);
          break;
        }
      }
    } catch {
      setLoadingId(null);
    }
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in"
    >
      <div className="bg-cream-50 rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cream-200">
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-terra-500" />
            <h2 className="font-bold text-bark-700 text-lg">Export Plan</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-bark-400 hover:text-bark-600 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-xs text-bark-400 mb-4">
            Export your {isWeekly ? 'weekly' : 'daily'} meal plan in your preferred format.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {EXPORT_OPTIONS.map(({ id, icon: Icon, title, desc, color }) => {
              const isLoading = loadingId === id;
              const isSuccess = successId === id;
              const showPdfNote = id === 'pdf' && pdfError;
              const showImageNote = id === 'image' && imageError;

              return (
                <div
                  key={id}
                  className={`relative rounded-xl border p-4 transition-all ${COLOR_CLASSES[color]} ${
                    id === 'pdf' ? 'sm:col-span-2' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-white/60 flex-shrink-0">
                      <Icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold">{title}</h3>
                      <p className="text-[11px] opacity-70 mt-0.5">{desc}</p>
                      {showPdfNote && (
                        <p className="text-[10px] text-terra-500 mt-1 font-medium">
                          PDF couldn&apos;t be generated. Try again or use Copy as Text.
                        </p>
                      )}
                      {showImageNote && (
                        <p className="text-[10px] text-red-600 mt-1 font-medium" role="alert">
                          Couldn&apos;t capture the plan. Open the Plan tab and try again, or use another export.
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleExport(id)}
                    disabled={isLoading || !planData}
                    className={`mt-3 w-full py-2 text-xs font-bold text-white rounded-lg transition-all
                      active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
                      ${isSuccess ? 'bg-emerald-500 hover:bg-emerald-500' : BTN_CLASSES[color]}`}
                  >
                    {isSuccess ? (
                      <span className="flex items-center justify-center gap-1.5">
                        <Check size={14} />
                        {id === 'text' ? 'Copied!' : 'Downloaded!'}
                      </span>
                    ) : isLoading ? (
                      <span className="flex items-center justify-center gap-1.5">
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {id === 'pdf' ? 'Generating PDF…' : 'Exporting…'}
                      </span>
                    ) : (
                      id === 'text' ? 'Copy to Clipboard' : `Export ${title}`
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
