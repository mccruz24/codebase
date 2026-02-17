import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveCheckIn } from '../services/storage';
import { METRIC_LABELS } from '../types';
import { ChevronLeft, Save, Calendar, Info, X } from 'lucide-react';

const METRIC_DESCRIPTIONS: Record<string, string> = {
  muscleFullness: "How 'pumped', dense, or glycogen-filled your muscles feel throughout the day.",
  skinClarity:
    'The overall clearness of your skin, absence of acne, redness, or excessive oiliness.',
  skinTexture: 'The smoothness and evenness of your skin surface (bumps, roughness, etc).',
  facialFullness: "The amount of water retention or 'bloat' visible in your face.",
  jawlineDefinition:
    'Sharpness and visibility of your jawline, often an indicator of lower water retention.',
  inflammation: 'General feeling of systemic inflammation, joint stiffness, or water weight.',
  energy: 'Your sustained energy levels throughout the day without excessive fatigue.',
  sleepQuality: 'How restful and uninterrupted your sleep was last night.',
  libido: 'Your current level of sexual drive and desire.',
};

export const CheckIn: React.FC = () => {
  const navigate = useNavigate();
  const [weight, setWeight] = useState<string>('');

  const [ratings, setRatings] = useState({
    muscleFullness: 5,
    skinClarity: 5,
    skinTexture: 5,
    facialFullness: 5,
    inflammation: 5,
    jawlineDefinition: 5,
    energy: 5,
    sleepQuality: 5,
    libido: 5,
  });

  const [infoModal, setInfoModal] = useState<string | null>(null);

  const handleRatingChange = (key: keyof typeof ratings, value: number) => {
    setRatings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    saveCheckIn({
      date: new Date().toISOString(),
      weight: weight ? parseFloat(weight) : undefined,
      metrics: ratings,
    });
    navigate('/trends');
  };

  const SliderGroup = ({ keys }: { keys: (keyof typeof ratings)[] }) => (
    <div className="space-y-6">
      {keys.map((key) => (
        <div key={key} className="bg-stone-50 dark:bg-stone-800/50 rounded-[24px] p-5">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                {METRIC_LABELS[key as string]}
              </label>
              <button
                onClick={() => setInfoModal(key as string)}
                className="text-stone-300 hover:text-stone-500 dark:hover:text-stone-300 transition-colors"
              >
                <Info size={14} />
              </button>
            </div>
            <span className="text-sm font-bold text-white dark:text-stone-900 bg-stone-900 dark:bg-stone-100 w-8 h-8 rounded-full flex items-center justify-center shadow-lg shadow-stone-200 dark:shadow-stone-900/40">
              {ratings[key]}
            </span>
          </div>

          <div className="relative h-8 flex items-end">
            {/* Numbers on the bar */}
            <div className="absolute top-0 left-0 w-full flex justify-between px-1 pointer-events-none text-[9px] font-bold text-stone-400 dark:text-stone-500">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
              <span>6</span>
              <span>7</span>
              <span>8</span>
              <span>9</span>
              <span>10</span>
            </div>

            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={ratings[key]}
              onChange={(e) => handleRatingChange(key, parseInt(e.target.value))}
              className="w-full h-3 bg-stone-200 dark:bg-stone-700 rounded-full appearance-none cursor-pointer accent-stone-900 dark:accent-stone-100 hover:accent-stone-700 transition-all z-10"
            />
          </div>

          <div className="flex justify-between mt-2 text-[10px] text-stone-400 dark:text-stone-500 font-bold uppercase">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="pt-2 pb-20 min-h-screen relative">
      {/* Info Modal */}
      {infoModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setInfoModal(null)}
        >
          <div
            className="bg-white dark:bg-stone-900 p-6 rounded-[32px] max-w-xs w-full shadow-2xl animate-in zoom-in-95 duration-200 border border-stone-50 dark:border-stone-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wide text-sm">
                {METRIC_LABELS[infoModal]}
              </h3>
              <button
                onClick={() => setInfoModal(null)}
                className="p-1 bg-stone-100 dark:bg-stone-800 rounded-full text-stone-500 dark:text-stone-400"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
              {METRIC_DESCRIPTIONS[infoModal]}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-1">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-stone-500 dark:text-stone-400 rounded-full hover:bg-stone-100 dark:hover:bg-stone-900"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">
            Log Your Progress
          </h1>
          <p className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wide">
            Health Journey Tracker
          </p>
        </div>
        <div className="w-8" />
      </div>

      {/* Date Badge */}
      <div className="flex justify-center mb-8">
        <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 px-4 py-2 rounded-2xl shadow-sm flex items-center space-x-2">
          <Calendar size={16} className="text-stone-400 dark:text-stone-500" />
          <span className="text-sm font-bold text-stone-700 dark:text-stone-300">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>

      <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
        {/* Weight Section */}
        <div className="bg-white dark:bg-stone-900 p-8 rounded-[32px] shadow-sm border border-stone-50 dark:border-stone-800 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-pastel-green" />
          <label className="block text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-4">
            Current Body Weight
          </label>
          <div className="flex items-baseline justify-center space-x-2">
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="---"
              className="text-center text-6xl font-extrabold text-stone-900 dark:text-white bg-transparent border-b-2 border-stone-100 dark:border-stone-700 w-40 focus:outline-none focus:border-stone-900 dark:focus:border-stone-200 transition-colors pb-2"
            />
            <span className="text-lg font-bold text-stone-400 dark:text-stone-600">lbs</span>
          </div>
        </div>

        {/* Aesthetics Section */}
        <div className="bg-white dark:bg-stone-900 p-6 rounded-[32px] shadow-sm border border-stone-50 dark:border-stone-800">
          <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-6 px-1">
            Physical Aesthetics
          </h3>
          <SliderGroup
            keys={[
              'muscleFullness',
              'skinClarity',
              'skinTexture',
              'facialFullness',
              'jawlineDefinition',
              'inflammation',
            ]}
          />
        </div>

        {/* Well-being Section */}
        <div className="bg-white dark:bg-stone-900 p-6 rounded-[32px] shadow-sm border border-stone-50 dark:border-stone-800">
          <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-6 px-1">
            Internal Well-being
          </h3>
          <SliderGroup keys={['energy', 'sleepQuality', 'libido']} />
        </div>

        {/* Submit Action */}
        <div className="pt-4">
          <button
            onClick={handleSubmit}
            className="w-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 py-5 rounded-[24px] font-bold text-lg shadow-xl shadow-stone-300 dark:shadow-stone-900/50 flex items-center justify-center space-x-2 active:scale-[0.98] transition-transform"
          >
            <Save size={20} />
            <span>Save Log Entry</span>
          </button>
        </div>
      </div>
    </div>
  );
};
