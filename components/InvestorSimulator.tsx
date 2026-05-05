
import React, { useState, useEffect } from 'react';
import { generateInvestorFeedback } from '../services/geminiService';
import { type InvestorSimulationResult } from '../types';

interface InvestorSimulatorProps {
  idea: string;
}

export const InvestorSimulator: React.FC<InvestorSimulatorProps> = ({ idea }) => {
  const [mode, setMode] = useState<'US' | 'IN' | 'GLOBAL'>('US');
  const [result, setResult] = useState<InvestorSimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSimulation();
  }, [mode]);

  const loadSimulation = async () => {
    setIsLoading(true);
    try {
        const data = await generateInvestorFeedback(idea, mode);
        setResult(data);
    } catch (e) {
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  };

  const toggleMode = () => {
      if (mode === 'US') setMode('IN');
      else if (mode === 'IN') setMode('GLOBAL');
      else setMode('US');
  };

  return (
    <div className="mt-16 animate-slide-up-fade" style={{ animationDelay: '700ms' }}>
      <div className="flex items-center justify-between mb-8 border-b border-zinc-800 pb-4">
        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-[0.2em]">
            Investor Simulator <span className="text-zinc-600 text-[10px] ml-2">({mode} Mode)</span>
        </h2>
        <button 
            onClick={toggleMode}
            title="Switch Simulation Mode"
            className="text-2xl hover:scale-110 transition-transform cursor-pointer grayscale hover:grayscale-0"
        >
            🦇
        </button>
      </div>

      {isLoading ? (
          <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-zinc-700 border-t-cyan-400 rounded-full animate-spin"></div>
          </div>
      ) : result ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {result.feedbacks.map((item, i) => {
                  const isOut = item.verdict.toLowerCase().includes("out");
                  return (
                    <div key={i} className={`bg-zinc-900/20 border p-6 rounded-sm relative overflow-hidden ${isOut ? 'border-red-900/30' : 'border-green-900/30'}`}>
                        <div className={`absolute top-0 right-0 w-16 h-16 blur-2xl -mr-8 -mt-8 pointer-events-none ${isOut ? 'bg-red-500/10' : 'bg-green-500/10'}`}></div>
                        <h3 className="font-bold text-lg text-white mb-1">{item.investor_name}</h3>
                        <p className="text-zinc-400 text-sm italic mb-4">"{item.feedback}"</p>
                        
                        <div className="mb-4">
                            <span className="text-[10px] uppercase text-zinc-600 font-bold tracking-widest">Hard Question</span>
                            <p className="text-zinc-300 text-sm">{item.hard_question}</p>
                        </div>

                        <div className={`mt-auto border-t pt-3 font-mono text-xs font-bold ${isOut ? 'text-red-500 border-red-900/30' : 'text-green-500 border-green-900/30'}`}>
                            {item.verdict}
                        </div>
                    </div>
                  );
              })}
          </div>
      ) : null}
    </div>
  );
};
