
import React from 'react';
import { type BonusContent } from '../types';

interface BonusSectionProps {
  content: BonusContent;
  finalScore: number;
}

export const BonusSection: React.FC<BonusSectionProps> = ({ content, finalScore }) => {
  const shareText = `My idea scored ${Math.round(finalScore * 10)}/100 🚀\nRisk: ${content.shareable_data.risk_level}\nTop fix: ${content.shareable_data.top_fix}\nCategory: ${content.shareable_data.category}\n#Startup #Founder #BuildInPublic`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareText);
    alert('Summary copied to clipboard!');
  };

  return (
    <div className="space-y-8 animate-slide-up-fade" style={{ animationDelay: '600ms' }}>
      {/* 1. Name & Tagline Generator */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-sm p-6">
        <h3 className="text-zinc-400 text-xs uppercase tracking-widest font-bold mb-6">Generated Names</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {content.names.map((n, i) => (
            <div key={i} className="bg-black border border-zinc-800 p-4 rounded-sm hover:border-cyan-900 transition-colors">
              <div className="text-cyan-400 font-bold text-lg mb-1">{n.name}</div>
              <div className="text-zinc-500 text-xs italic">{n.tagline}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Competitive Context */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-sm p-6">
        <h3 className="text-zinc-400 text-xs uppercase tracking-widest font-bold mb-6">Competitive Context</h3>
        <div className="space-y-4">
            {content.competitors.map((c, i) => (
                <div key={i} className="border-l-2 border-zinc-800 pl-4 py-1">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-white font-semibold">{c.name}</span>
                        <span className="text-xs text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">Competitor</span>
                    </div>
                    <p className="text-sm text-zinc-400 mb-1"><span className="text-zinc-600 uppercase text-[10px] tracking-wide mr-2">Diff:</span>{c.differentiation}</p>
                    <p className="text-sm text-zinc-300"><span className="text-zinc-600 uppercase text-[10px] tracking-wide mr-2">Opp:</span>{c.whitespace_opportunity}</p>
                </div>
            ))}
        </div>
      </div>

      {/* 2. One-Click Shareable Summary */}
      <div className="bg-gradient-to-r from-zinc-900 to-black border border-zinc-800 rounded-sm p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
        </div>
        <h3 className="text-zinc-400 text-xs uppercase tracking-widest font-bold mb-4">Shareable Summary</h3>
        <pre className="bg-black/50 p-4 rounded text-zinc-300 font-mono text-xs whitespace-pre-wrap border border-zinc-800 mb-4">
            {shareText}
        </pre>
        <button 
            onClick={copyToClipboard}
            className="w-full bg-white text-black font-bold py-3 text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors"
        >
            Copy to Clipboard
        </button>
      </div>
    </div>
  );
};
