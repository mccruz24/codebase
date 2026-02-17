import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getResearchEntryById } from '../services/researchData';
import { ResearchEntry } from '../types';
import { ChevronLeft, Info, FlaskConical, Scale, Book, ShieldAlert } from 'lucide-react';

export const ResearchDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<ResearchEntry | null>(null);

  useEffect(() => {
    if (id) {
      const data = getResearchEntryById(id);
      if (data) {
        setEntry(data);
      } else {
        navigate('/research');
      }
    }
  }, [id, navigate]);

  if (!entry) return null;

  return (
    <div className="pt-2 pb-20 min-h-screen">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-6 px-1 py-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-stone-500 rounded-full hover:bg-stone-100"
        >
          <ChevronLeft size={24} />
        </button>
        <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">
          Research Reference
        </span>
        <div className="w-8" />
      </div>

      {/* Header */}
      <div className="mb-8 px-2">
        <span className="inline-block bg-pastel-blue/30 text-stone-600 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider mb-3">
          {entry.category}
        </span>
        <h1 className="text-3xl font-extrabold text-stone-900 mb-2">{entry.name}</h1>
        <p className="text-sm font-medium text-stone-500 leading-relaxed border-l-2 border-stone-200 pl-4">
          {entry.classification}
        </p>
      </div>

      <div className="space-y-6">
        {/* Overview */}
        <section className="bg-white p-6 rounded-[32px] shadow-sm border border-stone-50">
          <div className="flex items-center space-x-2 mb-4">
            <Info size={18} className="text-stone-400" />
            <h2 className="text-xs font-bold text-stone-900 uppercase tracking-widest">Overview</h2>
          </div>
          <p className="text-sm text-stone-600 leading-relaxed">{entry.overview}</p>
        </section>

        {/* Research Context */}
        <section className="bg-white p-6 rounded-[32px] shadow-sm border border-stone-50">
          <div className="flex items-center space-x-2 mb-4">
            <FlaskConical size={18} className="text-stone-400" />
            <h2 className="text-xs font-bold text-stone-900 uppercase tracking-widest">
              Research Context
            </h2>
          </div>
          <p className="text-sm text-stone-500 mb-4 italic">
            In research settings, this compound has been investigated in models involving:
          </p>
          <ul className="space-y-3">
            {entry.researchContext.map((item, idx) => (
              <li key={idx} className="flex items-start text-sm text-stone-700">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-300 mt-1.5 mr-3 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Mechanism */}
        <section className="bg-white p-6 rounded-[32px] shadow-sm border border-stone-50">
          <h2 className="text-xs font-bold text-stone-900 uppercase tracking-widest mb-4">
            Mechanism of Interest
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed">{entry.mechanism}</p>
        </section>

        {/* Limitations - Warning Style */}
        <section className="bg-stone-50 p-6 rounded-[32px] border border-stone-100">
          <div className="flex items-center space-x-2 mb-4">
            <ShieldAlert size={18} className="text-stone-400" />
            <h2 className="text-xs font-bold text-stone-900 uppercase tracking-widest">
              Research Limitations
            </h2>
          </div>
          <p className="text-sm text-stone-600 leading-relaxed">{entry.limitations}</p>
        </section>

        {/* Regulatory */}
        <section className="bg-white p-6 rounded-[32px] shadow-sm border border-stone-50">
          <div className="flex items-center space-x-2 mb-4">
            <Scale size={18} className="text-stone-400" />
            <h2 className="text-xs font-bold text-stone-900 uppercase tracking-widest">
              Regulatory Status
            </h2>
          </div>
          <p className="text-sm text-stone-600 leading-relaxed">{entry.regulatoryStatus}</p>
        </section>

        {/* References */}
        <section className="px-4">
          <div className="flex items-center space-x-2 mb-4 opacity-60">
            <Book size={16} className="text-stone-400" />
            <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest">
              Selected References
            </h2>
          </div>
          <ul className="space-y-4">
            {entry.references.map((ref, idx) => (
              <li
                key={idx}
                className="text-[11px] text-stone-400 leading-relaxed font-medium bg-white p-3 rounded-xl border border-stone-50"
              >
                {ref}
              </li>
            ))}
          </ul>
        </section>

        {/* Footer Disclaimer */}
        <div className="mt-8 px-6 text-center border-t border-stone-100 pt-8">
          <p className="text-[10px] text-stone-400 leading-relaxed">
            This content is provided for educational reference only. The app does not provide
            medical advice or dosing guidance.
          </p>
        </div>
      </div>
    </div>
  );
};
