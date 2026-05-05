
import React from 'react';
import { type ValidationResult } from '../types';

interface SummaryCardProps {
  result: ValidationResult;
}

const CriteriaBar: React.FC<{ label: string; score: number }> = ({ label, score }) => {
  // Score is 1-10
  const percentage = score * 10;
  let barColor = 'bg-zinc-600';
  if (score >= 8) barColor = 'bg-green-500';
  else if (score >= 5) barColor = 'bg-yellow-500';
  else barColor = 'bg-red-500';

  return (
    <div className="mb-3">
      <div className="flex justify-between text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
        <span>{label}</span>
        <span className="text-zinc-300 font-mono">{score}/10</span>
      </div>
      <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

export const SummaryCard: React.FC<SummaryCardProps> = ({ result }) => {
  // Updated thresholds for 0-10 scale
  const isHighPotential = result.confidence_score >= 7.5;
  const isLowPotential = result.confidence_score < 5.0;
  
  const scoreColor = isHighPotential ? 'text-green-500' : isLowPotential ? 'text-red-500' : 'text-yellow-500';
  const borderColor = isHighPotential ? 'border-green-900/50' : isLowPotential ? 'border-red-900/50' : 'border-zinc-800';

  return (
    <div className={`bg-black p-8 rounded-sm border ${borderColor} shadow-2xl relative overflow-hidden`}>
      {/* Background decoration */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-zinc-800/20 to-transparent blur-2xl pointer-events-none`} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        
        {/* Left: Score & Verdict */}
        <div className="text-center md:text-left">
            <h2 className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] font-bold mb-4">Confidence Score</h2>
            <div className={`text-8xl font-bold tracking-tighter leading-none mb-6 ${scoreColor} animate-score-pulse`}>
                {result.confidence_score}
            </div>
            <div className="inline-block px-3 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs font-mono text-zinc-300 mb-6">
                {result.industry_benchmark_comparison}
            </div>
            <p className="text-zinc-100 text-lg font-medium leading-tight border-l-2 border-zinc-700 pl-4">
                "{result.kill_or_proceed_warning}"
            </p>
        </div>

        {/* Right: Criteria Breakdown */}
        <div className="w-full">
            <CriteriaBar label="Market Timing" score={result.criteria_scores.market_timing} />
            <CriteriaBar label="Product Value" score={result.criteria_scores.product_value} />
            <CriteriaBar label="Execution Feasibility" score={result.criteria_scores.execution_feasibility} />
            <CriteriaBar label="Competition Risk" score={result.criteria_scores.competition_risk} />
            <CriteriaBar label="Monetization" score={result.criteria_scores.monetization_potential} />
        </div>
      </div>
    </div>
  );
};
