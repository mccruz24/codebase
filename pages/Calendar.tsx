import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCompounds, getInjections, getCheckIns } from '../services/storage';
import { getScheduledCompounds, getLogsOnDate } from '../services/scheduler';
import { Compound, InjectionLog, AestheticCheckIn } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayDetailsModal } from '../components/DayDetailsModal';

export const Calendar: React.FC = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [compounds, setCompounds] = useState<Compound[]>([]);
  const [injections, setInjections] = useState<InjectionLog[]>([]);
  const [checkIns, setCheckIns] = useState<AestheticCheckIn[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    setCompounds(getCompounds());
    setInjections(getInjections());
    setCheckIns(getCheckIns());
  }, []);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

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

  const renderDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    // Empty slots for previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-16 sm:h-20" />);
    }

    // Days
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const scheduled = getScheduledCompounds(compounds, date);
      const logs = getLogsOnDate(injections, date);
      const checkIn = getCheckInForDate(date);
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <div
          key={d}
          onClick={() => setSelectedDate(date)}
          className={`h-16 sm:h-20 border-t border-stone-50 flex flex-col items-center justify-start pt-3 cursor-pointer transition-all hover:bg-stone-50 relative group`}
        >
          <span
            className={`text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full transition-all ${isToday ? 'bg-stone-900 text-white shadow-lg' : 'text-stone-700 group-hover:scale-110'}`}
          >
            {d}
          </span>
          <div className="flex space-x-1 mt-2">
            {logs.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-stone-800" />}
            {scheduled.length > 0 && logs.length === 0 && (
              <div className="w-1.5 h-1.5 rounded-full bg-pastel-blue" />
            )}
            {checkIn && logs.length === 0 && scheduled.length === 0 && (
              <div className="w-1.5 h-1.5 rounded-full bg-pastel-green" />
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="pt-6 pb-20 min-h-screen bg-white">
      {selectedDate && (
        <DayDetailsModal
          date={selectedDate}
          onClose={() => setSelectedDate(null)}
          logs={getLogsOnDate(injections, selectedDate)}
          scheduled={getScheduledCompounds(compounds, selectedDate)}
          allCompounds={compounds}
          checkIn={getCheckInForDate(selectedDate)}
        />
      )}

      <div className="flex items-center justify-between mb-6 px-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-stone-500 rounded-full hover:bg-stone-100"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-stone-900">Calendar</h1>
        <div className="w-8" />
      </div>

      <div className="px-4 mb-8">
        <div className="flex items-center justify-between bg-[#F8F9FB] p-2 rounded-[24px]">
          <button
            onClick={prevMonth}
            className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-stone-400 hover:text-stone-900"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-lg font-bold text-stone-900">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <button
            onClick={nextMonth}
            className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-stone-400 hover:text-stone-900"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-0 text-center mb-2 px-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
          <div key={day} className="text-xs font-bold text-stone-300 uppercase">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0 px-2">{renderDays()}</div>

      <div className="mt-8 px-8 space-y-3">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-stone-900 mr-3" />
          <span className="text-sm font-medium text-stone-600">Completed Dose</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-pastel-blue mr-3" />
          <span className="text-sm font-medium text-stone-600">Scheduled</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-pastel-green mr-3" />
          <span className="text-sm font-medium text-stone-600">Check-in Only</span>
        </div>
      </div>
    </div>
  );
};
