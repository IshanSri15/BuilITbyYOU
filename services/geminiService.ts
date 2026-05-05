
import { GoogleGenAI, Type } from "@google/genai";
import { type ValidationResult, type GeneratedIdea, type BonusContent, type InvestorSimulationResult, type EvolutionResult, type PmReport, type ConsumerInsightReport, type MonetizationStrategy } from '../types';
import { withRetry } from '../utils/api'; // Import the new retry utility

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// DICE_TRIGGERS are now handled in IdeaForm, this list is largely for documentation or if direct input bypasses IdeaForm.
const DICE_TRIGGERS = [
  '🎲',
  'dice',
  'random idea',
  'surprise me',
  'give me an idea',
  'roll dice',
  'random startup',
  'idea dice'
];

// --- Validation Logic ---

const validationResponseSchema = {
    type: Type.OBJECT,
    properties: {
        confidence_score: { type: Type.NUMBER, description: "0-10 score (e.g. 7.2). This is the final verdict average." },
        kill_or_proceed_warning: { type: Type.STRING, description: "Blunt, direct verdict. No fluff." },
        core_analysis: {
            type: Type.OBJECT,
            properties: {
                problem_clarity: { type: Type.STRING, description: "Short, clear explanation of the problem using simple language." },
                market_demand: {
                    type: Type.OBJECT,
                    properties: {
                        level: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
                        reasoning: { type: Type.STRING, description: "1-2 lines of reasoning." }
                    },
                    required: ["level", "reasoning"]
                },
                competition: {
                    type: Type.OBJECT,
                    properties: {
                        level: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
                        example: { type: Type.STRING, description: "One example type of competitor." }
                    },
                    required: ["level", "example"]
                },
                execution_risk: { type: Type.ARRAY, items: { type: Type.STRING }, description: "2-3 bullet points on key risks (tech, cost, adoption, regulation)." }
            },
            required: ["problem_clarity", "market_demand", "competition", "execution_risk"]
        },
        criteria_scores: {
            type: Type.OBJECT,
            properties: {
                market_timing: { type: Type.NUMBER, description: "1-10" },
                product_value: { type: Type.NUMBER, description: "1-10" },
                execution_feasibility: { type: Type.NUMBER, description: "1-10" },
                competition_risk: { type: Type.NUMBER, description: "1-10 (10 is Low Risk/Good, 1 is High Risk/Bad)" },
                monetization_potential: { type: Type.NUMBER, description: "1-10" }
            },
            required: ["market_timing", "product_value", "execution_feasibility", "competition_risk", "monetization_potential"]
        },
        swot_analysis: {
            type: Type.OBJECT,
            properties: {
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
                threats: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["strengths", "weaknesses", "opportunities", "threats"]
        },
        business_model_canvas: {
            type: Type.OBJECT,
            properties: {
                value_propositions: { type: Type.STRING, description: "Concise summary." },
                customer_segments: { type: Type.STRING, description: "Concise summary." },
                revenue_streams: { type: Type.STRING, description: "Concise summary." },
                cost_structure: { type: Type.STRING, description: "Concise summary." }
            },
            required: ["value_propositions", "customer_segments", "revenue_streams", "cost_structure"]
        },
        traction_simulator_18mo: { type: Type.STRING, description: "A Markdown table string using pipes (|) for Month 6, 12, 18 projections of Revenue and Users." },
        cost_rough_estimate: { type: Type.STRING, description: "Estimated monthly burn rate range (e.g. $2k - $5k)." },
        gtm_plan: {
            type: Type.OBJECT,
            properties: {
                timeline_estimator_5_weeks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Week 1 to Week 5 high level tasks." },
                first_10_customers_strategy: { type: Type.STRING, description: "Specific tactic to get first 10 paying users." }
            },
            required: ["timeline_estimator_5_weeks", "first_10_customers_strategy"]
        },
        idea_pivot_suggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "2-3 Pivot ideas if score < 5.5. Else empty." },
        industry_benchmark_comparison: { type: Type.STRING, description: "1 sentence comparing to industry average." }
    },
    required: [
        "confidence_score",
        "kill_or_proceed_warning",
        "core_analysis",
        "criteria_scores",
        "swot_analysis",
        "business_model_canvas",
        "traction_simulator_18mo",
        "cost_rough_estimate",
        "gtm_plan",
        "industry_benchmark_comparison"
    ]
};

const validationSystemInstruction = `You are **BuildIT AI**, a Senior Partner at a top-tier VC firm.

**TONE & RULES:**

1.  **Persona:** You are a senior partner at a VC firm who has seen it all—the good, the bad, and the founders who mistake confidence for competence. Your humor is dry, often undercutting, and based on objective reality. No participation trophies here.

2.  **Scoring Standard:** All scores are out of a full **10 points** (1.0 to 10.0). Think of it this way:
    *   **1-3 (Catastrophe):** "This idea has the market viability of a handwritten fax. You're losing money just thinking about it."
    *   **4-6 (Needs Therapy):** "It has legs, but they're broken. Requires major pivots and heavy sedation before launch."
    *   **7-8 (Decent):"A solid B+. Not revolutionary, but profitable. It's the startup equivalent of a comfortable sedan—reliable, but don't expect a parade."
    *   **9-10 (Unicorn Territory):** "Stop reading this. Go build it. If you fail, it's probably your fault, not the idea's."

3.  **Output Rule:** Ensure the 'confidence_score' field in the JSON structure accurately reflects the average of the 5 pillars, using one decimal point (e.g., 7.2).

**CRITICAL FORMATTING:**
- "competition_risk": Score 1-10. 1 = Extreme Competition (Bad), 10 = Blue Ocean (Good).
- "traction_simulator_18mo": Format as a clean text table with headers: | Metric | Month 6 | Month 12 | Month 18 |.
- "problem_clarity": Use extremely simple, clear language.
- Fill all fields in the JSON schema based on this persona.
`;

export const validateStartupIdea = async (idea: string, imageBase64?: string, imageMimeType?: string): Promise<ValidationResult> => {
  // The idea generation is now handled by `generateRandomStartupIdea` in IdeaForm.
  // This function will always receive the actual idea string to validate.
  const prompt = `Analyze this startup idea: "${idea}"`;
  
  const contents: any[] = [{ text: prompt }];
  
  // Fix: Corrected typo from imageBase6664 to imageBase64
  if (imageBase64 && imageMimeType) {
    contents.unshift({
        inlineData: {
            mimeType: imageMimeType,
            data: imageBase64
        }
    });
  }

  try {
    const response = await withRetry(async () => {
      return await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: contents,
        config: {
          systemInstruction: validationSystemInstruction,
          responseMimeType: "application/json",
          responseSchema: validationResponseSchema,
          thinkingConfig: { thinkingBudget: 32768 },
        },
      });
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    
    if (typeof result.confidence_score !== 'number' || !result.kill_or_proceed_warning) {
        throw new Error("Invalid JSON structure received from API.");
    }

    return result as ValidationResult;
  } catch (error) {
    console.error("Error calling Gemini API for validation:", error);
    if(error instanceof Error && error.message.includes('JSON')){
        throw new Error("Invalid JSON structure received from API.");
    }
    throw new Error(`Failed to get validation from AI service: ${error instanceof Error ? error.message : String(error)}`);
  }
};


// --- Generator Logic (Dice Roll) ---
// Fix: Separated system instruction for idea generation
const GENERATOR_SYSTEM_INSTRUCTION = `You are **BuildIT Idea Generator**, a creative and strategic engine. Your sole function is to generate one novel, actionable startup idea based on the intersection of a niche industry and a high-potential trend.

**TASK**: Generate a completely NEW, high-potential startup idea specifically for the Indian Market in 2025.
**TRENDS TO LEVERAGE**: UPSC/NEET/JEE Prep, Hyper-local services (Tier-2/3), SMB SaaS tools, Quick Commerce, WhatsApp Commerce, Creator Economy (Instagram/Reels).
**OUTPUT RULE**: You must return a single, complete JSON object.`;

const generatorResponseSchema = {
  type: Type.OBJECT,
  properties: {
    generated_idea_name: { type: Type.STRING, description: "A clever, unique name for the startup idea." },
    generated_idea_description: { type: Type.STRING, description: "One compelling sentence describing the high-value problem and the innovative solution." },
    suggested_market_code: { type: Type.STRING, description: "A single word for the market niche (e.g., PropTech, EdTech, FinTech, GovTech)." },
  },
  required: ["generated_idea_name", "generated_idea_description", "suggested_market_code"],
};

export const generateRandomStartupIdea = async (): Promise<GeneratedIdea> => {
  // Simplified prompt as detailed instructions are in systemInstruction
  const prompt = `Generate a novel startup idea now, leveraging the specified trends for the Indian market.`;

  try {
    const response = await withRetry(async () => {
      return await ai.models.generateContent({
        model: "gemini-3-flash-preview", // Use a flash model for generation
        contents: prompt,
        config: {
          systemInstruction: GENERATOR_SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: generatorResponseSchema,
        },
      });
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    
    if (!result.generated_idea_name || !result.generated_idea_description) {
      throw new Error("Invalid JSON structure received for generated idea.");
    }

    return result as GeneratedIdea;
  } catch (error) {
    console.error("Error generating random startup idea:", error);
    throw new Error(`Failed to generate random startup idea from AI service: ${error instanceof Error ? error.message : String(error)}`);
  }
};


// --- PM Mode Logic ---

const pmReportSchema = {
  type: Type.OBJECT,
  properties: {
    productDefinition: { type: Type.STRING },
    targetUsers: { type: Type.STRING },
    problemsIdentified: { type: Type.ARRAY, items: { type: Type.STRING } },
    fixActionList: { type: Type.ARRAY, items: { type: Type.STRING } },
    workflowImprovements: { type: Type.ARRAY, items: { type: Type.STRING } },
    featureSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
    marketPositioning: { type: Type.STRING },
    monetizationStrategy: { type: Type.STRING },
    roadmap: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          priority: { type: Type.STRING, enum: ["P1", "P2", "P3"] },
          action: { type: Type.STRING },
          rationale: { type: Type.STRING }
        },
        required: ["priority", "action", "rationale"]
      }
    },
    kpis: { type: Type.ARRAY, items: { type: Type.STRING } },
    churnReasons: { type: Type.ARRAY, items: { type: Type.STRING } },
    investorInsight: { type: Type.STRING }
  },
  required: [
    "productDefinition", "targetUsers", "problemsIdentified", "fixActionList",
    "workflowImprovements", "featureSuggestions", "marketPositioning",
    "monetizationStrategy", "roadmap", "kpis", "churnReasons", "investorInsight"
  ]
};

const PM_MODE_SYSTEM_INSTRUCTION = `You are a senior Product Manager and SaaS Architect working on a platform called "Build It" — an AI startup idea validation tool.

Your role is to analyze raw customer data and produce a deep, structured product intelligence report.

When given raw data (reviews, interviews, feedback, research notes), you must:
- Extract recurring patterns and themes
- Identify specific pain points (not vague summaries)
- Detect feature gaps from user wishes and complaints
- Identify churn reasons (stated or inferred)
- Suggest measurable KPIs
- Recommend MVP and product improvements
- Think like both an investor and a builder

STRICT OUTPUT RULES:
- Output ONLY a valid JSON object
- No preamble, no explanation, no markdown code fences
- No text before or after the JSON
- Do not write \`\`\`json — just the raw { } object`;

export const generatePmModeResponse = async (data: string): Promise<PmReport> => {
  const prompt = `You are running in Product Manager Mode.

Analyze the customer data below and return a full product intelligence report as a raw JSON object.

INPUT TYPE: mixed (reviews + interviews + feedback + market research)
PRODUCT: Build It — B2B SaaS startup idea validation platform
STAGE: growth stage

ANALYSIS FOCUS:
- What are users actually paying for vs complaining about?
- What are the top churn signals?
- What feature gaps exist vs competitors?
- What should be fixed before the next funding round?
- What does this data tell investors about market fit?

DATA TO ANALYZE:
${data}`;

  try {
    const response = await withRetry(async () => {
      return await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: prompt,
        config: {
          systemInstruction: PM_MODE_SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: pmReportSchema,
        },
      });
    });
    return JSON.parse(response.text.trim()) as PmReport;
  } catch (error) {
    console.error("Error generating PM mode response:", error);
    throw new Error(`Failed to generate PM mode response from AI service: ${error instanceof Error ? error.message : String(error)}`);
  }
};


// --- Product Consumer Insight Mode Logic ---

const consumerInsightSchema = {
  type: Type.OBJECT,
  properties: {
    targetConsumerProfile: {
      type: Type.OBJECT,
      properties: {
        ageGroup: { type: Type.STRING },
        genderDistribution: { type: Type.STRING },
        incomeLevel: { type: Type.STRING },
        geographicLocation: { type: Type.STRING },
        lifestyleTraits: { type: Type.ARRAY, items: { type: Type.STRING } },
        interestsAndBehaviors: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["ageGroup", "genderDistribution", "incomeLevel", "geographicLocation", "lifestyleTraits", "interestsAndBehaviors"]
    },
    idealCustomerSegment: { type: Type.STRING },
    consumerNeeds: { type: Type.ARRAY, items: { type: Type.STRING } },
    consumerPainPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
    productImprovementSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
    featureOpportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
    valueProposition: { type: Type.STRING }
  },
  required: [
    "targetConsumerProfile", "idealCustomerSegment", "consumerNeeds",
    "consumerPainPoints", "productImprovementSuggestions", "featureOpportunities", "valueProposition"
  ]
};

const CONSUMER_INSIGHT_SYSTEM_INSTRUCTION = `You are an expert Product Manager, Consumer Behavior Analyst, and Market Research Specialist.

Your task is to analyze product information, user feedback, customer reviews, and research notes to identify the ideal consumer profile and product improvement insights.

When given raw data, you must:
- Extract recurring patterns and themes
- Identify specific consumer needs and expectations
- Detect pain points and frustrations
- Recommend product improvements and feature opportunities
- Define the target consumer profile in detail

STRICT OUTPUT RULES:
- Output ONLY a valid JSON object
- No preamble, no explanation, no markdown code fences
- No text before or after the JSON`;

export const generateConsumerInsightResponse = async (data: string): Promise<ConsumerInsightReport> => {
  const prompt = `You are running in Product Consumer Insight Mode.

Analyze the input data below and return a full consumer insight report as a raw JSON object.

INPUT DATA:
${data}`;

  try {
    const response = await withRetry(async () => {
      return await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: prompt,
        config: {
          systemInstruction: CONSUMER_INSIGHT_SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: consumerInsightSchema,
        },
      });
    });
    return JSON.parse(response.text.trim()) as ConsumerInsightReport;
  } catch (error) {
    console.error("Error generating Consumer Insight response:", error);
    throw new Error(`Failed to generate Consumer Insight response from AI service: ${error instanceof Error ? error.message : String(error)}`);
  }
};


// 4. Monetization Strategy
const monetizationSchema = {
    type: Type.OBJECT,
    properties: {
        primaryModel: { type: Type.STRING },
        additionalStreams: { type: Type.ARRAY, items: { type: Type.STRING } },
        pricingStrategy: { type: Type.STRING },
        targetPayingCustomer: { type: Type.STRING },
        marketBenchmark: { type: Type.STRING },
        scalableOpportunities: { type: Type.STRING }
    },
    required: ["primaryModel", "additionalStreams", "pricingStrategy", "targetPayingCustomer", "marketBenchmark", "scalableOpportunities"]
};

export const generateMonetizationStrategy = async (idea: string): Promise<MonetizationStrategy> => {
    try {
        const response = await withRetry(async () => {
          return await ai.models.generateContent({
              model: "gemini-3-pro-preview",
              contents: `Analyze monetization for: "${idea}"`,
              config: {
                  systemInstruction: `You are a Startup Strategist and SaaS Monetization Consultant. 
                  Analyze the startup idea and generate clear monetization strategies.
                  1. Primary Model: Explain the main revenue model.
                  2. Additional Streams: Suggest secondary ways to generate income.
                  3. Pricing Strategy: Suggest possible pricing tiers or logic.
                  4. Target Paying Customer: Identify who is most likely to pay.
                  5. Market Benchmark: Mention similar companies/models.
                  6. Scalable Opportunities: Explain how to scale revenue in the future.`,
                  responseMimeType: "application/json",
                  responseSchema: monetizationSchema
              }
          });
        });
        return JSON.parse(response.text.trim()) as MonetizationStrategy;
    } catch (e) {
        console.error("Monetization strategy error:", e);
        throw new Error(`Failed to generate monetization strategy: ${e instanceof Error ? e.message : String(e)}`);
    }
};

// 1. Bonus Content (Names, Competitors, Shareable)
const bonusSchema = {
    type: Type.OBJECT,
    properties: {
        names: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    tagline: { type: Type.STRING }
                },
                required: ["name", "tagline"]
            }
        },
        competitors: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    differentiation: { type: Type.STRING },
                    whitespace_opportunity: { type: Type.STRING }
                },
                required: ["name", "differentiation", "whitespace_opportunity"]
            }
        },
        shareable_data: {
            type: Type.OBJECT,
            properties: {
                risk_level: { type: Type.STRING, description: "Low, Medium, or High" },
                top_fix: { type: Type.STRING, description: "One-line improvement suggestion" },
                category: { type: Type.STRING, description: "B2B, B2C, Marketplace, etc." }
            },
            required: ["risk_level", "top_fix", "category"]
        }
    },
    required: ["names", "competitors", "shareable_data"]
};

export const generateBonusContent = async (idea: string): Promise<BonusContent> => {
    try {
        const response = await withRetry(async () => {
          return await ai.models.generateContent({
              model: "gemini-3-pro-preview",
              contents: `Generate bonus content for: "${idea}"`,
              config: {
                  systemInstruction: `You are a startup branding expert. 
                  1. Generate 3-5 catchy names + taglines.
                  2. Identify 3 competitors/startups in this space, their USP, and the white-space opportunity.
                  3. Provide 'shareable_data' for social media context (Risk, Top Fix, Category).`,
                  responseMimeType: "application/json",
                  responseSchema: bonusSchema
              }
          });
        });
        return JSON.parse(response.text.trim()) as BonusContent;
    } catch (e) {
        console.error("Bonus content error:", e);
        throw new Error(`Failed to generate bonus content: ${e instanceof Error ? e.message : String(e)}`);
    }
};

// 2. Investor Simulator
const investorSchema = {
    type: Type.OBJECT,
    properties: {
        feedbacks: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    investor_name: { type: Type.STRING },
                    feedback: { type: Type.STRING },
                    hard_question: { type: Type.STRING },
                    verdict: { type: Type.STRING, description: "Must start with 'I'm out' or 'Offer: ...'" }
                },
                required: ["investor_name", "feedback", "hard_question", "verdict"]
            }
        }
    },
    required: ["feedbacks"]
};

export const generateInvestorFeedback = async (idea: string, mode: 'US' | 'IN' | 'GLOBAL'): Promise<InvestorSimulationResult> => {
    let investors = "";
    if (mode === 'US') investors = "Mark Cuban, Barbara Corcoran, Kevin O'Leary, Lori Greiner";
    if (mode === 'IN') investors = "Aman Gupta, Peyush Bansal, Anupam Mittal, Namita Thapar";
    if (mode === 'GLOBAL') investors = "Elon Musk, Jeff Bezos, Mukesh Ambani, Jensen Huang";

    try {
        const response = await withRetry(async () => {
          return await ai.models.generateContent({
              model: "gemini-3-pro-preview",
              contents: `Simulate investor feedback for: "${idea}"`,
              config: {
                  systemInstruction: `Roleplay as these investors: ${investors}.
                  For each, provide:
                  - Short feedback in their voice.
                  - 1 Hard Question.
                  - Final Verdict ('I'm out' OR 'Offer: ...').`,
                  responseMimeType: "application/json",
                  responseSchema: investorSchema
              }
          });
        });
        return JSON.parse(response.text.trim()) as InvestorSimulationResult;
    } catch (e) {
        console.error("Investor simulation error:", e);
        throw new Error(`Failed to generate investor feedback: ${e instanceof Error ? e.message : String(e)}`);
    }
};

// 3. Idea Evolution
const evolutionSchema = {
    type: Type.OBJECT,
    properties: {
        iterations: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    iteration_title: { type: Type.STRING },
                    changes: { type: Type.STRING },
                    reasoning: { type: Type.STRING },
                    projected_score_impact: { type: Type.STRING, description: "e.g. +1.5 points" }
                },
                required: ["iteration_title", "changes", "reasoning", "projected_score_impact"]
            }
        }
    },
    required: ["iterations"]
};

export const generateEvolution = async (idea: string): Promise<EvolutionResult> => {
    try {
        const response = await withRetry(async () => {
          return await ai.models.generateContent({
              model: "gemini-3-pro-preview",
              contents: `Iterate on this idea: "${idea}"`,
              config: {
                  systemInstruction: `You are a Product Strategist. Iterate this idea 3 times to improve viability.
                  Do NOT reset the idea, just pivot/evolve it.
                  For each iteration, explain the change and why it improves the score.`,
                  responseMimeType: "application/json",
                  responseSchema: evolutionSchema
              }
          });
        });
        return JSON.parse(response.text.trim()) as EvolutionResult;
    } catch (e) {
        console.error("Evolution error:", e);
        throw new Error(`Failed to generate idea evolution: ${e instanceof Error ? e.message : String(e)}`);
    }
};
