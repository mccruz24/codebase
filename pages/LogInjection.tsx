import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getCompounds, saveInjection, getInjections } from '../services/storage';
import { Compound } from '../types';
import { compressImage } from '../services/imageCompression';
import {
  X,
  Check,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Syringe,
  Sparkles,
  Droplet,
  MapPin,
  Grid3X3,
  Camera,
} from 'lucide-react';

export const LogInjection: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedId = searchParams.get('compoundId');

  const [compounds, setCompounds] = useState<Compound[]>([]);
  const [selectedCompoundId, setSelectedCompoundId] = useState<string>('');
  const [dose, setDose] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().substring(0, 16));

  // Specific for MN
  const [needleDepth, setNeedleDepth] = useState<string>('');
  const [glideSerum, setGlideSerum] = useState<string>('');

  // Photo
  const [photo, setPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<'select' | 'log'>('select');

  const handleCompoundSelect = useCallback(
    (id: string, list = compounds) => {
      setSelectedCompoundId(id);
      const injections = getInjections();

      const last = injections
        .filter((i) => i.compoundId === id)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .pop();
      const comp = list.find((c) => c.id === id);

      // Pre-fill logic based on category
      if (comp?.category === 'microneedling') {
        if (last && last.needleDepth) setNeedleDepth(last.needleDepth.toString());
        if (last && last.glideSerum) setGlideSerum(last.glideSerum);
        setDose(''); // Irrelevant for MN usually, unless stored as 0
      } else {
        if (last) {
          setDose(last.dose.toString());
        } else if (comp && comp.doseAmount) {
          setDose(comp.doseAmount.toString());
        } else {
          setDose('');
        }
      }
      setMode('log');
    },
    [compounds]
  );

  useEffect(() => {
    const all = getCompounds().filter((c) => !c.isArchived);
    setCompounds(all);

    if (preSelectedId) {
      const exists = all.find((c) => c.id === preSelectedId);
      if (exists) {
        handleCompoundSelect(preSelectedId, all);
      } else {
        setMode('select');
      }
    } else {
      setMode('select');
    }
  }, [preSelectedId, handleCompoundSelect]);

  const handleBack = () => {
    if (mode === 'log' && !preSelectedId) {
      setMode('select');
    } else {
      navigate(-1);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file);
        setPhoto(compressed);
      } catch {
        // Fallback to raw data URL if compression fails
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhoto(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompoundId) return;

    const comp = compounds.find((c) => c.id === selectedCompoundId);

    // Validation: MN needs depth? others need dose?
    if (comp?.category !== 'microneedling' && !dose) return;
    // MN might not strictly need depth, but preferred.

    // Site is now derived from protocol targetArea if present, or joined if multiple
    const derivedSite =
      comp?.targetArea && comp.targetArea.length > 0 ? comp.targetArea.join(', ') : undefined;

    saveInjection({
      compoundId: selectedCompoundId,
      timestamp: new Date(date).toISOString(),
      dose: dose ? parseFloat(dose) : 0,
      site: derivedSite,
      photo: photo || undefined,
      needleDepth: needleDepth ? parseFloat(needleDepth) : undefined,
      glideSerum: glideSerum || undefined,
    });
    navigate('/');
  };

  const selectedCompound = compounds.find((c) => c.id === selectedCompoundId);

  const getIcon = (category?: string) => {
    switch (category) {
      case 'relaxant':
        return <Sparkles size={20} />;
      case 'booster':
        return <Droplet size={20} />;
      case 'microneedling':
        return <Grid3X3 size={20} />;
      default:
        return <Syringe size={20} />;
    }
  };

  // 1. SELECTION SCREEN
  if (mode === 'select') {
    return (
      <div className="h-full flex flex-col bg-[#F8F9FB] dark:bg-stone-950 min-h-screen -m-6 sm:m-0 fixed inset-0 z-50 overflow-y-auto animate-in fade-in duration-300">
        <div className="p-6 flex-1 flex flex-col max-w-md mx-auto w-full">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 bg-white dark:bg-stone-900 rounded-full flex items-center justify-center text-stone-400 shadow-sm border border-stone-50 dark:border-stone-800"
            >
              <X size={20} />
            </button>
            <div className="w-10" />
          </div>

          <div className="flex-1 flex flex-col justify-center pb-20">
            <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-2 text-center">
              Log Protocol
            </h1>
            <p className="text-stone-400 text-center mb-10 font-medium">
              What did you administer today?
            </p>

            <div className="space-y-4">
              {compounds.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleCompoundSelect(c.id)}
                  className="w-full bg-white dark:bg-stone-900 p-5 rounded-[24px] shadow-sm border border-stone-50 dark:border-stone-800 flex items-center justify-between active:scale-[0.98] transition-all hover:bg-stone-50 dark:hover:bg-stone-800 group"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-12 h-12 rounded-2xl ${c.color} flex items-center justify-center text-white shadow-sm`}
                    >
                      {getIcon(c.category)}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-lg text-stone-900 dark:text-stone-100">
                        {c.name}
                      </p>
                      <div className="flex items-center space-x-2 mt-0.5">
                        {c.category !== 'microneedling' && (
                          <span className="text-xs font-bold text-stone-400 bg-stone-50 dark:bg-stone-800 px-2 py-0.5 rounded-lg border border-stone-100 dark:border-stone-700">
                            {c.doseAmount} {c.doseUnit}
                          </span>
                        )}
                        {c.targetArea && c.targetArea.length > 0 && (
                          <span className="text-xs text-stone-400">
                            • {c.targetArea[0]}
                            {c.targetArea.length > 1 ? ` +${c.targetArea.length - 1}` : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-stone-50 dark:bg-stone-800 flex items-center justify-center text-stone-300 dark:text-stone-500 group-hover:bg-stone-100 dark:group-hover:bg-stone-700 transition-colors">
                    <ChevronRight size={18} />
                  </div>
                </button>
              ))}
            </div>

            {compounds.length === 0 && (
              <div className="text-center p-8">
                <p className="text-stone-400 mb-6 font-medium">No protocols found.</p>
                <button
                  onClick={() => navigate('/compounds/new')}
                  className="bg-stone-900 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-stone-200"
                >
                  Add Your First Protocol
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. LOGGING FORM SCREEN
  return (
    <div className="h-full flex flex-col bg-[#F8F9FB] dark:bg-stone-950 min-h-screen -m-6 sm:m-0 fixed inset-0 z-50 overflow-y-auto animate-in slide-in-from-right duration-300">
      <div className="p-6 flex-1 flex flex-col max-w-md mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleBack}
            className="w-10 h-10 bg-white dark:bg-stone-900 rounded-full flex items-center justify-center text-stone-400 shadow-sm border border-stone-50 dark:border-stone-800"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-lg font-bold text-stone-900 dark:text-stone-100">Log Protocol</h1>
          <div className="w-10" />
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          {/* Compound Selector Dropdown Trigger */}
          <div className="mb-6 flex justify-center">
            <button
              type="button"
              onClick={() => setMode('select')}
              className="flex items-center justify-center space-x-3 bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 py-3 pl-4 pr-5 rounded-2xl shadow-sm active:scale-95 transition-all group hover:border-stone-200 dark:hover:border-stone-700"
            >
              <div
                className={`w-6 h-6 rounded-lg ${selectedCompound?.color} flex items-center justify-center text-white`}
              >
                {selectedCompound?.category === 'relaxant' ? (
                  <Sparkles size={12} />
                ) : selectedCompound?.category === 'booster' ? (
                  <Droplet size={12} />
                ) : selectedCompound?.category === 'microneedling' ? (
                  <Grid3X3 size={12} />
                ) : (
                  <Syringe size={12} />
                )}
              </div>
              <span className="font-bold text-stone-900 dark:text-stone-100 text-lg">
                {selectedCompound?.name}
              </span>
              <ChevronDown
                size={18}
                className="text-stone-300 group-hover:text-stone-500 transition-colors"
              />
            </button>
          </div>

          {/* Main Card */}
          <div className="bg-white dark:bg-stone-900 rounded-[40px] shadow-sm border border-stone-50 dark:border-stone-800 p-8 flex-1 flex flex-col space-y-8 relative overflow-hidden">
            {/* Decorative Blob */}
            <div
              className={`absolute top-0 left-0 w-full h-32 bg-gradient-to-b ${selectedCompound?.color.replace('bg-', 'from-').replace('500', '100')} to-transparent opacity-30`}
            />

            {/* Dynamic Input Section */}
            <div className="relative z-10 w-full text-center">
              {selectedCompound?.category === 'microneedling' ? (
                // MICRO NEEDLING SPECIFIC INPUTS
                <div className="flex flex-col space-y-4">
                  <div>
                    <label className="block text-center text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">
                      Needle Depth (mm)
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={needleDepth}
                      onChange={(e) => setNeedleDepth(e.target.value)}
                      placeholder="0.0"
                      autoFocus
                      className="w-full text-center text-5xl font-extrabold text-stone-900 dark:text-stone-100 bg-transparent focus:outline-none placeholder-stone-200 dark:placeholder-stone-800"
                    />
                  </div>
                  <div>
                    <label className="block text-center text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">
                      Glide Serum
                    </label>
                    <input
                      type="text"
                      value={glideSerum}
                      onChange={(e) => setGlideSerum(e.target.value)}
                      placeholder="e.g. Hyaluronic Acid"
                      className="w-full text-center text-lg font-bold text-stone-900 dark:text-stone-100 bg-stone-50 dark:bg-stone-800 p-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-stone-200"
                    />
                  </div>
                </div>
              ) : (
                // STANDARD DOSE INPUT
                <>
                  <label className="block text-center text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">
                    Dose Amount
                  </label>
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex items-baseline justify-center w-full">
                      <input
                        type="number"
                        inputMode="decimal"
                        value={dose}
                        onChange={(e) => setDose(e.target.value)}
                        placeholder="0"
                        autoFocus
                        className="w-full text-center text-7xl font-extrabold text-stone-900 dark:text-stone-100 bg-transparent focus:outline-none placeholder-stone-200 dark:placeholder-stone-800 px-2"
                      />
                    </div>
                    <span className="text-xl font-bold text-stone-400 mt-2">
                      {selectedCompound?.doseUnit}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="w-full space-y-6 relative z-10">
              {/* Date Picker */}
              <div className="bg-stone-50 dark:bg-stone-800 rounded-2xl p-2 flex items-center border border-stone-100 dark:border-stone-700 focus-within:ring-2 focus-within:ring-stone-200 transition-all">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-stone-700 flex items-center justify-center text-stone-400 shadow-sm mr-3">
                  <Calendar size={18} />
                </div>
                <input
                  type="datetime-local"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-transparent w-full text-stone-700 dark:text-stone-200 font-bold text-sm focus:outline-none pr-2"
                />
              </div>

              {/* Photo Upload */}
              <div className="bg-stone-50 dark:bg-stone-800 rounded-2xl p-4 border border-stone-100 dark:border-stone-700">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3 block">
                  Before Photo
                </label>
                <div className="flex items-center space-x-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-16 h-16 rounded-2xl bg-white dark:bg-stone-700 border-2 border-dashed border-stone-200 dark:border-stone-600 flex items-center justify-center cursor-pointer hover:border-stone-400 transition-colors overflow-hidden relative"
                  >
                    {photo ? (
                      <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera size={20} className="text-stone-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-sm font-bold text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-700 px-4 py-2 rounded-xl border border-stone-100 dark:border-stone-600 shadow-sm"
                    >
                      {photo ? 'Change Photo' : 'Add Photo'}
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoUpload}
                    />
                  </div>
                </div>
              </div>

              {/* Display Area Info (Read Only) */}
              {selectedCompound?.targetArea && selectedCompound.targetArea.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-3 px-1">
                    <MapPin size={14} className="text-stone-400" />
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                      Treatment Site
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedCompound.targetArea.map((a) => (
                      <div
                        key={a}
                        className="bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 px-3 py-2 rounded-xl text-xs font-bold border border-stone-200 dark:border-stone-700"
                      >
                        {a}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 pb-6">
            <button
              type="submit"
              disabled={
                !selectedCompoundId || (selectedCompound?.category !== 'microneedling' && !dose)
              }
              className="w-full bg-pastel-yellow text-stone-900 py-5 rounded-[24px] font-bold text-lg shadow-xl shadow-orange-100 dark:shadow-stone-900/50 flex items-center justify-center space-x-2 active:scale-[0.98] transition-all disabled:opacity-50 disabled:shadow-none"
            >
              <Check size={24} strokeWidth={3} />
              <span>Confirm Log</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
