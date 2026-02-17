import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRightLeft, ChevronLeft } from 'lucide-react';

export const UnitConverter: React.FC = () => {
  const navigate = useNavigate();
  const [val, setVal] = useState<string>('1');
  const [mode, setMode] = useState<'mg_mcg' | 'lb_kg'>('mg_mcg');

  return (
    <div className="pt-6 pb-20 min-h-screen bg-[#F8F9FB]">
      <div className="flex items-center justify-between mb-6 px-1">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-stone-500 rounded-full hover:bg-stone-100">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-stone-900">Unit Converter</h1>
        <div className="w-8" />
      </div>

      <div className="space-y-6">
        {/* Toggle */}
        <div className="bg-white p-1.5 rounded-2xl flex shadow-sm border border-stone-50">
            <button 
                onClick={() => setMode('mg_mcg')}
                className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${mode === 'mg_mcg' ? 'bg-stone-900 text-white shadow-md' : 'text-stone-400 hover:bg-stone-50'}`}
            >
                Mg ↔ Mcg
            </button>
            <button 
                onClick={() => setMode('lb_kg')}
                className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${mode === 'lb_kg' ? 'bg-stone-900 text-white shadow-md' : 'text-stone-400 hover:bg-stone-50'}`}
            >
                Lbs ↔ Kg
            </button>
        </div>

        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-stone-50 space-y-8">
            <div>
                <label className="block text-center text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Input Value</label>
                <div className="relative">
                    <input
                    type="number"
                    value={val}
                    onChange={e => setVal(e.target.value)}
                    className="w-full pb-2 bg-transparent border-b-2 border-stone-100 text-5xl font-extrabold text-stone-900 focus:border-stone-900 outline-none text-center transition-colors"
                    />
                    <span className="block text-center text-sm font-bold text-stone-400 mt-2">{mode === 'mg_mcg' ? 'mg' : 'lbs'}</span>
                </div>
            </div>

            <div className="flex justify-center">
                <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-300">
                    <ArrowRightLeft size={18} className="rotate-90" />
                </div>
            </div>

            <div className="text-center">
                 <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Result</p>
                 <p className="text-4xl font-extrabold text-stone-900">
                    {mode === 'mg_mcg' 
                        ? (parseFloat(val || '0') * 1000).toLocaleString() 
                        : (parseFloat(val || '0') * 0.453592).toFixed(2)
                    }
                 </p>
                 <span className="block text-center text-sm font-bold text-stone-400 mt-1">{mode === 'mg_mcg' ? 'mcg' : 'kg'}</span>
            </div>
        </div>

        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-stone-50">
             <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 text-center">Reverse</p>
             <div className="flex justify-between items-center text-sm font-medium text-stone-600">
                <div className="text-center w-1/3">
                    <span className="block font-bold text-stone-900 text-lg">{val || 0}</span>
                    <span className="text-xs text-stone-400">{mode === 'mg_mcg' ? 'mcg' : 'kg'}</span>
                </div>
                <ArrowRightLeft size={16} className="text-stone-300" />
                <div className="text-center w-1/3">
                    <span className="block font-bold text-stone-900 text-lg">
                        {mode === 'mg_mcg' 
                            ? (parseFloat(val || '0') / 1000).toLocaleString() 
                            : (parseFloat(val || '0') * 2.20462).toFixed(2)
                        }
                    </span>
                    <span className="text-xs text-stone-400">{mode === 'mg_mcg' ? 'mg' : 'lbs'}</span>
                </div>
             </div>
        </div>
      </div>
    </div>
  );
};