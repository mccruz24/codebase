import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getResearchEntries } from '../services/researchData';
import { ResearchEntry } from '../types';
import { Search, BookOpen, ChevronRight, ShieldAlert, GraduationCap } from 'lucide-react';

const CATEGORIES = ['All', 'Reparative', 'Metabolic', 'Cosmetic', 'Cognitive'];

export const Research: React.FC = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<ResearchEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<ResearchEntry[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false);

  useEffect(() => {
    setEntries(getResearchEntries());
    // Check session/local storage for disclaimer acceptance specifically for Research Vault
    const accepted = sessionStorage.getItem('al_research_disclaimer_accepted');
    if (accepted) {
      setHasAcceptedDisclaimer(true);
    }
  }, []);

  useEffect(() => {
    let result = entries;

    if (category !== 'All') {
      result = result.filter((e) => e.category === category);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) => e.name.toLowerCase().includes(q) || e.classification.toLowerCase().includes(q)
      );
    }

    setFilteredEntries(result);
  }, [entries, search, category]);

  const acceptDisclaimer = () => {
    sessionStorage.setItem('al_research_disclaimer_accepted', 'true');
    setHasAcceptedDisclaimer(true);
  };

  if (!hasAcceptedDisclaimer) {
    return (
      <div className="fixed inset-0 z-50 bg-[#F8F9FB] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-[40px] shadow-xl border border-stone-50 max-w-md w-full animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-700">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-2xl font-bold text-stone-900 mb-2">Research Vault</h1>
          <p className="text-sm text-stone-400 font-bold uppercase tracking-widest mb-6">
            Educational Reference Only
          </p>

          <div className="bg-stone-50 rounded-3xl p-6 text-left space-y-4 mb-8 border border-stone-100">
            <div className="flex items-start text-stone-600 text-sm leading-relaxed">
              <ShieldAlert size={18} className="mr-3 mt-1 shrink-0 text-stone-400" />
              <p>
                This section provides summaries of publicly available scientific literature for
                educational and research reference purposes only.
              </p>
            </div>
            <div className="flex items-start text-stone-600 text-sm leading-relaxed">
              <ShieldAlert size={18} className="mr-3 mt-1 shrink-0 text-stone-400" />
              <p>
                The information presented does not constitute medical advice, diagnosis, or
                treatment recommendations.
              </p>
            </div>
            <div className="flex items-start text-stone-600 text-sm leading-relaxed">
              <ShieldAlert size={18} className="mr-3 mt-1 shrink-0 text-stone-400" />
              <p>
                This app does not provide dosing guidance, protocol recommendations, or clinical
                interpretation.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={acceptDisclaimer}
              className="w-full bg-stone-900 text-white py-4 rounded-[24px] font-bold shadow-lg shadow-stone-200 active:scale-[0.98] transition-all"
            >
              Enter Research Section
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-transparent text-stone-400 py-3 font-bold text-sm hover:text-stone-600"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-2 space-y-6 pb-20">
      <div className="px-1 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Research Vault</h1>
          <p className="text-sm text-stone-400 font-medium">Educational Reference</p>
        </div>
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-stone-50 text-stone-300">
          <BookOpen size={20} />
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-2 rounded-[24px] shadow-sm border border-stone-50 flex items-center">
        <div className="w-10 h-10 flex items-center justify-center text-stone-300">
          <Search size={20} />
        </div>
        <input
          type="text"
          placeholder="Search compounds..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 h-full bg-transparent outline-none font-medium text-stone-700 placeholder-stone-300"
        />
      </div>

      {/* Categories */}
      <div className="overflow-x-auto no-scrollbar pb-2 -mx-6 px-6">
        <div className="flex space-x-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                category === cat
                  ? 'bg-stone-900 text-white shadow-lg shadow-stone-900/20'
                  : 'bg-white text-stone-500 border border-stone-100 hover:border-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredEntries.map((entry) => (
          <Link
            key={entry.id}
            to={`/research/${entry.id}`}
            className="block bg-white rounded-[28px] p-6 shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-stone-50 active:scale-[0.98] transition-all group"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="bg-stone-50 text-stone-400 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                {entry.category}
              </span>
              <ChevronRight
                size={18}
                className="text-stone-300 group-hover:text-stone-900 transition-colors"
              />
            </div>
            <h3 className="text-xl font-bold text-stone-900 mb-1">{entry.name}</h3>
            <p className="text-sm text-stone-400 font-medium line-clamp-2">
              {entry.classification}
            </p>
          </Link>
        ))}

        {filteredEntries.length === 0 && (
          <div className="text-center py-10 opacity-50">
            <p className="text-stone-400 font-bold">No entries found.</p>
          </div>
        )}
      </div>

      {/* Footer Disclaimer */}
      <div className="mt-8 px-4 text-center">
        <p className="text-[10px] text-stone-400 leading-relaxed max-w-xs mx-auto">
          This content is provided for educational reference only. The app does not provide medical
          advice, dosing guidance, or protocol recommendations.
        </p>
      </div>
    </div>
  );
};
