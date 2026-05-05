
import React, { useState } from 'react';
import { generateEvolution } from '../services/geminiService';
import { type EvolutionResult } from '../types';

interface IdeaEvolutionProps {
  idea: string;
}

export const IdeaEvolution: React.FC<IdeaEvolutionProps> = ({ idea }) => {
  const [result, setResult] = useState<EvolutionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const handleStart = async () => {
      setHasStarted(true);
      setIsLoading(true);
      try {
          const data = await generateEvolution(idea);
          setResult(data);
      } catch (e) {
          console.error(e);
      } finally {
          setIsLoading(false);
      }
  };

  if (!hasStarted) {
      return (
          <div className="mt-12 text-center animate-slide-up-fade" style={{ animationDelay: '800ms' }}>
              <button 
                onClick={handleStart}
                className="inline-flex items-center gap-2 text-cyan-500 hover:text-cyan-400 text-xs font-mono uppercase tracking-widest border border-cyan-900/50 hover:border-cyan-500/50 px-6 py-3 rounded-full transition-all bg-cyan-950/10"
              >
                <span>⚡ Iterate this idea 3 times</span>
              </button>
          </div>
      );
  }

  return (
    <div className="mt-16 border-t border-zinc-900 pt-16 animate-fade-in">
        <div className="flex items-center mb-8">
            <div className="h-4 w-1 bg-cyan-600 mr-3"></div>
            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-[0.2em]">
                Idea Evolution
            </h2>
        </div>

        {isLoading ? (
            <div className="space-y-4">
                <div className="h-24 bg-zinc-900/50 rounded animate-pulse"></div>
                <div className="h-24 bg-zinc-900/50 rounded animate-pulse delay-75"></div>
                <div className="h-24 bg-zinc-900/50 rounded animate-pulse delay-150"></div>
            </div>
        ) : result ? (
            <div className="space-y-6">
                {result.iterations.map((iter, i) => (
                    <div key={i} className="flex gap-4">
                        <div className="flex-shrink-0 flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 font-mono text-xs">
                                {i + 1}
                            </div>
                            {i < result.iterations.length - 1 && <div className="w-px h-full bg-zinc-800 my-2"></div>}
                        </div>
                        <div className="bg-zinc-900/10 border border-zinc-800/50 p-5 rounded-sm flex-grow">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="text-white font-bold text-sm">{iter.iteration_title}</h4>
                                <span className="text-green-500 text-xs font-mono bg-green-900/20 px-2 py-1 rounded border border-green-900/30">
                                    {iter.projected_score_impact}
                                </span>
                            </div>
                            <p className="text-zinc-400 text-sm mb-3">{iter.changes}</p>
                            <p className="text-zinc-500 text-xs italic border-l-2 border-zinc-800 pl-3">"{iter.reasoning}"</p>
                        </div>
                    </div>
                ))}
            </div>
        ) : null}
    </div>
  );
};
