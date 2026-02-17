import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface DisclaimerModalProps {
  onAccept: () => void;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ onAccept }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-300">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center text-stone-800">
            <ShieldAlert size={24} />
          </div>
          <h2 className="text-xl font-semibold text-stone-900">Not Medical Advice</h2>
          <div className="text-sm text-stone-600 space-y-3 leading-relaxed">
            <p>
              This application is a passive logbook for personal documentation only.
            </p>
            <p>
              It does <strong>not</strong> provide medical diagnoses, treatment recommendations, or dosage advice.
            </p>
            <p>
              By continuing, you acknowledge that you are using this tool solely for record-keeping purposes.
            </p>
          </div>
          <button
            onClick={onAccept}
            className="w-full mt-4 bg-stone-900 text-stone-50 py-3 rounded-xl font-medium active:scale-95 transition-transform"
          >
            I Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};