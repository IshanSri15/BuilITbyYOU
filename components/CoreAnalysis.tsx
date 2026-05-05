
import React from 'react';
import { type CoreAnalysis as CoreAnalysisType } from '../types';

interface CoreAnalysisProps {
  data: CoreAnalysisType;
}

const LevelBadge: React.FC<{ level: 'Low' | 'Medium' | 'High' }> = ({ level }) => {
    let colorClass = 'bg-zinc-800 text-zinc-400 border-zinc-700';
    if (level === 'High') colorClass = 'bg-red-900/30 text-red-300 border-red-800/50';
    if (level === 'Medium') colorClass = 'bg-yellow-900/30 text-yellow-300 border-yellow-800/50';
    if (level === 'Low') colorClass = 'bg-green-900/30 text-green-300 border-green-800/50';
    
    // For Market Demand, High is Good. For Competition, Low is Good.
    // The component below handles the specific coloring logic per section if needed,
    // but for a generic badge, we might just stick to neutral or allow overrides.
    // Let's keep it simple and neutral-ish unless specified.
    
    return (
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${colorClass}`}>
            {level}
        </span>
    );
};

export const CoreAnalysis: React.FC<CoreAnalysisProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up-fade" style={{ animationDelay: '50ms' }}>
      
      {/* 1. Problem Clarity */}
      <div className="bg-zinc-900/20 border border-zinc-800/50 p-6 rounded-sm md:col-span-2">
        <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3">Problem Clarity</h3>
        <p className="text-zinc-200 text-sm font-light leading-relaxed">
            {data.problem_clarity}
        </p>
      </div>

      {/* 2. Market Demand */}
      <div className="bg-zinc-900/20 border border-zinc-800/50 p-6 rounded-sm">
        <div className="flex justify-between items-center mb-3">
             <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Market Demand</h3>
             <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${
                 data.market_demand.level === 'High' ? 'bg-green-900/30 text-green-400 border-green-800/50' :
                 data.market_demand.level === 'Medium' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-800/50' :
                 'bg-red-900/30 text-red-400 border-red-800/50'
             }`}>
                 {data.market_demand.level}
             </span>
        </div>
        <p className="text-zinc-400 text-xs leading-relaxed">
            {data.market_demand.reasoning}
        </p>
      </div>

      {/* 3. Competition */}
      <div className="bg-zinc-900/20 border border-zinc-800/50 p-6 rounded-sm">
        <div className="flex justify-between items-center mb-3">
             <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Competition</h3>
             <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${
                 data.competition.level === 'Low' ? 'bg-green-900/30 text-green-400 border-green-800/50' :
                 data.competition.level === 'Medium' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-800/50' :
                 'bg-red-900/30 text-red-400 border-red-800/50'
             }`}>
                 {data.competition.level}
             </span>
        </div>
        <p className="text-zinc-400 text-xs leading-relaxed">
            <span className="text-zinc-500 mr-2">Example:</span>
            {data.competition.example}
        </p>
      </div>

      {/* 4. Execution Risk */}
      <div className="bg-zinc-900/20 border border-zinc-800/50 p-6 rounded-sm md:col-span-2">
        <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3">Execution Risks</h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
            {data.execution_risk.map((risk, i) => (
                <li key={i} className="flex items-start text-xs text-zinc-400">
                    <span className="mr-2 mt-1.5 w-1 h-1 bg-red-500/50 rounded-full flex-shrink-0" />
                    {risk}
                </li>
            ))}
        </ul>
      </div>

    </div>
  );
};
