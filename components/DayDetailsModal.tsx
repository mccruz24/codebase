import React from 'react';
import { X, Check, Syringe, Camera } from 'lucide-react';
import { Compound, InjectionLog, AestheticCheckIn } from '../types';

interface DayDetailsModalProps {
  date: Date;
  onClose: () => void;
  logs: InjectionLog[];
  scheduled: Compound[];
  allCompounds: Compound[];
  checkIn?: AestheticCheckIn;
}

export const DayDetailsModal: React.FC<DayDetailsModalProps> = ({
  date,
  onClose,
  logs,
  scheduled,
  allCompounds,
  checkIn,
}) => {
  const getCompoundName = (id: string) =>
    allCompounds.find((c) => c.id === id)?.name || 'Unknown Compound';
  const getCompoundColor = (id: string) =>
    allCompounds.find((c) => c.id === id)?.color || 'bg-stone-400';
  const getCompoundCategory = (id: string) => allCompounds.find((c) => c.id === id)?.category;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-stone-900/20 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className="bg-white dark:bg-stone-900 w-full max-w-md p-8 rounded-t-[40px] sm:rounded-[40px] shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
              {date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </h2>
            <p className="text-stone-400 text-sm font-medium">Daily Summary</p>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-stone-50 dark:bg-stone-800 rounded-full text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700 hover:text-stone-900 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-8 pb-4">
          {/* Logs Section */}
          <div>
            <h3 className="text-xs font-bold text-stone-300 uppercase tracking-widest mb-4 ml-1">
              Logged Activity
            </h3>
            {logs.length === 0 ? (
              <div className="p-6 bg-stone-50/50 dark:bg-stone-800/50 rounded-3xl border border-stone-100 dark:border-stone-800 border-dashed text-center">
                <p className="text-sm text-stone-400 font-medium">No activity logged.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log, idx) => {
                  const cat = getCompoundCategory(log.compoundId);
                  return (
                    <div
                      key={idx}
                      className="flex flex-col p-4 bg-stone-50 dark:bg-stone-800 rounded-3xl border border-transparent"
                    >
                      <div className="flex items-center mb-2">
                        <div
                          className={`w-10 h-10 rounded-2xl ${getCompoundColor(log.compoundId)} text-white flex items-center justify-center mr-4 shadow-sm`}
                        >
                          <Check size={16} strokeWidth={3} />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                            {getCompoundName(log.compoundId)}
                          </p>

                          {cat === 'microneedling' ? (
                            <div className="flex items-center space-x-2 text-xs text-stone-400">
                              {log.needleDepth && <span>{log.needleDepth}mm</span>}
                              {log.glideSerum && <span>• {log.glideSerum}</span>}
                            </div>
                          ) : (
                            <p className="text-xs font-semibold text-stone-400">
                              {log.dose}{' '}
                              {allCompounds.find((c) => c.id === log.compoundId)?.doseUnit}
                            </p>
                          )}
                        </div>
                        <span className="ml-auto text-xs text-stone-400 font-bold bg-white dark:bg-stone-700 px-2 py-1 rounded-lg">
                          {new Date(log.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {/* Photo */}
                      {log.photo && (
                        <div className="mt-2 relative rounded-2xl overflow-hidden h-40 border border-stone-200 dark:border-stone-700">
                          <img src={log.photo} alt="Log" className="w-full h-full object-cover" />
                          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center backdrop-blur-sm">
                            <Camera size={12} className="mr-1" /> Before
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Scheduled Section */}
          <div>
            <h3 className="text-xs font-bold text-stone-300 uppercase tracking-widest mb-4 ml-1">
              Scheduled
            </h3>
            {scheduled.length === 0 ? (
              <div className="p-6 bg-stone-50/50 dark:bg-stone-800/50 rounded-3xl border border-stone-100 dark:border-stone-800 border-dashed text-center">
                <p className="text-sm text-stone-400 font-medium">Nothing scheduled.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {scheduled.map((c) => {
                  const isDone = logs.some((l) => l.compoundId === c.id);
                  return (
                    <div
                      key={c.id}
                      className={`flex items-center p-4 border rounded-3xl ${isDone ? 'bg-stone-50 dark:bg-stone-800 border-stone-100 dark:border-stone-800 opacity-50' : 'bg-white dark:bg-stone-900 border-stone-100 dark:border-stone-800 shadow-sm'}`}
                    >
                      <div
                        className={`w-10 h-10 rounded-2xl ${c.color} flex items-center justify-center mr-4`}
                      >
                        <Syringe size={16} className="text-white/90" strokeWidth={2.5} />
                      </div>
                      <div>
                        <p
                          className={`font-bold text-sm ${isDone ? 'text-stone-500 line-through' : 'text-stone-900 dark:text-stone-100'}`}
                        >
                          {c.name}
                        </p>
                        {c.category !== 'microneedling' && (
                          <p className="text-xs text-stone-500 font-medium">
                            {c.doseAmount} {c.doseUnit}
                          </p>
                        )}
                      </div>
                      {isDone && (
                        <span className="ml-auto text-[10px] font-extrabold text-stone-300 uppercase tracking-wider">
                          Completed
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Observations Section */}
          <div>
            <h3 className="text-xs font-bold text-stone-300 uppercase tracking-widest mb-4 ml-1">
              Observations
            </h3>
            {!checkIn ? (
              <div className="p-6 bg-stone-50/50 dark:bg-stone-800/50 rounded-3xl border border-stone-100 dark:border-stone-800 border-dashed text-center">
                <p className="text-sm text-stone-400 font-medium">No metrics recorded.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-3xl p-6 shadow-sm">
                <div className="grid grid-cols-2 gap-y-6 gap-x-6">
                  {/* Weight */}
                  {checkIn.weight && (
                    <div className="col-span-2 flex justify-between items-center border-b border-stone-100 dark:border-stone-800 pb-4 mb-2">
                      <span className="text-sm font-bold text-stone-500 dark:text-stone-400">
                        Body Weight
                      </span>
                      <span className="text-2xl font-extrabold text-stone-900 dark:text-stone-100">
                        {checkIn.weight}{' '}
                        <span className="text-sm font-semibold text-stone-400">lbs</span>
                      </span>
                    </div>
                  )}

                  {/* Top Metrics */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wide">
                      Muscle Fullness
                    </p>
                    <div className="flex items-center">
                      <div className="flex-1 h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden mr-2">
                        <div
                          className="h-full bg-stone-800 dark:bg-stone-200 rounded-full"
                          style={{ width: `${(checkIn.metrics.muscleFullness / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-stone-900 dark:text-stone-100 font-bold text-sm">
                        {checkIn.metrics.muscleFullness}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wide">
                      Skin Clarity
                    </p>
                    <div className="flex items-center">
                      <div className="flex-1 h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden mr-2">
                        <div
                          className="h-full bg-stone-800 dark:bg-stone-200 rounded-full"
                          style={{ width: `${(checkIn.metrics.skinClarity / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-stone-900 dark:text-stone-100 font-bold text-sm">
                        {checkIn.metrics.skinClarity}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
