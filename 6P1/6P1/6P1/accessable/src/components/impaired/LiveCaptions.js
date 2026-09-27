import React, { useState } from 'react';
import { useSpeech } from '../../hooks/useSpeech';
import { Mic, Activity, Globe, Volume2 } from 'lucide-react';

const LiveCaptions = () => {
  const [language, setLanguage] = useState('en-US');
  const [caption, setCaption] = useState('Tap button below and speak...');
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
      setError('Speech recognition is not supported in this browser.');
      return;
    }
    if (isListening) return;

    setError('');
    setIsListening(true);

    const result = await startListening();

    if (result.success && result.transcript) {
      setCaption(result.transcript);
    } else {
      setError(`Listening paused: ${result.error || 'No speech detected'}. Tap to try again.`);
    }

    setIsListening(false);
  };

  return (
    <div className="bg-black border-4 border-yellow-400 rounded-3xl p-6 md:p-8 shadow-2xl space-y-8">
      <div className="flex items-center justify-between pb-6 border-b-4 border-yellow-400">
        <div className="flex items-center gap-4 text-yellow-400">
          <Activity className={isListening ? "animate-bounce text-red-500" : "text-yellow-400"} size={32} />
          <span className="font-black text-2xl uppercase tracking-wider text-white">Live Transcriber</span>
          {isListening && (
            <span className="px-4 py-1 bg-red-600 text-white border-4 border-white text-sm font-black uppercase rounded-full animate-pulse">
              LIVE
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Globe size={24} className="text-yellow-400" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-black text-yellow-400 border-4 border-white rounded-xl px-4 py-2 text-sm font-black uppercase focus:outline-none focus:ring-4 focus:ring-yellow-400"
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-black p-8 rounded-3xl border-4 border-yellow-400 min-h-[160px] flex flex-col justify-between">
        <div className="flex items-center justify-between text-sm text-yellow-400 font-black uppercase tracking-widest mb-4">
          <span>REAL-TIME CAPTIONS</span>
          <Volume2 size={24} />
        </div>
        <p className="text-3xl md:text-5xl font-black text-white leading-snug tracking-tight uppercase">
          "{caption}"
        </p>
      </div>

      {error && (
        <p className="text-lg text-white font-black bg-black p-4 rounded-xl border-4 border-yellow-400 uppercase">
          ⚠️ {error}
        </p>
      )}

      <button
        onClick={handleListen}
        disabled={!isSupported || isListening}
        className={`w-full py-8 rounded-3xl flex items-center justify-center gap-4 transition-all duration-200 border-4 focus:outline-none focus:ring-8 focus:ring-white uppercase ${
          !isSupported
            ? 'bg-zinc-800 border-zinc-600 text-zinc-500 cursor-not-allowed'
            : isListening
            ? 'bg-yellow-400 border-white text-black animate-pulse scale-105'
            : 'bg-yellow-400 border-white text-black hover:bg-yellow-300 active:scale-95'
        }`}
      >
        <Mic size={48} strokeWidth={3} />
        <span className="text-3xl font-black uppercase tracking-widest">
          {isListening ? 'LISTENING...' : 'START TRANSCRIBING'}
        </span>
      </button>
    </div>
  );
};

export default LiveCaptions;
