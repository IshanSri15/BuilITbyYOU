
import React, { useRef, useState } from 'react';
// Fix: 'generateRandomIdea' is not an exported member of '../services/geminiService'.
// Changed to import 'generateRandomStartupIdea'.
import { generateRandomStartupIdea } from '../services/geminiService';

interface IdeaFormProps {
  idea: string;
  setIdea: (idea: string) => void;
  onValidate: (image?: File) => void;
  isLoading: boolean;
}

const ImageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

const DiceIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="m16 8 2-2"/><path d="m8 16-2 2"/><path d="m8 8-2 2"/><path d="m16 16 2 2"/><circle cx="12" cy="12" r="2"/></svg>
);

export const IdeaForm: React.FC<IdeaFormProps> = ({ idea, setIdea, onValidate, isLoading }) => {
  const [selectedImage, setSelectedImage] = useState<File | undefined>(undefined);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onValidate(selectedImage);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const clearImage = () => {
    setSelectedImage(undefined);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDiceRoll = async () => {
    setIsGenerating(true);
    try {
        // Fix: Call the new generateRandomStartupIdea function.
        const result = await generateRandomStartupIdea();
        // The result contains { generated_idea_name, generated_idea_description, suggested_market_code }
        // We populate the input with the description.
        setIdea(result.generated_idea_description);
        setSelectedImage(undefined); // Clear any attached image for a new generated idea
        setPreviewUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
    } catch (e) {
        console.error("Failed to generate idea", e);
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
            <label htmlFor="startup-idea" className="block text-sm font-medium text-zinc-500 uppercase tracking-wide">
              What are we building?
            </label>
            <button
                type="button"
                onClick={handleDiceRoll}
                disabled={isGenerating || isLoading}
                className="flex items-center gap-2 text-xs text-cyan-500 hover:text-cyan-400 font-mono uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed group active:scale-95 duration-75 ease-out"
            >
                <DiceIcon className={`transition-transform duration-500 ${isGenerating ? "animate-spin" : "group-hover:rotate-180"}`} />
                <span>{isGenerating ? "Rolling..." : "Surprise Me"}</span>
            </button>
        </div>
        <div className="relative group">
            <textarea
              id="startup-idea"
              rows={6}
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="e.g. Uber for dog walking but exclusively for corgis..."
              className="w-full bg-black border border-zinc-800 rounded-sm p-4 text-white placeholder-zinc-700 
                focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.15)] 
                transition-all duration-150 font-light"
              required
            />
            
            <div className="absolute bottom-3 right-3">
                 <input 
                    type="file" 
                    id="image-upload" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    className="hidden"
                    ref={fileInputRef}
                  />
                  <label 
                    htmlFor="image-upload" 
                    className="cursor-pointer flex items-center gap-2 text-zinc-500 hover:text-white transition-colors bg-zinc-900/80 p-2 rounded-full border border-zinc-800 backdrop-blur-sm"
                    title="Attach a sketch or diagram"
                  >
                    <ImageIcon />
                  </label>
            </div>
        </div>

        {previewUrl && (
          <div className="relative inline-block mt-2 animate-fade-in">
            <img src={previewUrl} alt="Preview" className="h-24 w-auto rounded border border-zinc-700 object-cover" />
            <button
              type="button"
              onClick={clearImage}
              className="absolute -top-2 -right-2 bg-zinc-800 text-white rounded-full p-1 border border-zinc-600 hover:bg-zinc-700"
            >
              <XIcon />
            </button>
            <p className="text-xs text-zinc-500 mt-1">Image attached</p>
          </div>
        )}
      </div>
      
      <div>
        <button
          type="submit"
          disabled={isLoading || isGenerating}
          className="w-full flex justify-center items-center bg-white text-black font-bold py-4 px-6 rounded-sm text-lg 
            hover:bg-cyan-50 hover:shadow-[0_0_10px_rgba(255,255,255,0.3)]
            active:scale-[0.98] active:brightness-110 
            transition-all duration-75 ease-out
            disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none tracking-tight"
        >
          {isLoading ? 'ANALYZING...' : 'VALIDATE IDEA'}
        </button>
      </div>
    </form>
  );
};
