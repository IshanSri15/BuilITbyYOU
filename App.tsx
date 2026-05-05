
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { IdeaForm } from './components/IdeaForm';
import { ResultsDisplay } from './components/ResultsDisplay';
import { Loader } from './components/Loader';
import { VoiceAssistant } from './components/VoiceAssistant';
import { validateStartupIdea, generatePmModeResponse, generateConsumerInsightResponse } from './services/geminiService';
import { type ValidationResult, type PmReport, type ConsumerInsightReport } from './types';
import { PmModeDisplay } from './components/PmModeDisplay'; // New import
import { ConsumerInsightDisplay } from './components/ConsumerInsightDisplay';

const PM_MODE_ACTIVATION_TRIGGERS = [
  "activate product manager mode", "pm mode", "enter pm mode", "pm on", "generate as product manager", "🐂 pm", "🐂 mode", "bull mode", "activate 🐂", "pm 🐂", "bull pm"
];
const PM_MODE_DEACTIVATION_TRIGGERS = [
  "exit pm mode", "pm off", "deactivate product manager mode", "exit pm", "🐂 off", "deactivate 🐂", "bull off"
];

const CONSUMER_MODE_ACTIVATION_TRIGGERS = [
  "activate consumer insight mode", "consumer insight mode", "consumer mode", "insight mode", "consumer insights"
];
const CONSUMER_MODE_DEACTIVATION_TRIGGERS = [
  "exit consumer mode", "consumer off", "deactivate consumer insight mode", "exit insights"
];

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [idea, setIdea] = useState<string>('');
  const [isVoiceMode, setIsVoiceMode] = useState<boolean>(false);
  
  // New state for PM Mode
  const [isPmModeActive, setIsPmModeActive] = useState<boolean>(false);
  const [pmModeContent, setPmModeContent] = useState<PmReport | null>(null);

  // New state for Consumer Insight Mode
  const [isConsumerModeActive, setIsConsumerModeActive] = useState<boolean>(false);
  const [consumerModeContent, setConsumerModeContent] = useState<ConsumerInsightReport | null>(null);

  const handleValidate = useCallback(async (ideaToValidate: string, imageFile?: File) => {
    const normalizedIdea = ideaToValidate.trim().toLowerCase();

    // Check for PM mode activation/deactivation
    if (PM_MODE_ACTIVATION_TRIGGERS.some(trigger => normalizedIdea.includes(trigger))) {
      setIsPmModeActive(true);
      setPmModeContent(null);
      setResult(null); // Clear previous validation results
      setIsConsumerModeActive(false); // Deactivate Consumer mode if active
      setError('Product Manager Mode Activated. How can I help you improve a product?');
      setIsLoading(false);
      return;
    }
    if (PM_MODE_DEACTIVATION_TRIGGERS.some(trigger => normalizedIdea.includes(trigger))) {
      setIsPmModeActive(false);
      setPmModeContent(null);
      setResult(null); // Clear previous validation results
      setError('Product Manager Mode Deactivated. Ready for idea validation.');
      setIsLoading(false);
      return;
    }

    // Check for Consumer mode activation/deactivation
    if (CONSUMER_MODE_ACTIVATION_TRIGGERS.some(trigger => normalizedIdea.includes(trigger))) {
      setIsConsumerModeActive(true);
      setConsumerModeContent(null);
      setResult(null);
      setIsPmModeActive(false); // Deactivate PM mode if active
      setError('Product Consumer Insight Mode Activated. Provide product data for analysis.');
      setIsLoading(false);
      return;
    }
    if (CONSUMER_MODE_DEACTIVATION_TRIGGERS.some(trigger => normalizedIdea.includes(trigger))) {
      setIsConsumerModeActive(false);
      setConsumerModeContent(null);
      setResult(null);
      setError('Product Consumer Insight Mode Deactivated. Ready for idea validation.');
      setIsLoading(false);
      return;
    }

    if (!ideaToValidate.trim()) {
      setError('Please describe your startup idea.');
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      if (isPmModeActive) {
        // PM Mode is active, generate PM response
        const pmResult = await generatePmModeResponse(ideaToValidate);
        setPmModeContent(pmResult);
        setResult(null); // Ensure validation results are cleared
      } else if (isConsumerModeActive) {
        // Consumer Mode is active
        const consumerResult = await generateConsumerInsightResponse(ideaToValidate);
        setConsumerModeContent(consumerResult);
        setResult(null);
      } else {
        // Regular validation mode
        let imageBase64: string | undefined;
        let imageMimeType: string | undefined;

        if (imageFile) {
          const reader = new FileReader();
          imageBase64 = await new Promise((resolve, reject) => {
            reader.onload = () => {
               const result = reader.result as string;
               // Remove Data URL prefix to get raw base64
               const base64 = result.split(',')[1];
               resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(imageFile);
          });
          imageMimeType = imageFile.type;
        }

        const validationResult = await validateStartupIdea(ideaToValidate, imageBase64, imageMimeType);
        setResult(validationResult);
        setPmModeContent(null); // Ensure PM content is cleared
      }
    } catch (e) {
      console.error(e);
      let errorMessage = 'Failed to process idea. The AI may be busy. Please try again.';
      if (e instanceof Error) {
        if (e.message.toLowerCase().includes('api key not valid')) {
            errorMessage = 'Your API key is invalid. Please check your configuration.';
        } else if (e.message.toLowerCase().includes('quota')) {
            errorMessage = 'You have exceeded your API quota. Please check your billing or try again later.';
        } else if (e.message.toLowerCase().includes("invalid json")) {
            errorMessage = "The AI returned an invalid response. Let's try that again."
        }
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isPmModeActive]); // Depend on isPmModeActive

  const handleVoiceClose = useCallback((transcript?: string) => {
    setIsVoiceMode(false);
    if (transcript && transcript.trim()) {
      setIdea(transcript);
      // Voice mode doesn't support image upload yet, and we won't implement PM mode for voice now.
      handleValidate(transcript);
    }
  }, [handleValidate]);

  return (
    <div className="min-h-screen bg-black text-gray-200 antialiased">
      <div className="container mx-auto px-4 py-8 md:py-16 max-w-3xl animate-fade-in">
        <Header onVoiceClick={() => setIsVoiceMode(true)} isPmModeActive={isPmModeActive} />
        <main>
          <IdeaForm
            idea={idea}
            setIdea={setIdea}
            onValidate={(image) => handleValidate(idea, image)}
            isLoading={isLoading}
          />

          {error && (
            <div className="mt-8 text-center bg-red-900/50 border border-red-500/50 text-red-300 p-4 rounded-xl animate-fade-in">
              <p>{error}</p>
            </div>
          )}
          
          {isLoading && <Loader />}

          {/* Conditional rendering for PM Mode or regular Results */}
          {isPmModeActive && pmModeContent && !isVoiceMode && (
            <div className="mt-12">
              <PmModeDisplay report={pmModeContent} />
            </div>
          )}

          {isConsumerModeActive && consumerModeContent && !isVoiceMode && (
            <div className="mt-12">
              <ConsumerInsightDisplay report={consumerModeContent} />
            </div>
          )}

          {result && !isPmModeActive && !isConsumerModeActive && !isVoiceMode && (
            <div className="mt-12">
              <ResultsDisplay result={result} originalIdea={idea} />
            </div>
          )}
        </main>
        
        {isVoiceMode && <VoiceAssistant onClose={handleVoiceClose} />}

        <footer className="text-center mt-16 text-zinc-600 text-sm animate-fade-in" style={{ animationDelay: '200ms' }}>
          <p>&copy; {new Date().getFullYear()} BuildIT. AI-powered analysis.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;