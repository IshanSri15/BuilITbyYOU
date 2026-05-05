
import React from 'react';

interface ScoreGaugeProps {
  score: number;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score }) => {
  const getScoreColor = (s: number) => {
    if (s >= 8) return 'text-cyan-400';
    if (s >= 5) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="flex-shrink-0 flex items-center justify-center w-20 h-20 bg-black rounded-full border-2 border-zinc-800">
      <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
        {score.toFixed(0)}
      </div>
    </div>
  );
};
