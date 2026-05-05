
import React from 'react';
import { type PmReport } from '../types';

interface PmModeDisplayProps {
  report: PmReport;
}

const Section: React.FC<{ title: string; children: React.ReactNode; delay: number }> = ({ title, children, delay }) => (
  <div 
    className="bg-zinc-900/40 border border-zinc-800/50 p-6 rounded-xl animate-slide-up-fade" 
    style={{ animationDelay: `${delay}ms` }}
  >
    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 border-b border-zinc-800 pb-2">
      {title}
    </h3>
    <div className="text-zinc-200 text-sm leading-relaxed">
      {children}
    </div>
  </div>
);

const List: React.FC<{ items: string[] }> = ({ items }) => (
  <ul className="space-y-2">
    {items.map((item, i) => (
      <li key={i} className="flex gap-3">
        <span className="text-emerald-500 font-bold">•</span>
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

export const PmModeDisplay: React.FC<PmModeDisplayProps> = ({ report }) => {
  return (
    <div className="max-w-5xl mx-auto py-12 space-y-8 animate-fade-in">
      <div className="flex flex-col items-center mb-12">
        <div className="text-[10px] uppercase tracking-[0.3em] font-black text-emerald-500 mb-2">
          Intelligence Report
        </div>
        <h2 className="text-3xl font-light text-white tracking-tight text-center">
          Product Strategy & Market Intelligence
        </h2>
        <div className="h-px w-24 bg-emerald-500/30 mt-6" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="Product Definition" delay={100}>
          <p className="text-lg font-light text-zinc-100 italic leading-snug">
            "{report.productDefinition}"
          </p>
        </Section>

        <Section title="Target Users" delay={200}>
          <p>{report.targetUsers}</p>
        </Section>

        <Section title="Problems Identified" delay={300}>
          <List items={report.problemsIdentified} />
        </Section>

        <Section title="Fix Action List" delay={400}>
          <List items={report.fixActionList} />
        </Section>

        <Section title="Workflow Improvements" delay={500}>
          <List items={report.workflowImprovements} />
        </Section>

        <Section title="Feature Suggestions" delay={600}>
          <List items={report.featureSuggestions} />
        </Section>

        <Section title="Market Positioning" delay={700}>
          <p>{report.marketPositioning}</p>
        </Section>

        <Section title="Monetization Strategy" delay={800}>
          <p>{report.monetizationStrategy}</p>
        </Section>

        <Section title="Roadmap Strategy" delay={900}>
          <div className="space-y-4">
            {report.roadmap.map((item, i) => (
              <div key={i} className="border-l-2 border-emerald-500/20 pl-4 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    item.priority === 'P1' ? 'bg-emerald-500/20 text-emerald-400' : 
                    item.priority === 'P2' ? 'bg-amber-500/20 text-amber-400' : 
                    'bg-zinc-500/20 text-zinc-400'
                  }`}>
                    {item.priority}
                  </span>
                  <span className="font-bold text-zinc-100">{item.action}</span>
                </div>
                <p className="text-xs text-zinc-400">{item.rationale}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Key Performance Indicators" delay={1000}>
          <List items={report.kpis} />
        </Section>

        <Section title="Churn Signals" delay={1100}>
          <List items={report.churnReasons} />
        </Section>

        <div className="md:col-span-2">
          <Section title="Investor Insight" delay={1200}>
            <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-lg">
              <p className="text-emerald-50 text-base font-light leading-relaxed">
                {report.investorInsight}
              </p>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
};
