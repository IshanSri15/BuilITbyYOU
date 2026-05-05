
export interface CriteriaScores {
  market_timing: number;
  product_value: number;
  execution_feasibility: number;
  competition_risk: number;
  monetization_potential: number;
}

export interface SWOT {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface BusinessModelCanvas {
  value_propositions: string;
  customer_segments: string;
  revenue_streams: string;
  cost_structure: string;
}

export interface GTMPlan {
  timeline_estimator_5_weeks: string[];
  first_10_customers_strategy: string;
}

// --- NEW FEATURE: Core Analysis ---
export interface CoreAnalysis {
  problem_clarity: string;
  market_demand: {
    level: 'Low' | 'Medium' | 'High';
    reasoning: string;
  };
  competition: {
    level: 'Low' | 'Medium' | 'High';
    example: string;
  };
  execution_risk: string[];
}

export interface RoadmapItem {
  priority: 'P1' | 'P2' | 'P3';
  action: string;
  rationale: string;
}

export interface PmReport {
  productDefinition: string;
  targetUsers: string;
  problemsIdentified: string[];
  fixActionList: string[];
  workflowImprovements: string[];
  featureSuggestions: string[];
  marketPositioning: string;
  monetizationStrategy: string;
  roadmap: RoadmapItem[];
  kpis: string[];
  churnReasons: string[];
  investorInsight: string;
}

export interface ConsumerProfile {
  ageGroup: string;
  genderDistribution: string;
  incomeLevel: string;
  geographicLocation: string;
  lifestyleTraits: string[];
  interestsAndBehaviors: string[];
}

export interface ConsumerInsightReport {
  targetConsumerProfile: ConsumerProfile;
  idealCustomerSegment: string;
  consumerNeeds: string[];
  consumerPainPoints: string[];
  productImprovementSuggestions: string[];
  featureOpportunities: string[];
  valueProposition: string;
}

export interface ValidationResult {
  confidence_score: number; // 0-10
  kill_or_proceed_warning: string;
  core_analysis: CoreAnalysis; // Added new field
  criteria_scores: CriteriaScores;
  swot_analysis: SWOT;
  business_model_canvas: BusinessModelCanvas;
  traction_simulator_18mo: string; // Text table
  cost_rough_estimate: string;
  gtm_plan: GTMPlan;
  idea_pivot_suggestions?: string[]; // Only if score < 5.5
  industry_benchmark_comparison: string;
}

export interface GeneratedIdea {
  generated_idea_name: string;
  generated_idea_description: string;
  suggested_market_code: string;
}

// --- ADD-ON INTERFACES ---

export interface StartupName {
  name: string;
  tagline: string;
}

export interface Competitor {
  name: string;
  differentiation: string;
  whitespace_opportunity: string;
}

export interface ShareableData {
  risk_level: string;
  top_fix: string;
  category: string;
}

export interface BonusContent {
  names: StartupName[];
  competitors: Competitor[];
  shareable_data: ShareableData;
}

export interface InvestorFeedback {
  investor_name: string;
  feedback: string;
  hard_question: string;
  verdict: string; // "I'm out" or Offer details
}

export interface InvestorSimulationResult {
  feedbacks: InvestorFeedback[];
}

export interface EvolutionIteration {
  iteration_title: string;
  changes: string;
  reasoning: string;
  projected_score_impact: string;
}

export interface EvolutionResult {
  iterations: EvolutionIteration[];
}

export interface MonetizationStrategy {
  primaryModel: string;
  additionalStreams: string[];
  pricingStrategy: string;
  targetPayingCustomer: string;
  marketBenchmark: string;
  scalableOpportunities: string;
}
