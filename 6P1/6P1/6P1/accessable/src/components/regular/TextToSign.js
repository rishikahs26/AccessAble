import React, { useState } from 'react';
import { useSpeech } from '../../hooks/useSpeech';
import { getSignFromText } from '../../utils/gestureLibrary';

const TextToSign = () => {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const { speak, startListening, isSupported } = useSpeech();

  const handleListen = async () => {
    if (!isSupported) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    setIsListening(true);
    const result = await startListening((transcriptOrError) => {
      if (transcriptOrError) setText(transcriptOrError);
    });

    if (result.success && result.transcript) {
      setText(result.transcript);
    }

    setIsListening(false);
  };

  return (
    <div className="p-4 bg-white rounded-2xl shadow-md border border-gray-200">
      <label className="block text-gray-600 text-sm font-bold mb-2 uppercase">Type to talk back:</label>
      <div className="flex gap-2">
        <input 
          type="text" 
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="input-field flex-1"
          placeholder="Hello, how can I help?"
        />
        <button 
          onClick={() => speak(text)}
          className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold"
          disabled={!text.trim()}
        >
          Speak
        </button>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-2">
        <div className="flex gap-2">
          <button
            onClick={handleListen}
            disabled={!isSupported || isListening}
            className={`px-4 py-2 rounded-lg font-bold ${isListening ? 'bg-blue-600 text-white' : 'bg-slate-700 text-white'} ${!isSupported ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            {isListening ? 'Listening...' : 'Listen and Fill'}
          </button>
          {!isSupported && <span className="text-xs text-red-500">Speech recognition unsupported</span>}
        </div>
        <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <strong>Standard Sign:</strong> {getSignFromText(text)}
        </div>
      </div>
    </div>
  );
};

export default TextToSign;
