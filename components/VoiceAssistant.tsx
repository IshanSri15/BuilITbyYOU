
import React, { useState, useEffect, useRef, useCallback } from 'react';
// Fix: 'LiveSession' is not an exported member of '@google/genai'.
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { encode, decode, decodeAudioData } from '../utils/audio';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

type TranscriptEntry = {
    speaker: 'user' | 'ai';
    text: string;
};

type VoiceStatus = 'idle' | 'connecting' | 'listening' | 'speaking' | 'error';

const StatusIndicator: React.FC<{ status: VoiceStatus }> = ({ status }) => {
    let text = 'Connecting...';
    let colorClass = 'bg-yellow-500';

    switch (status) {
        case 'listening':
            text = 'Listening...';
            colorClass = 'bg-cyan-500 animate-pulse';
            break;
        case 'speaking':
            text = 'BuildIT Speaking...';
            colorClass = 'bg-purple-500';
            break;
        case 'error':
            text = 'Connection Error';
            colorClass = 'bg-red-500';
            break;
    }

    return (
        <div className="flex items-center justify-center gap-3 text-zinc-500 text-xs uppercase tracking-widest">
            <div className={`w-2 h-2 rounded-full ${colorClass} transition-colors`}></div>
            <span>{text}</span>
        </div>
    );
};

export const VoiceAssistant: React.FC<{ onClose: (transcript?: string) => void }> = ({ onClose }) => {
    const [status, setStatus] = useState<VoiceStatus>('idle');
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    
    const [currentUserInput, setCurrentUserInput] = useState('');
    const [currentAiOutput, setCurrentAiOutput] = useState('');

    // Fix: 'LiveSession' is not an exported member of '@google/genai'. Using 'any' as a fallback.
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const nextStartTimeRef = useRef<number>(0);
    const transcriptContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (transcriptContainerRef.current) {
            transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
        }
    }, [transcript, currentUserInput, currentAiOutput]);

    const cleanup = useCallback(() => {
        console.log("Cleaning up voice assistant...");
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if(scriptProcessorRef.current){
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
            inputAudioContextRef.current.close();
        }
        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
            outputAudioContextRef.current.close();
        }
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close());
            sessionPromiseRef.current = null;
        }
        for (const source of sourcesRef.current.values()) {
          source.stop();
        }
        sourcesRef.current.clear();
    }, []);

    useEffect(() => {
        const startSession = async () => {
            setStatus('connecting');
            try {
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    throw new Error("Browser does not support required media APIs.");
                }
                streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
                
                // Fix: Added type assertion to handle 'webkitAudioContext' for cross-browser compatibility.
                inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                // Fix: Added type assertion to handle 'webkitAudioContext' for cross-browser compatibility.
                outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                nextStartTimeRef.current = 0;
                
                sessionPromiseRef.current = ai.live.connect({
                    model: 'gemini-2.5-flash-native-audio-preview-12-2025', // Updated to latest recommended model
                    callbacks: {
                        onopen: () => {
                            console.log('Live session opened.');
                            setStatus('listening');
                            
                            const source = inputAudioContextRef.current!.createMediaStreamSource(streamRef.current!);
                            scriptProcessorRef.current = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);

                            scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                                const l = inputData.length;
                                const int16 = new Int16Array(l);
                                for (let i = 0; i < l; i++) {
                                  int16[i] = inputData[i] * 32768;
                                }
                                const pcmBlob: Blob = {
                                    data: encode(new Uint8Array(int16.buffer)),
                                    mimeType: 'audio/pcm;rate=16000',
                                };
                                
                                sessionPromiseRef.current?.then((session) => {
                                    session.sendRealtimeInput({ media: pcmBlob });
                                });
                            };
                            source.connect(scriptProcessorRef.current);
                            scriptProcessorRef.current.connect(inputAudioContextRef.current!.destination);
                        },
                        onmessage: async (message: LiveServerMessage) => {
                            if (message.serverContent?.inputTranscription) {
                                setCurrentUserInput(prev => prev + message.serverContent.inputTranscription.text);
                            }
                            if (message.serverContent?.outputTranscription) {
                                setStatus('speaking');
                                setCurrentAiOutput(prev => prev + message.serverContent.outputTranscription.text);
                            }
                             if (message.serverContent?.turnComplete) {
                                setStatus('listening');
                                setTranscript(prev => {
                                    const newTranscript = [...prev];
                                    if(currentUserInput.trim()) newTranscript.push({ speaker: 'user', text: currentUserInput });
                                    if(currentAiOutput.trim()) newTranscript.push({ speaker: 'ai', text: currentAiOutput });
                                    return newTranscript;
                                });
                                setCurrentUserInput('');
                                setCurrentAiOutput('');
                            }

                            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                            if (base64Audio && outputAudioContextRef.current) {
                                const outputCtx = outputAudioContextRef.current;
                                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                                
                                const audioBuffer = await decodeAudioData(
                                    decode(base64Audio),
                                    outputCtx,
                                    24000,
                                    1,
                                );
                                const source = outputCtx.createBufferSource();
                                source.buffer = audioBuffer;
                                source.connect(outputCtx.destination);
                                source.addEventListener('ended', () => {
                                    sourcesRef.current.delete(source);
                                    if (sourcesRef.current.size === 0) {
                                       if(status !== 'listening') setStatus('listening');
                                    }
                                });
                                source.start(nextStartTimeRef.current);
                                nextStartTimeRef.current += audioBuffer.duration;
                                sourcesRef.current.add(source);
                            }
                        },
                        onerror: (e: ErrorEvent) => {
                            console.error('Live session error:', e);
                            setStatus('error');
                        },
                        onclose: (e: CloseEvent) => {
                            console.log('Live session closed.');
                            cleanup();
                        },
                    },
                    config: {
                        responseModalities: [Modality.AUDIO],
                        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                        systemInstruction: `You are BuildIT AI, a Brutally Honest Venture Capitalist and Product Manager.

Goal: Grill the founder on their idea to find the weak spots, but also provide a path to fix them.

Tone:
- Direct, no fluff, no corporate speak.
- Skeptical but constructive.
- Ask hard questions about distribution (GTM) and monetization immediately.
- Use short sentences.
- If an idea is vague, say "That's a feature, not a business. How do you make money?"

Start by saying: "I'm BuildIT. I've seen a thousand pitch decks. Why should I care about yours?"`,
                        inputAudioTranscription: {},
                        outputAudioTranscription: {},
                    },
                });

            } catch (err) {
                console.error("Failed to start voice session:", err);
                setStatus('error');
            }
        };

        startSession();

        return () => {
            cleanup();
        };
    }, [cleanup]);

    const handleEndAndAnalyze = () => {
        const fullTranscript = transcript
            .filter(t => t.speaker === 'user')
            .map(t => t.text)
            .join(' ');
        cleanup();
        onClose(fullTranscript + ' ' + currentUserInput);
    };

    const handleClose = () => {
        cleanup();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-50 p-4 animate-fade-in font-sans">
            <div className="bg-black border border-zinc-800 rounded-none w-full max-w-2xl h-full max-h-[80vh] flex flex-col p-8 shadow-2xl shadow-black">
                <div className="flex-shrink-0 mb-8 border-b border-zinc-900 pb-4">
                    <StatusIndicator status={status} />
                </div>
                <div ref={transcriptContainerRef} className="flex-grow overflow-y-auto space-y-6 pr-2">
                    {transcript.map((entry, i) => (
                        <div key={i} className={`flex ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-4 rounded-sm text-sm font-light leading-relaxed tracking-wide ${entry.speaker === 'user' ? 'bg-zinc-900 text-zinc-300' : 'bg-black border border-zinc-800 text-zinc-400'}`}>
                                <p>{entry.text}</p>
                            </div>
                        </div>
                    ))}
                    {currentUserInput && (
                        <div className="flex justify-end">
                            <div className="max-w-[85%] p-4 rounded-sm text-sm font-light leading-relaxed tracking-wide bg-zinc-900/50 text-zinc-500">
                                <p>{currentUserInput}</p>
                            </div>
                        </div>
                    )}
                    {currentAiOutput && (
                        <div className="flex justify-start">
                            <div className="max-w-[85%] p-4 rounded-sm text-sm font-light leading-relaxed tracking-wide bg-black border border-zinc-800 text-zinc-500">
                                <p>{currentAiOutput}</p>
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex-shrink-0 pt-8 space-y-4">
                    <button
                        onClick={handleEndAndAnalyze}
                        disabled={status === 'connecting'}
                        className="w-full bg-white text-black font-bold py-4 px-6 rounded-sm text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed"
                    >
                        Analyze Conversation
                    </button>
                    <button
                        onClick={handleClose}
                        className="w-full text-zinc-500 hover:text-white transition-colors py-2 text-xs uppercase tracking-widest"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};
