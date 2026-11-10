import React from 'react';
import { TabType } from '../types';
import { cn } from '../utils/formatters';
import { 
  Home, 
  FileText, 
  Plus, 
  Eye, 
  Glasses, 
  Download,
  Smartphone
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  recordCount: number;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  recordCount,
}) => {
  const { isInstallable, install } = usePWAInstall();

  return (
    <div className="min-h-screen bg-[#fcf9f1] text-black font-sans antialiased selection:bg-accent selection:text-black flex flex-col">
      {/* Desktop Sidebar (visible on tablets/desktops) */}
      <aside className="fixed left-0 top-0 h-full w-[220px] bg-white border-r-2 border-black z-50 hidden md:flex flex-col p-6 shadow-none">
        {/* Brand Logo */}
        <div 
          onClick={() => onTabChange('dashboard')}
          className="logo text-black font-black text-2xl mb-8 flex items-center gap-2.5 italic uppercase tracking-tighter cursor-pointer hover:opacity-85 transition-opacity"
        >
          <div className="w-9 h-9 bg-accent border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] not-italic">
            <Eye className="w-5 h-5 text-black" strokeWidth={2.5} />
          </div>
          <span>VisionFlow</span>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => onTabChange('dashboard')}
                className={cn(
                  'w-full text-left px-4 py-3 text-sm font-black uppercase tracking-tight transition-all flex items-center justify-between cursor-pointer',
                  activeTab === 'dashboard'
                    ? 'bg-accent text-black translate-x-[2px] translate-y-[2px] shadow-none border-2 border-black'
                    : 'text-zinc-700 hover:bg-[#e1fff3] border-2 border-black mb-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white active:translate-x-[2px] active:translate-y-[2px]'
                )}
              >
                <div className="flex items-center gap-2">
                  <Home size={18} strokeWidth={2.5} />
                  <span>Dashboard</span>
                </div>
              </button>
            </li>
            <li>
              <button
                onClick={() => onTabChange('entry')}
                className={cn(
                  'w-full text-left px-4 py-3 text-sm font-black uppercase tracking-tight transition-all flex items-center justify-between cursor-pointer',
                  activeTab === 'entry'
                    ? 'bg-accent text-black translate-x-[2px] translate-y-[2px] shadow-none border-2 border-black'
                    : 'text-zinc-700 hover:bg-[#e1fff3] border-2 border-black mb-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white active:translate-x-[2px] active:translate-y-[2px]'
                )}
              >
                <div className="flex items-center gap-2">
                  <Plus size={18} strokeWidth={3} />
                  <span>New Patient</span>
                </div>
              </button>
            </li>
            <li>
              <button
                onClick={() => onTabChange('list')}
                className={cn(
                  'w-full text-left px-4 py-3 text-sm font-black uppercase tracking-tight transition-all flex items-center justify-between cursor-pointer',
                  activeTab === 'list'
                    ? 'bg-accent text-black translate-x-[2px] translate-y-[2px] shadow-none border-2 border-black'
                    : 'text-zinc-700 hover:bg-[#e1fff3] border-2 border-black mb-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white active:translate-x-[2px] active:translate-y-[2px]'
                )}
              >
                <div className="flex items-center gap-2">
                  <FileText size={18} strokeWidth={2.5} />
                  <span>Patient Records</span>
                </div>
                <span className="bg-black text-white text-[10px] font-black px-1.5 py-0.5">
                  {recordCount}
                </span>
              </button>
            </li>
          </ul>
        </nav>

        {/* Sidebar Footer info */}
        <div className="pt-4 border-t-2 border-black space-y-3">
          {isInstallable && (
            <button
              onClick={install}
              className="w-full bg-[#e1fff3] border-2 border-black p-2.5 text-xs font-black uppercase tracking-tight shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-white flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download size={14} />
              <span>Install PWA</span>
            </button>
          )}

          <div className="p-3 bg-[#e1f4ff] border-2 border-black text-[10px] font-black uppercase tracking-tight shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-1.5 text-black">
              <Glasses className="w-4 h-4" />
              <span>VisionFlow Optical</span>
            </div>
            <p className="text-[9px] text-zinc-600 normal-case mt-0.5 font-medium">
              Android Optimized Clinic System
            </p>
          </div>
        </div>
      </aside>

      {/* Android Top App Bar */}
      <header className="md:hidden sticky top-0 left-0 right-0 h-14 sm:h-16 bg-white border-b-2 border-black z-40 flex items-center justify-between px-3 sm:px-5 shadow-xs">
        <div 
          onClick={() => onTabChange('dashboard')}
          className="text-black font-black text-lg sm:text-xl italic uppercase tracking-tighter flex items-center gap-2 cursor-pointer active:opacity-75"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-accent border-2 border-black flex items-center justify-center shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] not-italic">
            <Eye className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-black" strokeWidth={2.5} />
          </div>
          <span>VisionFlow</span>
        </div>

        <div className="flex items-center gap-2">
          {isInstallable && (
            <button
              onClick={install}
              className="px-2.5 py-1 bg-[#e1fff3] border border-black text-[10px] font-black uppercase tracking-wider flex items-center gap-1 active:bg-white"
            >
              <Smartphone size={12} />
              <span>Install</span>
            </button>
          )}
          <span className="text-[10px] font-black px-2 py-0.5 bg-black text-white uppercase tracking-wider">
            {recordCount} Records
          </span>
        </div>
      </header>

      {/* Android Floating Action Button (FAB) */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={() => onTabChange('entry')}
          className={cn(
            'w-14 h-14 sm:w-16 sm:h-16 border-2 border-black shadow-brutal flex items-center justify-center transition-all cursor-pointer select-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none',
            activeTab === 'entry' ? 'bg-black text-white' : 'bg-accent text-black'
          )}
          aria-label="Add New Patient Record"
        >
          <Plus size={32} className="stroke-[3]" />
        </button>
      </div>

      {/* Android Bottom Navigation Bar */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t-2 border-black z-40 flex items-center justify-around px-4 select-none"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <button
          onClick={() => onTabChange('dashboard')}
          className={cn(
            'flex flex-col items-center justify-center w-20 h-full gap-0.5 transition-all cursor-pointer active:scale-95',
            activeTab === 'dashboard' ? 'text-black font-black' : 'text-zinc-500 font-bold'
          )}
        >
          <div className={cn('p-1 transition-all', activeTab === 'dashboard' ? 'scale-110' : 'scale-100')}>
            <Home size={22} strokeWidth={activeTab === 'dashboard' ? 2.8 : 2} />
          </div>
          <span className="text-[9px] uppercase tracking-tight">Dashboard</span>
        </button>

        {/* Empty Spacer for the Center Floating Button */}
        <div className="w-14 h-14 pointer-events-none" />

        <button
          onClick={() => onTabChange('list')}
          className={cn(
            'flex flex-col items-center justify-center w-20 h-full gap-0.5 transition-all cursor-pointer active:scale-95',
            activeTab === 'list' ? 'text-black font-black' : 'text-zinc-500 font-bold'
          )}
        >
          <div className={cn('p-1 transition-all relative', activeTab === 'list' ? 'scale-110' : 'scale-100')}>
            <FileText size={22} strokeWidth={activeTab === 'list' ? 2.8 : 2} />
            {recordCount > 0 && (
              <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-accent border border-black" />
            )}
          </div>
          <span className="text-[9px] uppercase tracking-tight">Records</span>
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-[220px] pt-3 md:pt-8 min-h-screen p-3 md:p-8 pb-28 md:pb-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
