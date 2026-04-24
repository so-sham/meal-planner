import React, { useState, useRef } from 'react';
import usePlanStore from '../store/usePlanStore';
import FilterPanel from './FilterPanel';
import { Settings, Database, Download, Upload, Trash2 } from 'lucide-react';

export default function SettingsView() {
  const store = usePlanStore();
  const {
    userPreferences,
    setPreferences,
    doGenerateDayPlan,
    setActiveView,
    isGenerating,
    savedPlans,
    customFoods,
    savedShakes,
    favorites,
  } = store;

  const fileInputRef = useRef(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [importStatus, setImportStatus] = useState(null);

  const handleExport = () => {
    const state = usePlanStore.getState();
    const { isGenerating: _, activeModal: __, ...exportable } = state;
    const blob = new Blob([JSON.stringify(exportable, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nourishplan-backup.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        const state = usePlanStore.getState();
        if (data.userPreferences) state.setPreferences(data.userPreferences);
        if (data.favorites) usePlanStore.setState({ favorites: data.favorites });
        if (data.customFoods) usePlanStore.setState({ customFoods: data.customFoods });
        if (data.savedShakes) usePlanStore.setState({ savedShakes: data.savedShakes });
        if (data.savedPlans) usePlanStore.setState({ savedPlans: data.savedPlans });
        if (data.tracking) usePlanStore.setState({ tracking: data.tracking });
        setImportStatus('success');
        setTimeout(() => setImportStatus(null), 3000);
      } catch {
        setImportStatus('error');
        setTimeout(() => setImportStatus(null), 3000);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClearAll = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleGenerate = () => {
    doGenerateDayPlan();
    setActiveView('plan');
  };

  return (
    <div className="space-y-6">
      {/* Goals & Preferences */}
      <section className="bg-white rounded-2xl shadow-sm border border-cream-200 overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-cream-200 bg-cream-50">
          <Settings size={18} className="text-sage-500" />
          <h2 className="text-base font-bold text-bark-700">Goals & Preferences</h2>
        </div>
        <div className="px-5 py-4">
          <FilterPanel
            prefs={userPreferences}
            setPrefs={(p) => setPreferences(typeof p === 'function' ? p(userPreferences) : p)}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
        </div>
      </section>

      {/* Data Management */}
      <section className="bg-white rounded-2xl shadow-sm border border-cream-200 overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-cream-200 bg-cream-50">
          <Database size={18} className="text-terra-500" />
          <h2 className="text-base font-bold text-bark-700">Data Management</h2>
        </div>
        <div className="px-5 py-4 space-y-3">
          {/* Export */}
          <button
            onClick={handleExport}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-cream-200 bg-cream-50 hover:bg-sage-50 hover:border-sage-200 transition-colors text-left"
          >
            <div className="p-2 bg-sage-100 rounded-lg">
              <Download size={16} className="text-sage-600" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold text-bark-700 block">Export All Data</span>
              <span className="text-[11px] text-bark-400">Download your plans, preferences & tracking as JSON</span>
            </div>
          </button>

          {/* Import */}
          <label className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-cream-200 bg-cream-50 hover:bg-protein-50 hover:border-protein-200 transition-colors cursor-pointer">
            <div className="p-2 bg-protein-100 rounded-lg">
              <Upload size={16} className="text-protein-600" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold text-bark-700 block">Import Data</span>
              <span className="text-[11px] text-bark-400">Restore from a nourishplan-backup.json file</span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
          {importStatus === 'success' && (
            <p className="text-xs text-sage-600 font-medium px-1">Data imported successfully.</p>
          )}
          {importStatus === 'error' && (
            <p className="text-xs text-red-500 font-medium px-1">Import failed — invalid JSON file.</p>
          )}

          {/* Clear All */}
          {!confirmClear ? (
            <button
              onClick={() => setConfirmClear(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-cream-200 bg-cream-50 hover:bg-red-50 hover:border-red-200 transition-colors text-left"
            >
              <div className="p-2 bg-red-100 rounded-lg">
                <Trash2 size={16} className="text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-bark-700 block">Clear All Data</span>
                <span className="text-[11px] text-bark-400">Remove everything and start fresh</span>
              </div>
            </button>
          ) : (
            <div className="rounded-xl border border-red-300 bg-red-50 p-4 space-y-3">
              <p className="text-sm font-semibold text-red-700">
                Are you sure? This will permanently delete all your data.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleClearAll}
                  className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors"
                >
                  Yes, Clear Everything
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="flex-1 py-2 rounded-lg bg-white text-bark-600 text-sm font-medium border border-cream-300 hover:bg-cream-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white rounded-2xl shadow-sm border border-cream-200 overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-cream-200 bg-cream-50">
          <Database size={18} className="text-protein-500" />
          <h2 className="text-base font-bold text-bark-700">Your Stats</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 px-5 py-4">
          <StatCard label="Saved Plans" value={savedPlans.length} color="sage" />
          <StatCard label="Favorites" value={favorites.length} color="terra" />
          <StatCard label="Custom Foods" value={customFoods.length} color="protein" />
          <StatCard label="Saved Shakes" value={savedShakes.length} color="bark" />
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, color }) {
  const colorMap = {
    sage: 'bg-sage-50 text-sage-700 border-sage-200',
    terra: 'bg-terra-50 text-terra-700 border-terra-200',
    protein: 'bg-protein-50 text-protein-700 border-protein-200',
    bark: 'bg-cream-100 text-bark-700 border-cream-300',
  };
  return (
    <div className={`rounded-xl border p-4 text-center ${colorMap[color] || colorMap.sage}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-[11px] font-medium opacity-70 mt-0.5">{label}</div>
    </div>
  );
}
