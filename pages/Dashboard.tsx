import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCompounds, getInjections, getCheckIns } from '../services/storage';
import { getScheduledCompounds, getLogsOnDate, getNextScheduledDose } from '../services/scheduler';
import { Compound, InjectionLog, AestheticCheckIn } from '../types';
import {
  Activity,
  Check,
  ChevronRight,
  Scale,
  Syringe,
  Calendar as CalendarIcon,
  ArrowRight,
  Bell,
  Search,
} from 'lucide-react';
import { DayDetailsModal } from '../components/DayDetailsModal';

interface ScheduledItem {
  compound: Compound;
  isCompleted: boolean;
  logId?: string;
  dose?: number;
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [scheduledToday, setScheduledToday] = useState<ScheduledItem[]>([]);
  const [progress, setProgress] = useState(0);
  const [weekView, setWeekView] = useState<
    {
      day: string;
      date: number;
      fullDate: Date;
      hasLog: boolean;
      hasSchedule: boolean;
      isToday: boolean;
    }[]
  >([]);
  const [compounds, setCompounds] = useState<Compound[]>([]);
  const [injections, setInjections] = useState<InjectionLog[]>([]);
  const [checkIns, setCheckIns] = useState<AestheticCheckIn[]>([]);
  const [selectedDayDetails, setSelectedDayDetails] = useState<Date | null>(null);
  const [nextScheduled, setNextScheduled] = useState<{ date: Date; compound: Compound } | null>(
    null
  );

  useEffect(() => {
    const allCompounds = getCompounds().filter((c) => !c.isArchived);
    const allInjections = getInjections();
    const allCheckIns = getCheckIns();

    setCompounds(allCompounds);
    setInjections(allInjections);
    setCheckIns(allCheckIns);

    const now = new Date();

    // 1. Identify Today's Schedule
    const todayItems: ScheduledItem[] = [];
    const scheduledTodayList = getScheduledCompounds(allCompounds, now);
    const logsToday = getLogsOnDate(allInjections, now);

    scheduledTodayList.forEach((c) => {
      const completedLog = logsToday.find((l) => l.compoundId === c.id);
      todayItems.push({
        compound: c,
        isCompleted: !!completedLog,
        logId: completedLog?.id,
        dose: completedLog?.dose || c.doseAmount,
      });
    });

    setScheduledToday(todayItems);
    setProgress(
      todayItems.length > 0
        ? Math.round((todayItems.filter((i) => i.isCompleted).length / todayItems.length) * 100)
        : 0
    );

    if (todayItems.length === 0) {
      setNextScheduled(getNextScheduledDose(allCompounds, now, allInjections));
    }

    // 2. 7-Day View
    const week = [];
    const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    for (let i = -3; i <= 3; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);

      const hasLog = getLogsOnDate(allInjections, d).length > 0;
      const hasSchedule = getScheduledCompounds(allCompounds, d).length > 0;

      week.push({
        day: WEEKDAYS[d.getDay()],
        date: d.getDate(),
        fullDate: new Date(d),
        hasLog,
        hasSchedule,
        isToday: i === 0,
      });
    }
    setWeekView(week);
  }, []);

  const getCheckInForDate = (date: Date) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return checkIns.find((c) => {
      const d = new Date(c.date);
      return d >= start && d <= end;
    });
  };

  const currentWeight = checkIns.length > 0 ? checkIns[0].weight : null;
  const weightChange =
    checkIns.length > 1 && checkIns[0].weight && checkIns[1].weight
      ? (checkIns[0].weight - checkIns[1].weight).toFixed(1)
      : null;

  return (
    <div className="space-y-6">
      {/* Detail Modal */}
      {selectedDayDetails && (
        <DayDetailsModal
          date={selectedDayDetails}
          onClose={() => setSelectedDayDetails(null)}
          logs={getLogsOnDate(injections, selectedDayDetails)}
          scheduled={getScheduledCompounds(compounds, selectedDayDetails)}
          allCompounds={compounds}
          checkIn={getCheckInForDate(selectedDayDetails)}
        />
      )}

      {/* Header */}
      <header className="flex justify-between items-center py-2">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-pastel-yellow border-2 border-white dark:border-stone-800 shadow-sm flex items-center justify-center overflow-hidden">
            <span className="text-stone-800 font-bold text-sm">ME</span>
          </div>
          <div>
            <p className="text-xs text-stone-400 dark:text-stone-500 font-medium">Good Morning,</p>
            <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">Champion!</h1>
          </div>
        </div>
        <div className="flex space-x-2">
          <button className="w-10 h-10 rounded-full bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 flex items-center justify-center text-stone-400 dark:text-stone-500">
            <Search size={18} />
          </button>
          <button className="w-10 h-10 rounded-full bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 flex items-center justify-center text-stone-400 dark:text-stone-500 relative">
            <Bell size={18} />
            <div className="absolute top-2 right-2 w-2 h-2 bg-red-400 rounded-full border border-white dark:border-stone-900" />
          </button>
        </div>
      </header>

      {/* Hero Card */}
      <section className="relative overflow-hidden bg-pastel-blue rounded-[28px] p-5 shadow-sm">
        <div className="relative z-10">
          <div className="flex justify-between items-end mb-3">
            <div>
              <div className="flex items-center space-x-2 text-stone-600 mb-1">
                <Activity size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Your Progress</span>
              </div>
              <h2 className="text-4xl font-extrabold text-stone-900 leading-tight">{progress}%</h2>
            </div>
            <p className="text-stone-500 text-xs font-bold mb-1.5 bg-white/40 px-2 py-1 rounded-lg">
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="w-full h-4 bg-white/40 rounded-full overflow-hidden backdrop-blur-sm">
            <div
              className="h-full bg-stone-900 rounded-full transition-all duration-1000 ease-out shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-2xl" />
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/10 rounded-full blur-xl" />
      </section>

      {/* Calendar Strip */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100">Week Days</h3>
          <button
            onClick={() => navigate('/calendar')}
            className="p-2 bg-white dark:bg-stone-900 rounded-xl shadow-sm border border-stone-100 dark:border-stone-800"
          >
            <CalendarIcon size={18} className="text-stone-400 dark:text-stone-500" />
          </button>
        </div>

        <div className="flex justify-between space-x-2 overflow-x-auto no-scrollbar pb-2">
          {weekView.map((d, i) => (
            <button
              key={i}
              onClick={() => setSelectedDayDetails(d.fullDate)}
              className={`flex flex-col items-center justify-between p-2 rounded-3xl min-w-[52px] h-28 transition-all duration-300 ${
                d.isToday
                  ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-lg shadow-stone-900/20 scale-105'
                  : 'bg-white dark:bg-stone-900 text-stone-400 dark:text-stone-500 border border-transparent hover:border-stone-100 dark:hover:border-stone-800'
              }`}
            >
              <span className="text-xs font-medium mt-2">{d.day}</span>

              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${d.isToday ? 'bg-stone-800 dark:bg-stone-200' : 'bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-300'}`}
              >
                {d.date}
              </div>

              <div className="mb-2">
                {d.hasLog && (
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${d.isToday ? 'bg-white dark:bg-stone-900' : 'bg-stone-900 dark:bg-stone-300'}`}
                  />
                )}
                {!d.hasLog && d.hasSchedule && (
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${d.isToday ? 'bg-stone-700 dark:bg-stone-300' : 'bg-stone-300 dark:bg-stone-700'}`}
                  />
                )}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 gap-4">
        {/* Weight Card */}
        <div
          onClick={() => navigate('/check-in')}
          className="bg-white dark:bg-stone-900 p-5 rounded-[28px] shadow-sm border border-stone-50 dark:border-stone-800 relative overflow-hidden active:scale-[0.98] transition-transform"
        >
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wide">
              Weight
            </span>
            <div className="w-8 h-8 rounded-full bg-pastel-green flex items-center justify-center text-stone-700">
              <Scale size={14} />
            </div>
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
              {currentWeight || '--'}{' '}
              <span className="text-sm font-medium text-stone-400 dark:text-stone-500">lbs</span>
            </h3>
            {weightChange && (
              <div className="flex items-center mt-1 text-xs font-bold text-stone-500 dark:text-stone-400">
                <span className="bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded-md">
                  {Number(weightChange) <= 0 ? '' : '+'}
                  {weightChange}
                </span>
                <span className="ml-1 text-[10px] text-stone-400 dark:text-stone-600 font-medium">
                  Since last
                </span>
              </div>
            )}
          </div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-pastel-green/40 to-transparent rounded-tl-[40px]" />
        </div>

        {/* Up Next Card */}
        <div className="bg-white dark:bg-stone-900 p-5 rounded-[28px] shadow-sm border border-stone-50 dark:border-stone-800 relative overflow-hidden active:scale-[0.98] transition-transform">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wide">
              Up Next
            </span>
            <div className="w-8 h-8 rounded-full bg-pastel-yellow flex items-center justify-center text-stone-700">
              <Syringe size={14} />
            </div>
          </div>
          <div className="relative z-10">
            {scheduledToday.length > 0 && !scheduledToday.every((i) => i.isCompleted) ? (
              <>
                <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 truncate">
                  {scheduledToday.find((i) => !i.isCompleted)?.compound.name}
                </h3>
                <p className="text-xs font-bold text-stone-500 dark:text-stone-400 mt-1">
                  Due Today
                </p>
              </>
            ) : nextScheduled ? (
              <>
                <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 truncate">
                  {nextScheduled.compound.name}
                </h3>
                <p className="text-xs font-bold text-stone-500 dark:text-stone-400 mt-1">
                  {nextScheduled.date.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </>
            ) : (
              <h3 className="text-lg font-bold text-stone-400 dark:text-stone-600">Rest Day</h3>
            )}
          </div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-pastel-yellow/50 to-transparent rounded-tl-[40px]" />
        </div>
      </section>

      {/* Scheduled / List */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100">Today's Protocol</h3>
          <Link
            to="/log-injection"
            className="w-8 h-8 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700"
          >
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="space-y-3">
          {scheduledToday.length === 0 ? (
            <div className="p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-50 dark:border-stone-800 text-center">
              <p className="text-stone-400 dark:text-stone-500 text-sm font-medium">
                Rest & Recovery
              </p>
            </div>
          ) : (
            scheduledToday.map((item) => (
              <div
                key={item.compound.id}
                onClick={() =>
                  !item.isCompleted && navigate(`/log-injection?compoundId=${item.compound.id}`)
                }
                className={`p-4 rounded-[24px] flex items-center justify-between transition-all ${
                  item.isCompleted
                    ? 'bg-surface-subtle dark:bg-stone-900/50 opacity-60'
                    : 'bg-white dark:bg-stone-900 shadow-sm border border-stone-50 dark:border-stone-800 active:scale-[0.98]'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-12 h-12 rounded-[18px] flex items-center justify-center ${item.isCompleted ? 'bg-stone-200 dark:bg-stone-800 text-stone-500' : `${item.compound.color.replace('bg-', 'bg-').replace('500', '100')} ${item.compound.color.replace('bg-', 'text-').replace('500', '600')}`}`}
                  >
                    {item.isCompleted ? <Check size={20} /> : <Syringe size={20} />}
                  </div>
                  <div>
                    <p
                      className={`font-bold ${item.isCompleted ? 'text-stone-400 line-through' : 'text-stone-900 dark:text-stone-100'}`}
                    >
                      {item.compound.name}
                    </p>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="text-xs font-bold text-stone-400">
                        {item.dose} {item.compound.doseUnit}
                      </span>
                      {!item.isCompleted && (
                        <span className="w-1 h-1 rounded-full bg-stone-300 dark:bg-stone-600" />
                      )}
                      {!item.isCompleted && (
                        <span className="text-xs text-stone-400">{item.compound.route}</span>
                      )}
                    </div>
                  </div>
                </div>
                {!item.isCompleted && (
                  <div className="w-8 h-8 rounded-full bg-stone-50 dark:bg-stone-800 flex items-center justify-center text-stone-300 dark:text-stone-500">
                    <ChevronRight size={16} />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};
