
import React, { useEffect, useState } from 'react';
import { type ValidationResult, type BonusContent } from '../types';
import { SummaryCard } from './SummaryCard';
import { generateBonusContent } from '../services/geminiService';
import { BonusSection } from './BonusSection';
import { InvestorSimulator } from './InvestorSimulator';
import { MonetizationBox } from './MonetizationBox';
import { IdeaEvolution } from './IdeaEvolution';
import { CoreAnalysis } from './CoreAnalysis';

const SectionDivider = () => <div className="h-px bg-zinc-900 my-16 border-none" />;

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex items-center mb-8">
        <div className="h-4 w-1 bg-zinc-700 mr-3"></div>
        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-[0.2em]">
            {children}
        </h2>
    </div>
);

const DataBox: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({ label, children, className = "" }) => (
    <div className={`bg-zinc-900/20 border border-zinc-800/50 p-6 rounded-sm ${className}`}>
        <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4">{label}</h3>
        <div className="text-zinc-300 text-sm font-light leading-relaxed">
            {children}
        </div>
    </div>
);

const SwotList: React.FC<{ items: string[], type: 'positive' | 'negative' }> = ({ items, type }) => (
    <ul className="space-y-2">
        {items.map((item, i) => (
            <li key={i} className="flex items-start text-xs leading-5 text-zinc-400">
                <span className={`mr-2 mt-1 w-1.5 h-1.5 flex-shrink-0 rounded-full ${type === 'positive' ? 'bg-green-800' : 'bg-red-900'}`} />
                {item}
            </li>
        ))}
    </ul>
);

export const ResultsDisplay: React.FC<{result: ValidationResult; originalIdea: string}> = ({ result, originalIdea }) => {
  const [bonusContent, setBonusContent] = useState<BonusContent | null>(null);

  useEffect(() => {
      // Auto-load bonus content in background
      const loadBonus = async () => {
          try {
              const data = await generateBonusContent(originalIdea);
              setBonusContent(data);
          } catch (e) {
              console.error(e);
          }
      };
      loadBonus();
  }, [originalIdea]);

  return (
    <div className="max-w-4xl mx-auto py-8 font-sans selection:bg-zinc-800 selection:text-white">
        
        {/* Summary Card - Immediate Reveal */}
        <div className="animate-slide-up-fade" style={{ animationDelay: '0ms' }}>
            <SummaryCard result={result} />
        </div>
        
        <div className="h-12" />

        {/* --- NEW CORE ANALYSIS SECTION --- */}
        {result.core_analysis && (
             <div className="mb-16">
                <CoreAnalysis data={result.core_analysis} />
             </div>
        )}

        {/* 1. SWOT Analysis - Staggered */}
        <div className="animate-slide-up-fade" style={{ animationDelay: '100ms' }}>
            <SectionTitle>SWOT Matrix</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <DataBox label="Strengths">
                    <SwotList items={result.swot_analysis.strengths} type="positive" />
                </DataBox>
                <DataBox label="Weaknesses">
                    <SwotList items={result.swot_analysis.weaknesses} type="negative" />
                </DataBox>
                <DataBox label="Opportunities">
                    <SwotList items={result.swot_analysis.opportunities} type="positive" />
                </DataBox>
                <DataBox label="Threats">
                    <SwotList items={result.swot_analysis.threats} type="negative" />
                </DataBox>
            </div>
            <SectionDivider />
        </div>

        {/* 2. Business Model Canvas - Staggered */}
        <div className="animate-slide-up-fade" style={{ animationDelay: '200ms' }}>
            <SectionTitle>Business Model Canvas (Lite)</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DataBox label="Value Propositions">
                    {result.business_model_canvas.value_propositions}
                </DataBox>
                <DataBox label="Customer Segments">
                    {result.business_model_canvas.customer_segments}
                </DataBox>
                <DataBox label="Revenue Streams">
                    {result.business_model_canvas.revenue_streams}
                </DataBox>
                <DataBox label="Cost Structure">
                    {result.business_model_canvas.cost_structure}
                </DataBox>
            </div>
            <SectionDivider />
        </div>

        {/* 3. Financial Reality - Staggered */}
        <div className="animate-slide-up-fade" style={{ animationDelay: '300ms' }}>
            <SectionTitle>Financial Reality</SectionTitle>
            <div className="space-y-6">
                <DataBox label="18-Month Traction Simulator">
                    <pre className="font-mono text-xs text-zinc-400 whitespace-pre-wrap overflow-x-auto">
                        {result.traction_simulator_18mo}
                    </pre>
                </DataBox>
                <div className="flex items-center justify-between bg-zinc-900/30 p-4 border border-zinc-800 rounded-sm">
                    <span className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Est. Monthly Burn</span>
                    <span className="text-white font-mono font-bold text-lg">{result.cost_rough_estimate}</span>
                </div>
            </div>
            <SectionDivider />
        </div>

        {/* 4. GTM Plan - Staggered */}
        <div className="animate-slide-up-fade" style={{ animationDelay: '400ms' }}>
            <SectionTitle>Go-To-Market Plan</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <h3 className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mb-6">5-Week Sprint</h3>
                    <div className="space-y-6 border-l border-zinc-800 pl-4 ml-2">
                        {result.gtm_plan.timeline_estimator_5_weeks.map((week, i) => (
                            <div key={i} className="relative">
                                <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-zinc-900 border border-zinc-700 rounded-full"></span>
                                <p className="text-xs text-zinc-400 leading-relaxed">
                                    <span className="text-zinc-600 font-bold mr-2">W{i+1}</span>
                                    {week}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="md:col-span-2">
                    <DataBox label="First 10 Customers Strategy" className="h-full">
                        <p className="text-base text-zinc-200">{result.gtm_plan.first_10_customers_strategy}</p>
                    </DataBox>
                </div>
            </div>
        </div>

        {/* 5. Pivots (Conditional) - Staggered */}
        {result.idea_pivot_suggestions && result.idea_pivot_suggestions.length > 0 && (
            <div className="animate-slide-up-fade" style={{ animationDelay: '500ms' }}>
                <SectionDivider />
                <SectionTitle>Strategic Pivots</SectionTitle>
                <div className="bg-yellow-950/10 border border-yellow-900/30 p-6 rounded-sm">
                    <p className="text-yellow-600 text-xs mb-4 uppercase tracking-widest font-bold">Score below 55 — Pivot Recommended</p>
                    <div className="grid gap-4">
                        {result.idea_pivot_suggestions.map((pivot, i) => (
                            <div key={i} className="flex gap-4">
                                <span className="text-yellow-700 font-mono">0{i+1}</span>
                                <p className="text-zinc-400 text-sm">{pivot}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* --- ADD-ON FEATURES --- */}
        
        {bonusContent && (
            <>
                <SectionDivider />
                <BonusSection content={bonusContent} finalScore={result.confidence_score} />
            </>
        )}

        <InvestorSimulator idea={originalIdea} />
        
        <MonetizationBox idea={originalIdea} />
        
        <IdeaEvolution idea={originalIdea} />

    </div>
  );
};
