import React from 'react';
import { Terminal, Database, Server } from 'lucide-react';

const Navbar = ({ ingested, currentView, onViewChange }) => {
  return (
    <header className="h-11 w-full border-b border-[#3C3C3C] bg-[#252526] px-4 flex items-center justify-between select-none shrink-0 font-mono">
      
      {/* Brand & Logo */}
      <div className="flex items-center space-x-2">
        <div className="flex h-5 w-5 items-center justify-center rounded bg-[#E95420] text-white">
          <Terminal className="h-3.5 w-3.5" />
        </div>
        <div className="flex items-center space-x-2">
          <span 
            className="font-bold text-xs tracking-tight text-white uppercase cursor-pointer hover:text-[#E95420] transition-colors" 
            onClick={() => onViewChange('landing')}
          >
            VidComp
          </span>
          <span className="text-[10px] text-[#B0B0B0] border border-[#3C3C3C] px-1 rounded bg-[#1E1E1E]">
            v1.0.0-stable
          </span>
        </div>
      </div>

      {/* Navigation View Selectors */}
      <div className="flex items-center space-x-1 text-[11px] text-slate-300">
        <button
          onClick={() => onViewChange('landing')}
          className={`px-3 py-1 border transition-colors cursor-pointer rounded-sm ${
            currentView === 'landing'
              ? 'bg-[#3C3C3C] border-[#B0B0B0]/30 text-white font-bold'
              : 'border-transparent hover:bg-[#1E1E1E] text-slate-400'
          }`}
        >
          LANDING_PAGE
        </button>
        <button
          onClick={() => onViewChange('workspace')}
          className={`px-3 py-1 border transition-colors cursor-pointer rounded-sm ${
            currentView === 'workspace'
              ? 'bg-[#3C3C3C] border-[#B0B0B0]/30 text-white font-bold'
              : 'border-transparent hover:bg-[#1E1E1E] text-slate-400'
          }`}
        >
          WORKSPACE_CONSOLE
        </button>
      </div>

      {/* Monitors indicators */}
      <div className="flex items-center space-x-4 text-[11px] text-[#B0B0B0] hidden sm:flex">
        <div className="flex items-center space-x-1.5">
          <Database className="h-3.5 w-3.5 shrink-0" />
          <span>INDEX:</span>
          {ingested ? (
            <span className="font-semibold text-[#E95420] px-1 bg-[#E95420]/10 border border-[#E95420]/25 rounded-sm">
              INDEXED
            </span>
          ) : (
            <span className="font-semibold text-amber-500 px-1 bg-amber-500/10 border border-amber-500/25 rounded-sm">
              UNMAPPED
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-1.5">
          <Server className="h-3.5 w-3.5 shrink-0" />
          <span>BACKEND:</span>
          <span className="font-semibold text-emerald-500 px-1 bg-emerald-500/10 border border-emerald-500/25 rounded-sm">
            ONLINE
          </span>
        </div>
      </div>

    </header>
  );
};

export default Navbar;
