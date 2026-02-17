import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { exportData, clearAllData, getSettings, saveSettings } from '../services/storage';
import { AppSettings } from '../types';
import { Download, Trash2, Shield, Info, Smartphone, ChevronRight, Share2, Moon, Sun, Monitor, Bell, Scale, FileText, Lock, HelpCircle } from 'lucide-react';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [resetConfirm, setResetConfirm] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(getSettings());

  const updateSetting = (key: keyof AppSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings(newSettings);
    // Dispatch event to update theme immediately in App.tsx
    window.dispatchEvent(new Event('app-settings-changed'));
  };

  const updateNotification = (key: keyof AppSettings['notifications']) => {
    const newSettings = {
      ...settings,
      notifications: { ...settings.notifications, [key]: !settings.notifications[key] }
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleExport = () => {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aesthetic-logbook-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    if (resetConfirm) {
      clearAllData();
      window.location.reload();
    } else {
      setResetConfirm(true);
      setTimeout(() => setResetConfirm(false), 3000);
    }
  };

  const handleInvite = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Aesthetic Logbook',
        text: 'Check out this app for tracking your wellness journey.',
        url: window.location.href
      }).catch(console.error);
    } else {
      alert("Sharing is not supported on this device/browser.");
    }
  };

  return (
    <div className="pt-2 space-y-8 pb-24 bg-[#F8F9FB] dark:bg-stone-950 transition-colors duration-300 min-h-screen">
      <div className="px-1">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Settings</h1>
        <p className="text-sm text-stone-400 dark:text-stone-500 font-medium">Preferences & Support</p>
      </div>

      {/* Preferences Section */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest ml-2">Preferences</h2>
        <div className="bg-white dark:bg-stone-900 rounded-[32px] border border-stone-50 dark:border-stone-800 overflow-hidden shadow-sm p-6 space-y-6">
            
            {/* Units */}
            <div>
                <div className="flex items-center space-x-2 mb-3">
                    <Scale size={18} className="text-stone-400 dark:text-stone-500" />
                    <span className="font-bold text-stone-900 dark:text-stone-200 text-sm">Unit System</span>
                </div>
                <div className="bg-stone-50 dark:bg-stone-800 p-1 rounded-xl flex">
                    {(['imperial', 'metric'] as const).map((unit) => (
                        <button
                            key={unit}
                            onClick={() => updateSetting('units', unit)}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                                settings.units === unit 
                                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-sm' 
                                : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300'
                            }`}
                        >
                            {unit}
                        </button>
                    ))}
                </div>
                <p className="text-[10px] text-stone-400 dark:text-stone-600 mt-2 px-1">
                    Sets the global unit of measure for weight and dosing calculations.
                </p>
            </div>

            <div className="w-full h-px bg-stone-50 dark:bg-stone-800" />

            {/* Appearance */}
            <div>
                <div className="flex items-center space-x-2 mb-3">
                    <Monitor size={18} className="text-stone-400 dark:text-stone-500" />
                    <span className="font-bold text-stone-900 dark:text-stone-200 text-sm">Appearance</span>
                </div>
                <div className="bg-stone-50 dark:bg-stone-800 p-1 rounded-xl flex">
                    <button
                        onClick={() => updateSetting('theme', 'light')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1 transition-all ${
                            settings.theme === 'light' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 dark:text-stone-500'
                        }`}
                    >
                        <Sun size={14} /> <span>Light</span>
                    </button>
                    <button
                        onClick={() => updateSetting('theme', 'dark')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1 transition-all ${
                            settings.theme === 'dark' ? 'bg-stone-700 text-white shadow-sm' : 'text-stone-400 dark:text-stone-500'
                        }`}
                    >
                        <Moon size={14} /> <span>Dark</span>
                    </button>
                    <button
                        onClick={() => updateSetting('theme', 'system')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1 transition-all ${
                            settings.theme === 'system' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-sm' : 'text-stone-400 dark:text-stone-500'
                        }`}
                    >
                        <Monitor size={14} /> <span>System</span>
                    </button>
                </div>
            </div>
        </div>
      </section>

      {/* Notifications Section */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest ml-2">Notifications</h2>
        <div className="bg-white dark:bg-stone-900 rounded-[32px] border border-stone-50 dark:border-stone-800 overflow-hidden shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-pastel-blue flex items-center justify-center text-stone-600">
                        <Bell size={16} />
                    </div>
                    <div>
                        <p className="font-bold text-stone-900 dark:text-stone-200 text-sm">Push Notifications</p>
                        <p className="text-xs text-stone-400 dark:text-stone-500">Enable all app alerts</p>
                    </div>
                </div>
                <button 
                    onClick={() => updateNotification('push')}
                    className={`w-12 h-7 rounded-full transition-colors relative ${settings.notifications.push ? 'bg-stone-900 dark:bg-stone-100' : 'bg-stone-200 dark:bg-stone-700'}`}
                >
                    <div className={`absolute top-1 w-5 h-5 bg-white dark:bg-stone-900 rounded-full transition-transform shadow-sm ${settings.notifications.push ? 'left-6' : 'left-1'}`} />
                </button>
            </div>
            
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400 dark:text-stone-500">
                        <Info size={16} />
                    </div>
                    <div>
                        <p className="font-bold text-stone-900 dark:text-stone-200 text-sm">Schedule Reminders</p>
                        <p className="text-xs text-stone-400 dark:text-stone-500">Notify when doses are due</p>
                    </div>
                </div>
                <button 
                    onClick={() => updateNotification('reminders')}
                    className={`w-12 h-7 rounded-full transition-colors relative ${settings.notifications.reminders ? 'bg-stone-900 dark:bg-stone-100' : 'bg-stone-200 dark:bg-stone-700'}`}
                >
                    <div className={`absolute top-1 w-5 h-5 bg-white dark:bg-stone-900 rounded-full transition-transform shadow-sm ${settings.notifications.reminders ? 'left-6' : 'left-1'}`} />
                </button>
            </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest ml-2">Support</h2>
        <div className="bg-white dark:bg-stone-900 rounded-[32px] border border-stone-50 dark:border-stone-800 overflow-hidden shadow-sm p-2">
            
            <button 
                onClick={() => navigate('/settings/faq')}
                className="w-full py-5 px-4 flex justify-between items-center text-left hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors rounded-2xl"
            >
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-pastel-yellow/50 flex items-center justify-center text-stone-600">
                        <HelpCircle size={16} />
                    </div>
                    <span className="font-bold text-sm text-stone-800 dark:text-stone-200">Frequently Asked Questions</span>
                </div>
                <ChevronRight size={18} className="text-stone-300" />
            </button>
            
            <div className="p-4 mt-1 border-t border-stone-50 dark:border-stone-800">
                <div className="bg-pastel-yellow/30 p-4 rounded-2xl flex items-start space-x-3">
                    <Shield size={18} className="text-stone-600 dark:text-stone-400 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase mb-1">Medical Disclaimer</p>
                        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                            This application is for informational and educational purposes only. It is not intended to provide medical advice.
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Legal & Community */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest ml-2">Legal & Community</h2>
        <div className="grid grid-cols-2 gap-3">
            <button className="bg-white dark:bg-stone-900 p-4 rounded-[24px] shadow-sm border border-stone-50 dark:border-stone-800 flex flex-col items-center justify-center space-y-2 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors">
                <FileText size={20} className="text-stone-400" />
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300">Terms of Use</span>
            </button>
            <button className="bg-white dark:bg-stone-900 p-4 rounded-[24px] shadow-sm border border-stone-50 dark:border-stone-800 flex flex-col items-center justify-center space-y-2 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors">
                <Lock size={20} className="text-stone-400" />
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300">Privacy Policy</span>
            </button>
        </div>
        
        <button 
            onClick={handleInvite}
            className="w-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 p-5 rounded-[24px] shadow-lg shadow-stone-200 dark:shadow-stone-900/50 flex items-center justify-center space-x-3 active:scale-[0.98] transition-transform"
        >
            <Share2 size={18} />
            <span className="font-bold text-sm">Invite a Friend</span>
        </button>
      </section>

      {/* Data Management */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest ml-2">Data Control</h2>
        
        <div className="bg-white dark:bg-stone-900 rounded-[32px] border border-stone-50 dark:border-stone-800 overflow-hidden shadow-sm">
            <button 
                onClick={handleExport}
                className="w-full p-5 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors border-b border-stone-50 dark:border-stone-800"
            >
                <div className="flex items-center text-stone-800 dark:text-stone-200">
                    <div className="w-10 h-10 rounded-2xl bg-pastel-blue flex items-center justify-center text-stone-700 mr-4">
                        <Download size={20} />
                    </div>
                    <div className="text-left">
                        <p className="font-bold text-sm">Export Data</p>
                        <p className="text-xs text-stone-400 dark:text-stone-500 font-medium">Download JSON backup</p>
                    </div>
                </div>
                <ChevronRight size={18} className="text-stone-300" />
            </button>

            <button 
                onClick={handleReset}
                className={`w-full p-5 flex items-center justify-between transition-colors ${resetConfirm ? 'bg-red-50 dark:bg-red-900/20' : 'hover:bg-stone-50 dark:hover:bg-stone-800'}`}
            >
                <div className="flex items-center text-stone-800 dark:text-stone-200">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mr-4 ${resetConfirm ? 'bg-red-100 text-red-500' : 'bg-stone-100 dark:bg-stone-800 text-stone-500'}`}>
                        <Trash2 size={20} />
                    </div>
                    <div className="text-left">
                        <p className={`font-bold text-sm ${resetConfirm ? 'text-red-600 dark:text-red-400' : ''}`}>{resetConfirm ? 'Tap again to confirm wipe' : 'Reset All Data'}</p>
                        <p className="text-xs text-stone-400 dark:text-stone-500 font-medium">Clear local storage</p>
                    </div>
                </div>
                <ChevronRight size={18} className="text-stone-300" />
            </button>
        </div>
      </section>

      {/* About */}
      <section className="space-y-4">
        <div className="bg-white dark:bg-stone-900 rounded-[32px] border border-stone-50 dark:border-stone-800 p-6 shadow-sm flex items-center justify-between">
            <div className="flex items-center text-stone-900 dark:text-stone-100">
                <div className="w-10 h-10 rounded-2xl bg-pastel-yellow flex items-center justify-center text-stone-700 mr-4">
                    <Smartphone size={20} />
                </div>
                <div>
                    <p className="font-bold text-sm">Aesthetic Logbook</p>
                    <p className="text-xs text-stone-400 dark:text-stone-500 font-medium">v0.2.0 (MVP)</p>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
};