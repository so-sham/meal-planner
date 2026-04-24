import React, { useState, useMemo } from 'react';
import { X, Save, Zap, Plus, Minus, Bookmark, Trash2, Pencil } from 'lucide-react';
import { SHAKE_BASES, SHAKE_PROTEINS, SHAKE_ADDINS, PRESET_SHAKES } from '../data/shakeData';

export default function ShakeBuilder({ onClose, onSave, onAddToPlan, onDeleteShake, onEditShake, hasPlan, savedShakes = [] }) {
  const [selectedBase, setSelectedBase] = useState('base-toned-milk');
  const [selectedProtein, setSelectedProtein] = useState('prot-on-whey');
  const [selectedAddins, setSelectedAddins] = useState(new Set());
  const [shakeName, setShakeName] = useState('');
  const [showPresets, setShowPresets] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const macros = useMemo(() => {
    const base = SHAKE_BASES.find(b => b.id === selectedBase) || { cal: 0, protein: 0, carbs: 0, fat: 0 };
    const prot = SHAKE_PROTEINS.find(p => p.id === selectedProtein) || { cal: 0, protein: 0, carbs: 0, fat: 0 };
    const addins = SHAKE_ADDINS.filter(a => selectedAddins.has(a.id));
    return [base, prot, ...addins].reduce((acc, item) => ({
      cal: acc.cal + item.cal,
      protein: acc.protein + item.protein,
      carbs: acc.carbs + item.carbs,
      fat: acc.fat + item.fat,
    }), { cal: 0, protein: 0, carbs: 0, fat: 0 });
  }, [selectedBase, selectedProtein, selectedAddins]);

  const applyPreset = (preset) => {
    setSelectedBase(preset.base);
    setSelectedProtein(preset.protein);
    setSelectedAddins(new Set(preset.addins));
    setShakeName(preset.name);
    setEditingId(null);
  };

  const loadSavedShake = (shake) => {
    setSelectedBase(shake.base);
    setSelectedProtein(shake.protein);
    setSelectedAddins(new Set(shake.addins || []));
    setShakeName(shake.name);
    setEditingId(shake.id);
  };

  const toggleAddin = (id) => {
    setSelectedAddins(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSave = () => {
    if (!onSave) return;
    const shakeData = {
      name: shakeName || 'My Shake',
      base: selectedBase,
      protein: selectedProtein,
      addins: [...selectedAddins],
      macros,
    };
    if (editingId) {
      onEditShake?.({ ...shakeData, id: editingId });
      setEditingId(null);
    } else {
      onSave(shakeData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-cream-50 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between p-4 border-b border-cream-200">
          <h2 className="font-bold text-bark-700 text-lg flex items-center gap-2">
            🥤 Shake Builder
            {editingId && <span className="text-xs font-normal text-terra-500 bg-terra-50 px-2 py-0.5 rounded-full">Editing</span>}
          </h2>
          <button onClick={onClose} className="p-1.5 text-bark-400 hover:text-bark-600 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="sticky top-0 z-10 bg-bark-700 px-4 py-2.5 flex items-center justify-around">
          {[
            ['Cal', macros.cal, 'bg-terra-500'],
            ['Protein', macros.protein, 'bg-sage-500'],
            ['Carbs', macros.carbs, 'bg-protein-500'],
            ['Fat', macros.fat, 'bg-cream-300 text-bark-700'],
          ].map(([label, val, cls]) => (
            <div key={label} className="text-center">
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${cls} ${cls.includes('text-') ? '' : 'text-white'}`}>
                {Math.round(val)}{label !== 'Cal' ? 'g' : ''}
              </span>
              <div className="text-[9px] text-bark-300 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">

          {/* Saved Shakes */}
          {savedShakes.length > 0 && (
            <section>
              <h3 className="text-xs font-bold text-bark-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                🥤 Your Saved Shakes
              </h3>
              <div className="space-y-2">
                {savedShakes.map(s => (
                  <div key={s.id} className={`flex items-center gap-3 bg-white border rounded-xl p-3 transition-all ${editingId === s.id ? 'border-terra-400 bg-terra-50' : 'border-cream-200'}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-bark-700 truncate">{s.name}</p>
                      <p className="text-[10px] text-bark-400">
                        {s.macros?.cal || 0} cal · {s.macros?.protein || 0}g protein
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => loadSavedShake(s)}
                        className="p-1.5 text-bark-400 hover:text-protein-600 rounded-lg hover:bg-protein-50 transition-colors"
                        title="Edit shake">
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => onDeleteShake?.(s.id)}
                        className="p-1.5 text-bark-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete shake">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Presets */}
          <section>
            <button onClick={() => setShowPresets(!showPresets)}
              className="flex items-center justify-between w-full mb-2">
              <h3 className="text-xs font-bold text-bark-600 uppercase tracking-wider flex items-center gap-1.5">
                <Bookmark size={12} />
                Presets
              </h3>
              <span className="text-bark-400 text-xs">{showPresets ? '▾' : '▸'}</span>
            </button>
            {showPresets && (
              <div className="grid grid-cols-2 gap-2">
                {PRESET_SHAKES.map(p => {
                  const presetMacros = calcPresetMacros(p);
                  return (
                    <button key={p.id} onClick={() => applyPreset(p)}
                      className="text-left bg-white border border-cream-200 rounded-xl p-3 hover:border-sage-300 hover:shadow-sm transition-all">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-lg">{p.emoji}</span>
                        <span className="text-xs font-bold text-bark-700 truncate">{p.name}</span>
                      </div>
                      <div className="flex gap-2 text-[10px] text-bark-500">
                        <span className="text-terra-500 font-semibold">{presetMacros.cal} cal</span>
                        <span className="text-sage-600 font-semibold">{presetMacros.protein}g prot</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Base */}
          <section>
            <h3 className="text-xs font-bold text-bark-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Zap size={12} />
              Base
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
              {SHAKE_BASES.map(b => (
                <button key={b.id} onClick={() => setSelectedBase(b.id)}
                  className={`flex-shrink-0 w-28 rounded-xl p-3 border-2 transition-all ${
                    selectedBase === b.id
                      ? 'border-sage-500 bg-sage-50 shadow-sm'
                      : 'border-cream-200 bg-white hover:border-cream-300'
                  }`}>
                  <div className="text-xs font-bold text-bark-700 truncate">{b.name}</div>
                  <div className="text-[10px] text-bark-400 mt-1">{b.serving}</div>
                  <div className="flex gap-1 mt-1.5">
                    <span className="text-[9px] text-terra-500 font-semibold">{b.cal}cal</span>
                    <span className="text-[9px] text-sage-600 font-semibold">{b.protein}g</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Protein Source */}
          <section>
            <h3 className="text-xs font-bold text-bark-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Zap size={12} />
              Protein Source
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
              {SHAKE_PROTEINS.map(p => (
                <button key={p.id} onClick={() => setSelectedProtein(p.id)}
                  className={`flex-shrink-0 w-32 rounded-xl p-3 border-2 transition-all ${
                    selectedProtein === p.id
                      ? 'border-sage-500 bg-sage-50 shadow-sm'
                      : 'border-cream-200 bg-white hover:border-cream-300'
                  }`}>
                  <div className="text-xs font-bold text-bark-700 truncate">{p.name}</div>
                  <div className="text-[10px] text-bark-400 mt-0.5">{p.brand}</div>
                  <div className="text-[10px] text-sage-600 font-semibold mt-1">{p.protein}g / scoop</div>
                </button>
              ))}
            </div>
          </section>

          {/* Add-ins */}
          <section>
            <h3 className="text-xs font-bold text-bark-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Plus size={12} />
              Add-ins
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {SHAKE_ADDINS.map(a => {
                const active = selectedAddins.has(a.id);
                return (
                  <button key={a.id} onClick={() => toggleAddin(a.id)}
                    className={`text-left rounded-xl p-3 border-2 transition-all ${
                      active
                        ? 'border-sage-500 bg-sage-50 shadow-sm'
                        : 'border-cream-200 bg-white hover:border-cream-300'
                    }`}>
                    <div className="flex items-center gap-2">
                      <span className="text-base">{a.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-bark-700 truncate">{a.name}</div>
                        <div className="flex gap-1.5 mt-0.5">
                          <span className="text-[9px] text-sage-600 font-semibold">+{a.protein}g</span>
                          <span className="text-[9px] text-terra-500">+{a.cal}cal</span>
                        </div>
                      </div>
                      {active ? (
                        <Minus size={14} className="text-sage-600 flex-shrink-0" />
                      ) : (
                        <Plus size={14} className="text-bark-300 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* Save bar */}
        <div className="border-t border-cream-200 p-4 space-y-2">
          <div className="flex gap-2">
            <input value={shakeName} onChange={e => setShakeName(e.target.value)}
              placeholder="Name your shake..."
              className="flex-1 px-3 py-2 text-sm border border-cream-200 rounded-lg bg-white focus:outline-none focus:border-sage-400 transition-colors" />
            <button onClick={handleSave}
              className={`px-4 py-2 rounded-lg text-white text-sm font-bold flex items-center gap-2 transition-colors ${
                editingId ? 'bg-terra-500 hover:bg-terra-600' : 'bg-bark-600 hover:bg-bark-700'
              }`}>
              {editingId ? <><Pencil size={14} /> Update</> : <><Save size={14} /> Save</>}
            </button>
          </div>
          {hasPlan && (
            <button
              onClick={() => onAddToPlan?.({
                name: shakeName || 'Protein Shake',
                base: selectedBase,
                protein: selectedProtein,
                addins: [...selectedAddins],
                macros,
              })}
              className="w-full py-2.5 rounded-lg bg-sage-500 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-sage-600 transition-colors active:scale-[0.98]">
              <Plus size={14} />
              Add Shake to Meal Plan (+{Math.round(macros.protein)}g protein)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function calcPresetMacros(preset) {
  const base = SHAKE_BASES.find(b => b.id === preset.base) || { cal: 0, protein: 0, carbs: 0, fat: 0 };
  const prot = SHAKE_PROTEINS.find(p => p.id === preset.protein) || { cal: 0, protein: 0, carbs: 0, fat: 0 };
  const addins = SHAKE_ADDINS.filter(a => preset.addins.includes(a.id));
  return [base, prot, ...addins].reduce((acc, item) => ({
    cal: acc.cal + item.cal,
    protein: acc.protein + item.protein,
    carbs: acc.carbs + item.carbs,
    fat: acc.fat + item.fat,
  }), { cal: 0, protein: 0, carbs: 0, fat: 0 });
}
