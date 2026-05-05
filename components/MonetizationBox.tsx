
import React, { useState, useEffect } from 'react';
import { generateMonetizationStrategy } from '../services/geminiService';
import { type MonetizationStrategy } from '../types';

interface MonetizationBoxProps {
  idea: string;
}

export const MonetizationBox: React.FC<MonetizationBoxProps> = ({ idea }) => {
  const [strategy, setStrategy] = useState<MonetizationStrategy | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadStrategy = async () => {
      setIsLoading(true);
      try {
        const data = await generateMonetizationStrategy(idea);
        setStrategy(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadStrategy();
  }, [idea]);

  if (isLoading) {
    return (
      <div className="mt-16 flex justify-center py-8">
        <div className="w-6 h-6 border-2 border-zinc-700 border-t-emerald-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!strategy) return null;

  return (
    <div className="mt-16 animate-slide-up-fade" style={{ animationDelay: '800ms' }}>
      <div className="flex items-center mb-8 border-b border-zinc-800 pb-4">
        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-[0.2em]">
          Monetization Strategy Box
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-900/20 border border-zinc-800/50 p-6 rounded-sm">
          <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4">Primary Monetization Model</h3>
          <p className="text-zinc-300 text-sm font-light leading-relaxed">{strategy.primaryModel}</p>
        </div>

        <div className="bg-zinc-900/20 border border-zinc-800/50 p-6 rounded-sm">
          <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4">Additional Revenue Streams</h3>
          <ul className="space-y-2">
            {strategy.additionalStreams.map((stream, i) => (
              <li key={i} className="flex items-start text-xs leading-5 text-zinc-400">
                <span className="mr-2 mt-1 w-1.5 h-1.5 flex-shrink-0 rounded-full bg-emerald-800" />
                {stream}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-zinc-900/20 border border-zinc-800/50 p-6 rounded-sm">
          <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4">Pricing Strategy</h3>
          <p className="text-zinc-300 text-sm font-light leading-relaxed">{strategy.pricingStrategy}</p>
        </div>

        <div className="bg-zinc-900/20 border border-zinc-800/50 p-6 rounded-sm">
          <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4">Target Paying Customer</h3>
          <p className="text-zinc-300 text-sm font-light leading-relaxed">{strategy.targetPayingCustomer}</p>
        </div>

        <div className="bg-zinc-900/20 border border-zinc-800/50 p-6 rounded-sm">
          <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4">Market Benchmark</h3>
          <p className="text-zinc-300 text-sm font-light leading-relaxed">{strategy.marketBenchmark}</p>
        </div>

        <div className="bg-zinc-900/20 border border-zinc-800/50 p-6 rounded-sm">
          <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4">Scalable Revenue Opportunities</h3>
          <p className="text-zinc-300 text-sm font-light leading-relaxed">{strategy.scalableOpportunities}</p>
        </div>
      </div>
    </div>
  );
};
