import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCompounds, getInjections } from '../services/storage';
import { Compound, InjectionLog } from '../types';
import { Plus, ChevronRight, Archive, Syringe, History, Clock, Sparkles, Droplet, Grid3X3, Camera } from 'lucide-react';

export const Compounds: React.FC = () => {
  const [view, setView] = useState<'protocols' | 'history'>('protocols');
  const [compounds, setCompounds] = useState<Compound[]>([]);
  const [logs, setLogs] = useState<InjectionLog[]>([]);

  useEffect(() => {
    setCompounds(getCompounds());
    setLogs(getInjections().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  }, []);

  const active = compounds.filter(c => !c.isArchived);
  const archived = compounds.filter(c => c.isArchived);

  // Grouping logic for Active Protocols
  const groupedProtocols = {
      peptide: active.filter(c => c.category === 'peptide'),
      relaxant: active.filter(c => c.category === 'relaxant'),
      booster: active.filter(c => c.category === 'booster'),
      microneedling: active.filter(c => c.category === 'microneedling'),
  };

  const hasAnyActive = active.length > 0;

  // Helper to group logs by date
  const groupedLogs = logs.reduce((groups, log) => {
    const date = new Date(log.timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(log);
    return groups;
  }, {} as Record<string, InjectionLog[]>);

  const getRelativeLabel = (dateStr: string) => {
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    if (dateStr === today) return 'Today';
    if (dateStr === yesterday) return 'Yesterday';
    return dateStr;
  };

  const getCompoundDetails = (id: string) => compounds.find(c => c.id === id);

  const getCategoryIcon = (category?: string) => {
      switch(category) {
          case 'relaxant': return <Sparkles size={20} strokeWidth={2.5} />;
          case 'booster': return <Droplet size={20} strokeWidth={2.5} />;
          case 'microneedling': return <Grid3X3 size={20} strokeWidth={2.5} />;
          default: return <Syringe size={20} strokeWidth={2.5} />;
      }
  };

  const getCategoryLabel = (c: Compound) => {
      if (c.category === 'relaxant') return 'Relaxant';
      if (c.category === 'booster') return c.subCategory || 'Booster';
      if (c.category === 'microneedling') return 'Micro Needling';
      return 'Peptide';
  };

  const renderProtocolCard = (c: Compound) => (
    <Link key={c.id} to={`/compounds/edit/${c.id}`} className="block bg-white dark:bg-stone-900 rounded-[24px] p-5 shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-stone-50 dark:border-stone-800 active:scale-[0.98] transition-all relative overflow-hidden group mb-3">
        <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-2xl ${c.color} flex items-center justify-center text-white shadow-sm`}>
                    {getCategoryIcon(c.category)}
                </div>
                <div>
                    <p className="font-bold text-lg text-stone-900 dark:text-stone-100">{c.name}</p>
                    <div className="flex items-center space-x-2 mt-0.5 flex-wrap gap-y-1">
                        {c.category !== 'microneedling' && (
                            <span className="text-xs font-bold text-stone-400 bg-stone-50 dark:bg-stone-800 px-2 py-0.5 rounded-lg border border-stone-100 dark:border-stone-700">{c.doseAmount} {c.doseUnit}</span>
                        )}
                        <span className="text-xs text-stone-400 font-medium capitalize">{getCategoryLabel(c)}</span>
                        {c.targetArea && c.targetArea.length > 0 && (
                            <>
                                <span className="text-xs text-stone-300 dark:text-stone-600">•</span>
                                <span className="text-xs text-stone-400 font-medium">{c.targetArea[0]}{c.targetArea.length > 1 ? '+' : ''}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-stone-50 dark:bg-stone-800 flex items-center justify-center text-stone-300 dark:text-stone-500 group-hover:bg-stone-100 dark:group-hover:bg-stone-700 transition-colors">
                <ChevronRight size={18} />
            </div>
        </div>
        {/* Soft gradient background decoration */}
        <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-10 ${c.color}`} />
    </Link>
  );

  return (
    <div className="pt-2 space-y-6 pb-20">
      <div className="flex justify-between items-center px-1">
        <div>
            <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Your Protocols</h1>
            <p className="text-sm text-stone-400 font-medium">Manage your stack</p>
        </div>
        {view === 'protocols' && (
            <Link 
                to="/compounds/new" 
                className="bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-stone-900/20 dark:shadow-stone-100/10 active:scale-95 transition-transform"
            >
            <Plus size={24} strokeWidth={2.5} />
            </Link>
        )}
      </div>

      {/* View Toggle */}
      <div className="bg-white dark:bg-stone-900 p-1.5 rounded-2xl flex shadow-sm border border-stone-50 dark:border-stone-800">
        <button 
            onClick={() => setView('protocols')}
            className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-2 ${view === 'protocols' ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-md' : 'text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'}`}
        >
            <Syringe size={16} />
            <span>Protocols</span>
        </button>
        <button 
            onClick={() => setView('history')}
            className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-2 ${view === 'history' ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-md' : 'text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'}`}
        >
            <History size={16} />
            <span>Log History</span>
        </button>
      </div>

      {view === 'protocols' ? (
          /* PROTOCOLS VIEW */
          <div className="space-y-6 animate-in slide-in-from-left duration-300">
            {!hasAnyActive && (
                <div className="p-8 bg-white dark:bg-stone-900 rounded-[32px] border border-stone-50 dark:border-stone-800 text-center shadow-sm">
                    <div className="w-16 h-16 bg-stone-50 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-300 dark:text-stone-600">
                        <Syringe size={32} />
                    </div>
                    <h3 className="font-bold text-stone-900 dark:text-stone-100">No Active Protocols</h3>
                    <p className="text-stone-400 dark:text-stone-500 text-sm mt-1 mb-4">Add a compound to get started.</p>
                </div>
            )}
            
            {/* Peptides Section */}
            {groupedProtocols.peptide.length > 0 && (
                <div>
                    <h3 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest px-2 mb-3 flex items-center">
                        <Syringe size={12} className="mr-2" /> Peptides
                    </h3>
                    {groupedProtocols.peptide.map(renderProtocolCard)}
                </div>
            )}

            {/* Relaxants Section */}
            {groupedProtocols.relaxant.length > 0 && (
                <div className="relative">
                    {/* Divider if previous section existed */}
                    {groupedProtocols.peptide.length > 0 && <div className="h-px bg-stone-100 dark:bg-stone-800 w-full mb-6" />}
                    
                    <h3 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest px-2 mb-3 flex items-center">
                        <Sparkles size={12} className="mr-2" /> Relaxants
                    </h3>
                    {groupedProtocols.relaxant.map(renderProtocolCard)}
                </div>
            )}

            {/* Boosters Section */}
            {groupedProtocols.booster.length > 0 && (
                <div className="relative">
                    {(groupedProtocols.peptide.length > 0 || groupedProtocols.relaxant.length > 0) && <div className="h-px bg-stone-100 dark:bg-stone-800 w-full mb-6" />}
                    
                    <h3 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest px-2 mb-3 flex items-center">
                        <Droplet size={12} className="mr-2" /> Skin Boosters
                    </h3>
                    {groupedProtocols.booster.map(renderProtocolCard)}
                </div>
            )}

            {/* Micro Needling Section */}
            {groupedProtocols.microneedling.length > 0 && (
                <div className="relative">
                    {(groupedProtocols.peptide.length > 0 || groupedProtocols.relaxant.length > 0 || groupedProtocols.booster.length > 0) && <div className="h-px bg-stone-100 dark:bg-stone-800 w-full mb-6" />}
                    
                    <h3 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest px-2 mb-3 flex items-center">
                        <Grid3X3 size={12} className="mr-2" /> Micro Needling
                    </h3>
                    {groupedProtocols.microneedling.map(renderProtocolCard)}
                </div>
            )}

            {archived.length > 0 && (
                <div className="space-y-4 pt-6">
                <div className="h-px bg-stone-100 dark:bg-stone-800 w-full mb-6" />
                <h2 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest px-2 flex items-center">
                    <Archive size={12} className="mr-2" /> Archived
                </h2>
                {archived.map(c => (
                    <Link key={c.id} to={`/compounds/edit/${c.id}`} className="block bg-stone-100/50 dark:bg-stone-900/50 rounded-[24px] p-4 border border-transparent hover:border-stone-200 dark:hover:border-stone-800 transition-colors">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 opacity-60">
                        <div className="w-10 h-10 rounded-xl bg-stone-200 dark:bg-stone-800 flex items-center justify-center text-stone-400">
                            <Archive size={16} />
                        </div>
                        <p className="font-bold text-stone-600 dark:text-stone-400 line-through">{c.name}</p>
                        </div>
                        <ChevronRight size={16} className="text-stone-300" />
                    </div>
                    </Link>
                ))}
                </div>
            )}
          </div>
      ) : (
          /* HISTORY VIEW */
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
             {Object.keys(groupedLogs).length === 0 ? (
                 <div className="text-center py-12">
                     <div className="w-16 h-16 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-300">
                        <History size={32} />
                    </div>
                    <p className="text-stone-400 font-bold">No history available yet.</p>
                 </div>
             ) : (
                 Object.keys(groupedLogs).map((date, index) => (
                     <div key={index}>
                         <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest px-2 mb-3 sticky top-0 bg-[#F8F9FB] dark:bg-stone-950 py-2 z-10 transition-colors">
                             {getRelativeLabel(date)}
                         </h3>
                         <div className="space-y-3">
                             {groupedLogs[date].map(log => {
                                 const comp = getCompoundDetails(log.compoundId);
                                 return (
                                     <div key={log.id} className="bg-white dark:bg-stone-900 p-4 rounded-[24px] shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-stone-50 dark:border-stone-800 flex items-center justify-between">
                                         <div className="flex items-center space-x-4">
                                             <div className={`w-10 h-10 rounded-2xl ${comp?.color || 'bg-stone-300'} flex items-center justify-center text-white shadow-sm shrink-0`}>
                                                 {getCategoryIcon(comp?.category)}
                                             </div>
                                             <div>
                                                 <p className="font-bold text-stone-900 dark:text-stone-100 text-sm">{comp?.name || 'Unknown Protocol'}</p>
                                                 <div className="flex items-center space-x-2">
                                                     {comp?.category === 'microneedling' ? (
                                                         <span className="text-xs font-bold text-stone-500 dark:text-stone-400">
                                                             {log.needleDepth ? `${log.needleDepth}mm` : 'Protocol'}
                                                         </span>
                                                     ) : (
                                                         <span className="text-xs font-bold text-stone-500 dark:text-stone-400">{log.dose} {comp?.doseUnit}</span>
                                                     )}
                                                     
                                                     {log.site && (
                                                         <>
                                                            <span className="w-1 h-1 rounded-full bg-stone-300 dark:bg-stone-600" />
                                                            <span className="text-xs text-stone-400 truncate max-w-[100px]">{log.site}</span>
                                                         </>
                                                     )}
                                                 </div>
                                             </div>
                                         </div>
                                         <div className="text-right flex items-center space-x-2">
                                             {log.photo && (
                                                 <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400">
                                                     <Camera size={14} />
                                                 </div>
                                             )}
                                             <div className="flex items-center text-xs font-bold text-stone-300 dark:text-stone-500 bg-stone-50 dark:bg-stone-800 px-2 py-1 rounded-lg">
                                                 <Clock size={12} className="mr-1" />
                                                 {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                             </div>
                                         </div>
                                     </div>
                                 );
                             })}
                         </div>
                     </div>
                 ))
             )}
          </div>
      )}
    </div>
  );
};