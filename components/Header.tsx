
import React from 'react';

const LogoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-8 h-8 md:w-10 md:h-10 text-white"
  >
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
  </svg>
);

const MicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M12 2a3 0 0 0-3 3v7a3 0 0 0 6 0V5a3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>
);


export const Header: React.FC<{ onVoiceClick: () => void; isPmModeActive: boolean }> = ({ onVoiceClick, isPmModeActive }) => {
  return (
    <header className="text-center mb-10 md:mb-16 relative">
      <div className="flex justify-center items-center gap-3 mb-4">
        <LogoIcon />
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white font-sans">
          BuildIT
        </h1>
        {isPmModeActive && (
          <span className="ml-2 px-3 py-1 bg-cyan-900/30 text-cyan-400 text-[10px] uppercase tracking-widest font-bold rounded-full border border-cyan-800 animate-fade-in">
            PM Mode
          </span>
        )}
      </div>
      <p className="text-lg md:text-xl text-zinc-500 font-medium">
        Make Your Ideas Real
      </p>
      <button 
        onClick={onVoiceClick} 
        aria-label="Start voice conversation"
        className="absolute top-0 right-0 p-3 text-zinc-500 hover:text-white transition-colors bg-zinc-900/50 rounded-full border border-zinc-800 hover:border-zinc-600"
      >
        <MicIcon />
      </button>
    </header>
  );
};
