import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calculator, Info, ChevronLeft } from 'lucide-react';

export const PeptideCalculator: React.FC = () => {
  const navigate = useNavigate();
  const [vialMg, setVialMg] = useState<string>('5');
  const [waterMl, setWaterMl] = useState<string>('2');
  const [doseMcg, setDoseMcg] = useState<string>('250');

  const calculate = () => {
    const mg = parseFloat(vialMg);
    const ml = parseFloat(waterMl);
    const dose = parseFloat(doseMcg);

    if (!mg || !ml || !dose) return null;

    const totalMcg = mg * 1000;
    const concentrationMcgMl = totalMcg / ml;
    const doseMl = dose / concentrationMcgMl;
    const units = doseMl * 100;

    return {
      doseMl: doseMl.toFixed(3),
      units: Math.round(units * 10) / 10,
      concentration: concentrationMcgMl
    };
  };

  const result = calculate();

  return (
    <div className="pt-6 pb-20 min-h-screen bg-[#F8F9FB]">
      <div className="flex items-center justify-between mb-6 px-1">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-stone-500 rounded-full hover:bg-stone-100">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-stone-900">Peptide Calc</h1>
        <div className="w-8" />
      </div>

      <div className="bg-white p-5 rounded-[24px] border border-stone-50 mb-6 text-xs text-stone-500 flex items-start shadow-sm leading-relaxed">
        <Info size={16} className="mr-3 mt-0.5 shrink-0 text-blue-500" fill="currentColor" />
        <p>Calculate reconstitution dosing for U-100 insulin syringes.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-stone-50 space-y-6">
          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 ml-1">Vial Quantity (mg)</label>
            <input
              type="number"
              value={vialMg}
              onChange={e => setVialMg(e.target.value)}
              className="w-full p-4 bg-stone-50 border-none rounded-2xl text-lg font-bold text-stone-800 focus:ring-2 focus:ring-pastel-blue outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 ml-1">Water Added (ml)</label>
            <input
              type="number"
              value={waterMl}
              onChange={e => setWaterMl(e.target.value)}
              className="w-full p-4 bg-stone-50 border-none rounded-2xl text-lg font-bold text-stone-800 focus:ring-2 focus:ring-pastel-blue outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 ml-1">Desired Dose (mcg)</label>
            <input
              type="number"
              value={doseMcg}
              onChange={e => setDoseMcg(e.target.value)}
              className="w-full p-4 bg-stone-50 border-none rounded-2xl text-lg font-bold text-stone-800 focus:ring-2 focus:ring-pastel-blue outline-none"
            />
          </div>
        </div>

        {result && (
          <div className="bg-stone-900 text-stone-50 rounded-[32px] p-8 shadow-2xl shadow-stone-300 mt-8 animate-in slide-in-from-bottom duration-500">
            <div className="flex items-center space-x-2 mb-6 text-stone-400">
                <Calculator size={18} />
                <span className="text-xs font-bold uppercase tracking-widest">Result</span>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
                <div>
                    <p className="text-4xl font-extrabold text-white">{result.units}</p>
                    <p className="text-xs text-stone-400 font-bold uppercase mt-2">Units (IU)</p>
                </div>
                <div className="border-l border-stone-700 pl-8">
                    <p className="text-4xl font-extrabold text-white">{result.doseMl}</p>
                    <p className="text-xs text-stone-400 font-bold uppercase mt-2">Milliliters</p>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-stone-800 text-xs text-stone-500 flex justify-between">
                <span>Concentration</span>
                <span className="text-stone-300 font-bold">{result.concentration} mcg/ml</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};