import React, { useState } from 'react';
import { useSpeech } from '../../hooks/useSpeech';
import { Mic, Activity, Globe } from 'lucide-react';

const LiveCaptions = () => {
  const [language, setLanguage] = useState('en-US');
  const [caption, setCaption] = useState('Tap to Listen...');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState('');
  const { startListening, isSupported } = useSpeech(language);

  const languages = [
    { code: 'en-US', name: 'English' },
    { code: 'ta-IN', name: 'Tamil' },
    { code: 'kn-IN', name: 'Kannada' },
    { code: 'hi-IN', name: 'Hindi' },
    { code: 'te-IN', name: 'Telugu' },
  ];

  const handleListen = async () => {
    if (!isSupported) {
      setError('Speech recognition not supported in this browser.');
      return;
    }
    if (isListening) return; // Prevent multiple simultaneous listeners

    setError('');
    setIsListening(true);

    const result = await startListening();

    if (result.success && result.transcript) {
      setCaption(result.transcript);
    } else {
      setError(`Speech Recognition failed: ${result.error || 'unknown'}. Tap and try again.`);
    }

    setIsListening(false);
  };

  return (
    <div className="bg-zinc-900 border-4 border-amber-400 rounded-[2rem] p-8 shadow-[0_20px_50px_rgba(251,191,36,0.2)] transition-all">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 text-amber-400">
          <Activity className={isListening ? "animate-bounce" : ""} />
          <span className="font-black text-sm uppercase tracking-widest">Live Transcriber</span>
        </div>
        <div className="flex items-center gap-3">
          <Globe size={20} className="text-amber-400" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-zinc-800 text-white border border-amber-400 rounded-lg px-3 py-1 text-sm"
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
        </div>
      </div>
      
      <p className="text-4xl font-black text-white leading-tight min-h-[120px] mb-8">
        "{caption}"
      </p>
      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

      <button 
        onClick={handleListen}
        disabled={!isSupported || isListening}
        className={`w-full py-8 rounded-2xl flex items-center justify-center gap-4 transition-all ${!isSupported ? 'bg-gray-500 text-gray-300 cursor-not-allowed' : isListening ? 'bg-zinc-800 text-amber-500 shadow-inner' : 'bg-amber-400 text-black shadow-[0_10px_0_rgb(180,130,0)] active:shadow-none active:translate-y-2'}`}
      >
        <Mic size={40} strokeWidth={3} />
        <span className="text-3xl font-black uppercase tracking-tighter">
          {isListening ? "Listening..." : "Speak Now"}
        </span>
      </button>
    </div>
  );
};

export default LiveCaptions;
