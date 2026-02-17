import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, HelpCircle, Shield, Activity, Syringe } from 'lucide-react';

export const FAQ: React.FC = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: 'General & Privacy',
      icon: <Shield size={18} />,
      items: [
        {
          q: 'What is the purpose of this app?',
          a: 'Aesthetic Logbook is a privacy-first personal tracking tool. It is designed to help you document your wellness protocols, injections, and subjective aesthetic metrics so you can see trends over time.',
        },
        {
          q: 'Does this app provide medical advice?',
          a: 'No. This application is strictly a passive logbook. It does not offer medical diagnoses, dosage recommendations, or treatment plans. Always consult with a qualified healthcare professional regarding your health decisions.',
        },
        {
          q: 'Where is my data stored?',
          a: "Your data is stored locally on your device's internal storage using LocalStorage API. We do not have cloud servers, and we cannot see or access your personal logs. This ensures maximum privacy.",
        },
      ],
    },
    {
      title: 'Features & Usage',
      icon: <Activity size={18} />,
      items: [
        {
          q: 'How do I log an injection?',
          a: "Tap the '+' button in the navigation bar or use the 'Log Dose' button on the dashboard. You can select your protocol, adjust the dose, date, and select an injection site.",
        },
        {
          q: "What is the 'Check-In' feature?",
          a: "The Check-In allows you to log subjective metrics like 'Muscle Fullness', 'Skin Clarity', and 'Energy' on a scale of 1-10, along with your body weight. This helps you correlate how you feel with your protocols.",
        },
        {
          q: 'How do I read the Trends chart?',
          a: 'Go to the Trends tab. Select a metric (like Weight or Energy) from the buttons at the top. The chart visualizes your entries over time to show progress.',
        },
      ],
    },
    {
      title: 'Protocols',
      icon: <Syringe size={18} />,
      items: [
        {
          q: 'How do I add a new protocol?',
          a: "Navigate to the Compounds/Protocols tab and tap the '+' button in the top right. You can define the name, dose, unit, frequency, and color theme for that compound.",
        },
        {
          q: 'Can I edit an existing protocol?',
          a: 'Yes. Tap on any protocol card in the list to open the edit screen. You can change the schedule or archive the protocol if you are no longer using it.',
        },
      ],
    },
    {
      title: 'Troubleshooting',
      icon: <HelpCircle size={18} />,
      items: [
        {
          q: "My schedule isn't showing up on the dashboard.",
          a: "Ensure you have set the correct 'Start Date' and 'Frequency' in your protocol settings. The dashboard only shows doses due today based on those settings.",
        },
        {
          q: 'How do I reset my data?',
          a: "Go to Settings > Data Control. Tap 'Reset All Data'. You will need to confirm this action as it cannot be undone.",
        },
      ],
    },
  ];

  return (
    <div className="pt-2 pb-20 min-h-screen bg-[#F8F9FB] dark:bg-stone-950 transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 px-1">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-stone-500 dark:text-stone-400 rounded-full hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">Help Center</h1>
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wide">
            Support & FAQ
          </p>
        </div>
        <div className="w-8" />
      </div>

      <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
        {sections.map((section, idx) => (
          <section key={idx}>
            <div className="flex items-center space-x-2 mb-4 px-2">
              <div className="text-stone-400 dark:text-stone-500">{section.icon}</div>
              <h2 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">
                {section.title}
              </h2>
            </div>

            <div className="bg-white dark:bg-stone-900 rounded-[32px] border border-stone-50 dark:border-stone-800 shadow-sm overflow-hidden">
              {section.items.map((item, i) => (
                <div
                  key={i}
                  className="p-6 border-b border-stone-50 dark:border-stone-800 last:border-0"
                >
                  <h3 className="font-bold text-stone-900 dark:text-stone-200 text-sm mb-2">
                    {item.q}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-medium">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))}

        <div className="px-4 py-4 text-center">
          <p className="text-xs text-stone-400 dark:text-stone-600">Still have questions?</p>
          <p className="text-xs font-bold text-stone-900 dark:text-stone-300 mt-1">
            Contact support at help@aestheticlog.com
          </p>
        </div>
      </div>
    </div>
  );
};
