import React, { useState, useRef } from 'react';
import { Camera, X, Edit3, Save, Plus, AlertCircle, Loader2 } from 'lucide-react';
import { loadApiKey, saveApiKey } from '../utils/storage';
import { CUISINES } from '../data/meals';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

export default function PhotoScanner({ onClose, onSaveFood }) {
  const [apiKey, setApiKey] = useState(loadApiKey);
  const [img, setImg] = useState(null);
  const [preview, setPreview] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [tab, setTab] = useState('scan');
  const fileRef = useRef(null);

  const [manual, setManual] = useState({
    name: '', cuisine: CUISINES[0]?.id || '', mealTypes: new Set(),
    cal: '', protein: '', carbs: '', fat: '',
    serving: '', unit: 'g', isVeg: true, hasEgg: false,
  });

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImg(file);
    setResult(null);
    setError('');
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const analyze = async () => {
    if (!apiKey) { setError('Please enter your Claude API key'); return; }
    if (!preview) { setError('Please upload a photo first'); return; }
    saveApiKey(apiKey);
    setLoading(true);
    setError('');
    try {
      const base64Data = preview.split(',')[1];
      const mediaType = img.type || 'image/jpeg';
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64Data } },
              { type: 'text', text: 'Analyze this food image. If this is a nutrition label, extract the exact values. Otherwise estimate portions for Indian food. Return ONLY valid JSON (no markdown): {"items":[{"name":"item","portion":"amount","calories":0,"protein_g":0,"carbs_g":0,"fat_g":0}],"total_calories":0,"total_protein_g":0,"total_carbs_g":0,"total_fat_g":0,"confidence":"high|medium|low","notes":""}' },
            ],
          }],
        }),
      });
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error?.message || 'API error');
      }
      const data = await resp.json();
      const text = data.content[0].text;
      const json = JSON.parse(text.replace(/```json\n?/, '').replace(/```/, '').trim());
      setResult(json);
      setEditMode(false);
    } catch (err) {
      setError(err.message || 'Failed to analyze. Check your API key and try again.');
    }
    setLoading(false);
  };

  const updateResultItem = (idx, field, value) => {
    const updated = { ...result };
    updated.items = [...updated.items];
    updated.items[idx] = { ...updated.items[idx], [field]: isNaN(Number(value)) ? value : Number(value) };
    const totals = updated.items.reduce((acc, it) => ({
      cal: acc.cal + (it.calories || 0), prot: acc.prot + (it.protein_g || 0),
      carbs: acc.carbs + (it.carbs_g || 0), fat: acc.fat + (it.fat_g || 0),
    }), { cal: 0, prot: 0, carbs: 0, fat: 0 });
    updated.total_calories = totals.cal;
    updated.total_protein_g = totals.prot;
    updated.total_carbs_g = totals.carbs;
    updated.total_fat_g = totals.fat;
    setResult(updated);
  };

  const handleSaveScan = () => {
    if (!result || !onSaveFood) return;
    const food = {
      id: `scan-${Date.now()}`,
      name: result.items.map(i => i.name).join(' + '),
      desc: result.notes || 'Scanned food',
      cuisine: 'mixed',
      types: ['lunch'],
      isVeg: false,
      hasEgg: false,
      dairy: false,
      soy: false,
      cal: result.total_calories,
      protein: result.total_protein_g,
      carbs: result.total_carbs_g,
      fat: result.total_fat_g,
      serving: result.items.map(i => i.portion).join(', '),
      ingredients: result.items.map(i => i.name),
      source: 'photo-scan',
    };
    onSaveFood(food);
  };

  const handleSaveManual = () => {
    if (!manual.name || !onSaveFood) return;
    const food = {
      id: `manual-${Date.now()}`,
      name: manual.name,
      desc: `Custom: ${manual.name}`,
      cuisine: manual.cuisine,
      types: [...manual.mealTypes],
      isVeg: manual.isVeg,
      hasEgg: manual.hasEgg,
      dairy: false,
      soy: false,
      cal: Number(manual.cal) || 0,
      protein: Number(manual.protein) || 0,
      carbs: Number(manual.carbs) || 0,
      fat: Number(manual.fat) || 0,
      proteinDensity: Number(manual.cal) > 0 ? (Number(manual.protein) / Number(manual.cal) * 100) : 0,
      serving: `${manual.serving} ${manual.unit}`,
      ingredients: [],
      source: 'manual',
    };
    onSaveFood(food);
  };

  const toggleMealType = (t) => {
    setManual(prev => {
      const next = new Set(prev.mealTypes);
      next.has(t) ? next.delete(t) : next.add(t);
      return { ...prev, mealTypes: next };
    });
  };

  const confidenceColor = (c) => {
    if (c === 'high') return 'bg-sage-100 text-sage-700';
    if (c === 'medium') return 'bg-terra-100 text-terra-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-cream-50 rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cream-200">
          <h2 className="font-bold text-bark-700 text-lg">Add Food</h2>
          <button onClick={onClose} className="p-1.5 text-bark-400 hover:text-bark-600 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-cream-200">
          {[['scan', '📸 Scan Food'], ['manual', '✏️ Add Manually']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                tab === key
                  ? 'text-sage-700 border-b-2 border-sage-500 bg-sage-50/50'
                  : 'text-bark-400 hover:text-bark-600'
              }`}>
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* ─── SCAN TAB ─── */}
          {tab === 'scan' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-bark-600 mb-1">Claude API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="sk-ant-..."
                  className="w-full px-3 py-2 text-sm border border-cream-200 rounded-lg bg-white focus:outline-none focus:border-sage-400 transition-colors"
                />
                <p className="text-[10px] text-bark-400 mt-1">Stored locally. Never sent to our servers.</p>
              </div>

              <div>
                <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />
                <button onClick={() => fileRef.current?.click()}
                  className="w-full py-3 rounded-xl border-2 border-dashed border-cream-300 text-sm font-medium text-bark-500 hover:border-sage-300 hover:text-sage-600 transition-all flex items-center justify-center gap-2">
                  <Camera size={18} />
                  {preview ? 'Change Photo' : 'Upload or Take Photo'}
                </button>
              </div>

              {preview && (
                <div className="rounded-xl overflow-hidden border border-cream-200">
                  <img src={preview} alt="Food" className="w-full max-h-48 object-cover" />
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-600 flex items-center gap-2">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  {error}
                </div>
              )}

              <button onClick={analyze} disabled={loading || !preview || !apiKey}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-sage-500 to-sage-600 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-50 active:scale-[0.98]">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Analyzing...
                  </span>
                ) : '🔍 Analyze Meal'}
              </button>

              {/* Results */}
              {result && (
                <div className="bg-white rounded-xl border border-cream-200 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-bark-700 text-sm">Results</h3>
                    <div className="flex items-center gap-2">
                      {result.confidence && (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${confidenceColor(result.confidence)}`}>
                          {result.confidence}
                        </span>
                      )}
                      <button onClick={() => setEditMode(!editMode)}
                        className={`p-1.5 rounded-lg transition-colors ${editMode ? 'bg-sage-100 text-sage-700' : 'text-bark-400 hover:text-bark-600'}`}>
                        <Edit3 size={14} />
                      </button>
                    </div>
                  </div>

                  {result.items?.map((item, idx) => (
                    <div key={idx} className="bg-cream-50 rounded-lg p-3 space-y-2">
                      {editMode ? (
                        <>
                          <input value={item.name} onChange={e => updateResultItem(idx, 'name', e.target.value)}
                            className="w-full text-sm font-semibold text-bark-700 bg-white border border-cream-200 rounded px-2 py-1" />
                          <input value={item.portion} onChange={e => updateResultItem(idx, 'portion', e.target.value)}
                            className="w-full text-xs text-bark-500 bg-white border border-cream-200 rounded px-2 py-1" />
                          <div className="grid grid-cols-4 gap-1.5">
                            {[['calories', 'Cal'], ['protein_g', 'Prot'], ['carbs_g', 'Carb'], ['fat_g', 'Fat']].map(([f, l]) => (
                              <div key={f}>
                                <label className="text-[9px] text-bark-400">{l}</label>
                                <input type="number" value={item[f]} onChange={e => updateResultItem(idx, f, e.target.value)}
                                  className="w-full text-xs text-center bg-white border border-cream-200 rounded px-1 py-1" />
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-bark-700">{item.name}</span>
                            <span className="text-[10px] text-bark-400">{item.portion}</span>
                          </div>
                          <div className="grid grid-cols-4 gap-1.5 text-center">
                            <div className="bg-terra-50 rounded px-1 py-1">
                              <div className="text-xs font-bold text-terra-600">{item.calories}</div>
                              <div className="text-[9px] text-bark-400">Cal</div>
                            </div>
                            <div className="bg-sage-50 rounded px-1 py-1">
                              <div className="text-xs font-bold text-sage-600">{item.protein_g}g</div>
                              <div className="text-[9px] text-bark-400">Protein</div>
                            </div>
                            <div className="bg-protein-50 rounded px-1 py-1">
                              <div className="text-xs font-bold text-protein-600">{item.carbs_g}g</div>
                              <div className="text-[9px] text-bark-400">Carbs</div>
                            </div>
                            <div className="bg-cream-200 rounded px-1 py-1">
                              <div className="text-xs font-bold text-bark-600">{item.fat_g}g</div>
                              <div className="text-[9px] text-bark-400">Fat</div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}

                  {/* Totals */}
                  <div className="border-t border-cream-200 pt-3">
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div><span className="text-sm font-bold text-terra-600">{result.total_calories}</span><div className="text-[9px] text-bark-400">Total Cal</div></div>
                      <div><span className="text-sm font-bold text-sage-600">{result.total_protein_g}g</span><div className="text-[9px] text-bark-400">Protein</div></div>
                      <div><span className="text-sm font-bold text-protein-600">{result.total_carbs_g}g</span><div className="text-[9px] text-bark-400">Carbs</div></div>
                      <div><span className="text-sm font-bold text-bark-600">{result.total_fat_g}g</span><div className="text-[9px] text-bark-400">Fat</div></div>
                    </div>
                  </div>

                  {result.notes && <p className="text-[10px] text-bark-400 italic">{result.notes}</p>}

                  <button onClick={handleSaveScan}
                    className="w-full py-2.5 rounded-lg bg-sage-500 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-sage-600 transition-colors">
                    <Save size={14} />
                    Save to My Foods
                  </button>
                </div>
              )}
            </>
          )}

          {/* ─── MANUAL TAB ─── */}
          {tab === 'manual' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-bark-600 mb-1">Food Name</label>
                <input value={manual.name} onChange={e => setManual(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Paneer Tikka"
                  className="w-full px-3 py-2 text-sm border border-cream-200 rounded-lg bg-white focus:outline-none focus:border-sage-400 transition-colors" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-bark-600 mb-1">Cuisine</label>
                <select value={manual.cuisine} onChange={e => setManual(p => ({ ...p, cuisine: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-cream-200 rounded-lg bg-white focus:outline-none focus:border-sage-400 transition-colors">
                  {CUISINES.map(c => (
                    <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-bark-600 mb-1">Meal Type</label>
                <div className="flex flex-wrap gap-2">
                  {MEAL_TYPES.map(t => (
                    <button key={t} onClick={() => toggleMealType(t)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        manual.mealTypes.has(t)
                          ? 'bg-sage-500 text-white'
                          : 'bg-cream-100 text-bark-500 hover:bg-cream-200'
                      }`}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-bark-600 mb-2">Macros</label>
                <div className="grid grid-cols-2 gap-2">
                  {[['cal', 'Calories', 'terra'], ['protein', 'Protein (g)', 'sage'], ['carbs', 'Carbs (g)', 'protein'], ['fat', 'Fat (g)', 'bark']].map(([field, label, color]) => (
                    <div key={field} className={`bg-${color}-50 rounded-lg p-2`}>
                      <label className="text-[10px] font-medium text-bark-500">{label}</label>
                      <input type="number" value={manual[field]}
                        onChange={e => setManual(p => ({ ...p, [field]: e.target.value }))}
                        placeholder="0"
                        className="w-full mt-1 px-2 py-1.5 text-sm bg-white border border-cream-200 rounded focus:outline-none focus:border-sage-400 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-bark-600 mb-1">Serving Size</label>
                  <input type="number" value={manual.serving}
                    onChange={e => setManual(p => ({ ...p, serving: e.target.value }))}
                    placeholder="100"
                    className="w-full px-3 py-2 text-sm border border-cream-200 rounded-lg bg-white focus:outline-none focus:border-sage-400 transition-colors" />
                </div>
                <div className="w-24">
                  <label className="block text-xs font-semibold text-bark-600 mb-1">Unit</label>
                  <select value={manual.unit} onChange={e => setManual(p => ({ ...p, unit: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-cream-200 rounded-lg bg-white focus:outline-none focus:border-sage-400 transition-colors">
                    {['g', 'ml', 'cup', 'tbsp', 'piece', 'serving'].map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className={`w-10 h-6 rounded-full flex items-center transition-colors ${manual.isVeg ? 'bg-sage-500 justify-end' : 'bg-bark-200 justify-start'}`}>
                    <div className="w-5 h-5 rounded-full bg-white shadow mx-0.5" />
                  </div>
                  <input type="checkbox" className="hidden" checked={manual.isVeg}
                    onChange={e => setManual(p => ({ ...p, isVeg: e.target.checked }))} />
                  <span className="text-xs font-medium text-bark-600">Vegetarian</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className={`w-10 h-6 rounded-full flex items-center transition-colors ${manual.hasEgg ? 'bg-terra-500 justify-end' : 'bg-bark-200 justify-start'}`}>
                    <div className="w-5 h-5 rounded-full bg-white shadow mx-0.5" />
                  </div>
                  <input type="checkbox" className="hidden" checked={manual.hasEgg}
                    onChange={e => setManual(p => ({ ...p, hasEgg: e.target.checked }))} />
                  <span className="text-xs font-medium text-bark-600">Has Egg</span>
                </label>
              </div>

              <button onClick={handleSaveManual} disabled={!manual.name || manual.mealTypes.size === 0}
                className="w-full py-2.5 rounded-lg bg-sage-500 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-sage-600 transition-colors disabled:opacity-50">
                <Plus size={14} />
                Save Food
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
