
import React from 'react';
import { type ConsumerInsightReport } from '../types';

interface ConsumerInsightDisplayProps {
  report: ConsumerInsightReport;
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
        <span className="text-blue-500 font-bold">•</span>
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

export const ConsumerInsightDisplay: React.FC<ConsumerInsightDisplayProps> = ({ report }) => {
  return (
    <div className="max-w-5xl mx-auto py-12 space-y-8 animate-fade-in">
      <div className="flex flex-col items-center mb-12">
        <div className="text-[10px] uppercase tracking-[0.3em] font-black text-blue-500 mb-2">
          Consumer Behavior Analysis
        </div>
        <h2 className="text-3xl font-light text-white tracking-tight text-center">
          Product Consumer Insight Report
        </h2>
        <div className="h-px w-24 bg-blue-500/30 mt-6" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="Target Consumer Profile" delay={100}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block">Age Group</span>
                <span className="text-zinc-100">{report.targetConsumerProfile.ageGroup}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block">Gender</span>
                <span className="text-zinc-100">{report.targetConsumerProfile.genderDistribution}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block">Income</span>
                <span className="text-zinc-100">{report.targetConsumerProfile.incomeLevel}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block">Location</span>
                <span className="text-zinc-100">{report.targetConsumerProfile.geographicLocation}</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block mb-2">Lifestyle Traits</span>
              <div className="flex flex-wrap gap-2">
                {report.targetConsumerProfile.lifestyleTraits.map((trait, i) => (
                  <span key={i} className="bg-blue-500/10 text-blue-400 text-[10px] px-2 py-1 rounded-full border border-blue-500/20">
                    {trait}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block mb-2">Interests & Behaviors</span>
              <div className="flex flex-wrap gap-2">
                {report.targetConsumerProfile.interestsAndBehaviors.map((interest, i) => (
                  <span key={i} className="bg-zinc-800 text-zinc-300 text-[10px] px-2 py-1 rounded-full border border-zinc-700">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section title="Ideal Customer Segment" delay={200}>
          <p className="text-lg font-light text-zinc-100 italic leading-snug">
            "{report.idealCustomerSegment}"
          </p>
        </Section>

        <Section title="Consumer Needs" delay={300}>
          <List items={report.consumerNeeds} />
        </Section>

        <Section title="Consumer Pain Points" delay={400}>
          <List items={report.consumerPainPoints} />
        </Section>

        <Section title="Product Improvement Suggestions" delay={500}>
          <List items={report.productImprovementSuggestions} />
        </Section>

        <Section title="Feature Opportunities" delay={600}>
          <List items={report.featureOpportunities} />
        </Section>

        <div className="md:col-span-2">
          <Section title="Value Proposition for Consumers" delay={700}>
            <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-lg">
              <p className="text-blue-50 text-base font-light leading-relaxed">
                {report.valueProposition}
              </p>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
};
