import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { saveCompound, getCompounds, deleteCompound } from '../services/storage';
import { getPeptideList } from '../services/researchData';
import { Compound, COLORS } from '../types';
import { X, Check, Droplet, Trash2, ChevronLeft, Syringe, Sparkles, Grid3X3, Calendar } from 'lucide-react';

const BOOSTER_SUBS = [
  "Dermal Filler",
  "Body Filler",
  "Polynucleotide",
  "PLLA (Sculptra)",
  "PDO Threads",
  "Hair/Scalp Booster",
  "Other"
];

const RELAXANT_AREAS = [
  "Glabella (11s)", 
  "Forehead", 
  "Crow's Feet", 
  "Masseter", 
  "Bunny Lines", 
  "Chin (Mentalis)", 
  "DAO", 
  "Lip Flip", 
  "Platysma", 
  "Traps",
  "Full Face"
];

const BOOSTER_AREAS = [
  "Full Face",
  "Under Eyes",
  "Cheeks",
  "Lips",
  "Jawline",
  "Neck",
  "Décolletage",
  "Hands",
  "Scalp",
  "Body"
];

const MN_AREAS = [
  "Face",
  "Neck",
  "Scalp",
  "Hands",
  "Body (Stretch Marks)",
  "Scars"
];

export const CompoundForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [peptideSuggestions, setPeptideSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [formData, setFormData] = useState<Partial<Compound>>({
    name: '',
    category: 'peptide',
    subCategory: '',
    targetArea: [],
    doseUnit: 'mg',
    doseAmount: 0,
    frequencyType: 'specific_days',
    frequencySpecificDays: [],
    frequencyDays: 0,
    peptideAmount: 0,
    dilutionAmount: 0,
    startDate: new Date().toISOString().split('T')[0], // Default to today YYYY-MM-DD
    isArchived: false,
    color: COLORS[0],
  });

  useEffect(() => {
    if (id) {
      const compound = getCompounds().find(c => c.id === id);
      if (compound) {
        // Ensure date is in correct format for input type="date"
        const formattedDate = compound.startDate ? new Date(compound.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        setFormData({ ...compound, startDate: formattedDate });
      }
    }
  }, [id]);

  useEffect(() => {
    if (formData.category === 'peptide' && formData.name) {
       const list = getPeptideList();
       const filtered = list.filter(p => p.toLowerCase().includes(formData.name!.toLowerCase()) && p !== formData.name);
       setPeptideSuggestions(filtered.slice(0, 5));
    } else {
       setPeptideSuggestions([]);
    }
  }, [formData.name, formData.category]);

  const handleCategoryChange = (cat: Compound['category']) => {
    if (cat === 'relaxant') {
        setFormData({
            ...formData,
            category: cat,
            doseUnit: 'IU',
            frequencyType: 'interval',
            frequencyDays: 90,
            frequencySpecificDays: [],
            targetArea: []
        });
    } else if (cat === 'booster') {
        setFormData({
            ...formData,
            category: cat,
            doseUnit: 'ml',
            frequencyType: 'interval',
            frequencyDays: 30,
            frequencySpecificDays: [],
            targetArea: [],
            subCategory: BOOSTER_SUBS[0]
        });
    } else if (cat === 'microneedling') {
        setFormData({
            ...formData,
            category: cat,
            doseUnit: 'mm',
            frequencyType: 'interval',
            frequencyDays: 28,
            frequencySpecificDays: [],
            targetArea: [],
            subCategory: '',
            doseAmount: 0 // No default dose/depth in protocol, set during log
        });
    } else {
        setFormData({
            ...formData,
            category: cat,
            doseUnit: 'mg',
            frequencyType: 'specific_days',
            frequencyDays: 0,
            frequencySpecificDays: [],
            targetArea: []
        });
    }
  };

  const toggleArea = (area: string) => {
    const current = formData.targetArea || [];
    const updated = current.includes(area)
      ? current.filter(a => a !== area)
      : [...current, area];
    setFormData({ ...formData, targetArea: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    
    // Calculate concentration if fields are present
    let concentration = undefined;
    if (formData.peptideAmount && formData.dilutionAmount && formData.dilutionAmount > 0) {
      concentration = Number((formData.peptideAmount / formData.dilutionAmount).toFixed(2));
    }

    saveCompound({
      id,
      name: formData.name,
      category: formData.category || 'peptide',
      subCategory: formData.subCategory,
      targetArea: formData.targetArea,
      doseUnit: formData.doseUnit || 'mg',
      doseAmount: Number(formData.doseAmount),
      frequencyType: formData.frequencyType || 'specific_days',
      frequencySpecificDays: formData.frequencySpecificDays || [],
      frequencyDays: Number(formData.frequencyDays) || 0, 
      startDate: new Date(formData.startDate!).toISOString(),
      isArchived: formData.isArchived || false,
      color: formData.color || COLORS[0],
      peptideAmount: Number(formData.peptideAmount),
      dilutionAmount: Number(formData.dilutionAmount),
      concentration: concentration
    });
    navigate('/compounds');
  };

  const handleDelete = () => {
    if (id && window.confirm('Delete this protocol?')) {
      deleteCompound(id);
      navigate('/compounds');
    }
  };

  const toggleDay = (day: string) => {
    const current = formData.frequencySpecificDays || [];
    const updated = current.includes(day)
      ? current.filter(d => d !== day)
      : [...current, day];
    setFormData({ ...formData, frequencySpecificDays: updated });
  };

  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const calculatedConcentration = (formData.peptideAmount && formData.dilutionAmount) 
    ? (formData.peptideAmount / formData.dilutionAmount).toFixed(2) 
    : '0.00';

  const getTargetAreaOptions = () => {
      switch(formData.category) {
          case 'relaxant': return RELAXANT_AREAS;
          case 'booster': return BOOSTER_AREAS;
          case 'microneedling': return MN_AREAS;
          default: return [];
      }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="flex items-center justify-between py-6 px-1">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-stone-500 dark:text-stone-400 rounded-full hover:bg-stone-100 dark:hover:bg-stone-900">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">{id ? 'Edit Protocol' : 'New Protocol'}</h1>
        <div className="w-8" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Category Selector */}
        <div className="bg-white dark:bg-stone-900 p-2 rounded-[24px] shadow-sm border border-stone-50 dark:border-stone-800 grid grid-cols-4 gap-1">
            <button
                type="button"
                onClick={() => handleCategoryChange('peptide')}
                className={`py-3 rounded-xl text-[10px] font-bold flex flex-col items-center justify-center space-y-1 transition-all ${formData.category === 'peptide' ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-md' : 'text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'}`}
            >
                <Syringe size={16} />
                <span>Peptide</span>
            </button>
            <button
                type="button"
                onClick={() => handleCategoryChange('relaxant')}
                className={`py-3 rounded-xl text-[10px] font-bold flex flex-col items-center justify-center space-y-1 transition-all ${formData.category === 'relaxant' ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-md' : 'text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'}`}
            >
                <Sparkles size={16} />
                <span>Relaxant</span>
            </button>
            <button
                type="button"
                onClick={() => handleCategoryChange('booster')}
                className={`py-3 rounded-xl text-[10px] font-bold flex flex-col items-center justify-center space-y-1 transition-all ${formData.category === 'booster' ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-md' : 'text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'}`}
            >
                <Droplet size={16} />
                <span>Booster</span>
            </button>
            <button
                type="button"
                onClick={() => handleCategoryChange('microneedling')}
                className={`py-3 rounded-xl text-[10px] font-bold flex flex-col items-center justify-center space-y-1 transition-all ${formData.category === 'microneedling' ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-md' : 'text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'}`}
            >
                <Grid3X3 size={16} />
                <span>Micro</span>
            </button>
        </div>

        {/* Identity */}
        <div className="bg-white dark:bg-stone-900 p-6 rounded-[32px] shadow-sm border border-stone-50 dark:border-stone-800 space-y-6">
            
            {/* Sub-Category for Boosters */}
            {formData.category === 'booster' && (
                <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-wider ml-1">Booster Type</label>
                    <div className="relative">
                        <select 
                            value={formData.subCategory}
                            onChange={(e) => setFormData({...formData, subCategory: e.target.value})}
                            className="w-full p-4 bg-stone-50 dark:bg-stone-800 border-none rounded-2xl text-sm font-bold text-stone-800 dark:text-stone-100 outline-none appearance-none"
                        >
                            {BOOSTER_SUBS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <ChevronLeft size={16} className="rotate-[-90deg] text-stone-400" />
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-2 relative">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider ml-1">
                    {formData.category === 'peptide' ? 'Peptide Name' : formData.category === 'relaxant' ? 'Product Brand' : formData.category === 'microneedling' ? 'Protocol Name' : 'Item Name'}
                </label>
                <input
                    type="text"
                    required
                    placeholder={formData.category === 'relaxant' ? "e.g. Botox, Dysport" : formData.category === 'booster' ? "e.g. Rejuran, Profhilo" : formData.category === 'microneedling' ? "e.g. Face Rejuvenation" : "e.g. BPC-157"}
                    value={formData.name}
                    onChange={e => {
                        setFormData({ ...formData, name: e.target.value });
                        setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    className="w-full p-4 bg-stone-50 dark:bg-stone-800 border-none rounded-2xl text-lg font-bold text-stone-800 dark:text-stone-100 placeholder-stone-300 dark:placeholder-stone-600 focus:ring-2 focus:ring-pastel-blue outline-none transition-all"
                />
                
                {/* Auto-suggestions for Peptides */}
                {formData.category === 'peptide' && showSuggestions && peptideSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full bg-white dark:bg-stone-800 shadow-xl rounded-xl mt-1 border border-stone-100 dark:border-stone-700 overflow-hidden">
                        {peptideSuggestions.map(suggestion => (
                            <button
                                key={suggestion}
                                type="button"
                                onClick={() => {
                                    setFormData({ ...formData, name: suggestion });
                                    setShowSuggestions(false);
                                }}
                                className="w-full text-left px-4 py-3 text-sm font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 border-b border-stone-50 dark:border-stone-700 last:border-0"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Target Area for Relaxants, Boosters, & MN */}
            {formData.category !== 'peptide' && (
                <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-wider ml-1">Treatment Areas</label>
                    <div className="flex flex-wrap gap-2">
                        {getTargetAreaOptions().map(area => {
                            const isSelected = formData.targetArea?.includes(area);
                            return (
                                <button
                                    key={area}
                                    type="button"
                                    onClick={() => toggleArea(area)}
                                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                                        isSelected
                                        ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 border-stone-900 dark:border-stone-100'
                                        : 'bg-stone-50 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border-transparent hover:border-stone-200'
                                    }`}
                                >
                                    {area}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Dose - Hidden for Microneedling during setup */}
            {formData.category !== 'microneedling' && (
                <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-wider ml-1">
                            Dose ({formData.doseUnit})
                        </label>
                        <input
                            type="number"
                            step="any"
                            placeholder="0.0"
                            value={formData.doseAmount || ''}
                            onChange={e => setFormData({ ...formData, doseAmount: parseFloat(e.target.value) })}
                            className="w-full p-4 bg-stone-50 dark:bg-stone-800 border-none rounded-2xl text-lg font-bold text-stone-800 dark:text-stone-100 focus:ring-2 focus:ring-pastel-blue outline-none"
                        />
                    </div>
                </div>
            )}
        </div>

        {/* Schedule */}
        <div className="bg-white dark:bg-stone-900 p-6 rounded-[32px] shadow-sm border border-stone-50 dark:border-stone-800 space-y-4">
          <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider ml-1">Start Date</label>
              <div className="bg-stone-50 dark:bg-stone-800 rounded-2xl p-2 border border-stone-100 dark:border-stone-700 flex items-center">
                  <Calendar size={16} className="text-stone-400 ml-2 mr-2" />
                  <input 
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="bg-transparent font-bold text-stone-800 dark:text-stone-100 text-sm outline-none"
                  />
              </div>
          </div>

          <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider ml-1">Frequency</label>
              
              {/* Type Toggle */}
              <div className="bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg flex">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, frequencyType: 'specific_days' })}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${formData.frequencyType === 'specific_days' ? 'bg-white dark:bg-stone-600 shadow-sm text-stone-900 dark:text-white' : 'text-stone-400'}`}
                  >
                      Days
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, frequencyType: 'interval' })}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${formData.frequencyType === 'interval' ? 'bg-white dark:bg-stone-600 shadow-sm text-stone-900 dark:text-white' : 'text-stone-400'}`}
                  >
                      Interval
                  </button>
              </div>
          </div>

          {formData.frequencyType === 'specific_days' ? (
              <div className="flex justify-between items-center bg-transparent">
                {WEEKDAYS.map(day => {
                const isSelected = formData.frequencySpecificDays?.includes(day);
                return (
                    <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`w-10 h-12 rounded-2xl text-xs font-bold transition-all ${
                        isSelected 
                        ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-lg shadow-stone-200 dark:shadow-stone-900/40 transform -translate-y-1' 
                        : 'bg-stone-50 dark:bg-stone-800 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700'
                    }`}
                    >
                    {day.charAt(0)}
                    </button>
                );
                })}
            </div>
          ) : (
             <div className="flex items-center space-x-4">
                 <span className="text-sm font-bold text-stone-500 dark:text-stone-400">Every</span>
                 <input
                    type="number"
                    value={formData.frequencyDays || ''}
                    onChange={e => setFormData({ ...formData, frequencyDays: parseFloat(e.target.value) })}
                    placeholder={formData.category === 'microneedling' ? "28" : "90"}
                    className="w-24 p-3 bg-stone-50 dark:bg-stone-800 rounded-xl font-bold text-center text-stone-900 dark:text-stone-100 focus:outline-none"
                 />
                 <span className="text-sm font-bold text-stone-500 dark:text-stone-400">Days</span>
             </div>
          )}
        </div>

        {/* Brand Theme */}
        <div className="bg-white dark:bg-stone-900 p-6 rounded-[32px] shadow-sm border border-stone-50 dark:border-stone-800 space-y-4">
           <label className="text-xs font-bold text-stone-400 uppercase tracking-wider ml-1">Color Theme</label>
           <div className="flex space-x-3 overflow-x-auto no-scrollbar py-2">
             {COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-12 h-12 rounded-2xl shrink-0 transition-transform ${color} ${
                    formData.color === color ? 'ring-4 ring-offset-2 ring-stone-100 dark:ring-stone-700 dark:ring-offset-stone-900 scale-105' : 'opacity-80 hover:opacity-100 scale-95'
                  } flex items-center justify-center`}
                >
                  {formData.color === color && <Check size={20} className="text-white" strokeWidth={3} />}
                </button>
             ))}
           </div>
        </div>

        {/* Vial Information (Advanced) - Only for Peptides */}
        {formData.category === 'peptide' && (
            <div className="bg-stone-100/50 dark:bg-stone-900/30 p-6 rounded-[32px] border border-stone-200/50 dark:border-stone-800 space-y-4">
            <div className="flex items-center space-x-2 mb-2">
                    <Droplet size={16} className="text-stone-400" />
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Reconstitution (Optional)</label>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-stone-400 uppercase ml-1">Total {formData.doseUnit === 'IU' ? 'Units' : 'Amount'} ({formData.doseUnit})</label>
                    <input
                    type="number"
                    placeholder="5"
                    value={formData.peptideAmount || ''}
                    onChange={e => setFormData({ ...formData, peptideAmount: parseFloat(e.target.value) })}
                    className="w-full p-3 bg-white dark:bg-stone-800 border-none rounded-2xl text-sm font-bold text-stone-800 dark:text-stone-100 focus:ring-2 focus:ring-stone-200 outline-none"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-stone-400 uppercase ml-1">Water Added (ml)</label>
                    <input
                    type="number"
                    placeholder="2"
                    value={formData.dilutionAmount || ''}
                    onChange={e => setFormData({ ...formData, dilutionAmount: parseFloat(e.target.value) })}
                    className="w-full p-3 bg-white dark:bg-stone-800 border-none rounded-2xl text-sm font-bold text-stone-800 dark:text-stone-100 focus:ring-2 focus:ring-stone-200 outline-none"
                    />
                </div>
            </div>

            {(formData.peptideAmount && formData.dilutionAmount) ? (
                <div className="bg-stone-900 dark:bg-stone-100 rounded-2xl p-4 flex justify-between items-center text-sm shadow-md">
                    <span className="text-stone-400 dark:text-stone-500 font-medium">Concentration</span>
                    <span className="text-white dark:text-stone-900 font-bold text-lg">{calculatedConcentration} {formData.doseUnit}/ml</span>
                </div>
            ) : null}
            </div>
        )}

        {/* Actions */}
        <div className="pt-4 flex flex-col space-y-3">
            <button
              type="submit"
              className="w-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 py-4 rounded-3xl font-bold text-lg shadow-xl shadow-stone-200 dark:shadow-stone-900/50 active:scale-[0.98] transition-transform"
            >
              Save Protocol
            </button>
            
            {id && (
              <button
                type="button"
                onClick={handleDelete}
                className="w-full text-red-400 py-3 font-bold bg-red-50 dark:bg-red-900/20 rounded-3xl flex items-center justify-center text-sm hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
              >
                <Trash2 size={16} className="mr-2" /> Delete Protocol
              </button>
            )}
        </div>
      </form>
    </div>
  );
};