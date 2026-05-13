import React, { useState, useEffect } from 'react';
import { useAssistant } from '../../hooks/useAssistant';
import { useOCR } from '../../hooks/useOCR';
import { extractFormFields } from '../../utils/formProcessor';
import { Camera, Mic, Loader2, CheckCircle, AlertTriangle, Globe, Download, FileJson } from 'lucide-react';

const VoiceForm = () => {
  const [language, setLanguage] = useState('en-US');
  const { speak, listen, isMicActive } = useAssistant(language);
  const [status, setStatus] = useState('IDLE');
  const [fields, setFields] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const [browserSupported, setBrowserSupported] = useState(true);

  const languages = [
    { code: 'en-US', name: 'English', ocr: 'eng' },
    { code: 'ta-IN', name: 'Tamil', ocr: 'tam' },
    { code: 'kn-IN', name: 'Kannada', ocr: 'kan' },
    { code: 'hi-IN', name: 'Hindi', ocr: 'hin' },
    { code: 'te-IN', name: 'Telugu', ocr: 'tel' },
  ];

  const getOCRLang = (lang) => {
    const langObj = languages.find(l => l.code === lang);
    return langObj ? langObj.ocr : 'eng';
  };

  const { scanImage } = useOCR(getOCRLang(language));

  const downloadForm = (format = 'json') => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `form_${timestamp}`;

    if (format === 'json') {
      const jsonData = {
        timestamp: new Date().toISOString(),
        language,
        formData
      };
      const dataStr = JSON.stringify(jsonData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      let csvContent = 'Field,Value\n';
      Object.entries(formData).forEach(([key, value]) => {
        const escapedValue = `"${String(value).replace(/"/g, '""')}"`;
        csvContent += `"${key}",${escapedValue}\n`;
      });
      const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(csvBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const confirmProceed = async () => {
    await speak(`Found ${fields.length} fields: ${fields.join(', ')}. Can we proceed?`);
    const response = await listen();
    console.log('Proceed confirmation:', response);
    if (response && (response.toLowerCase().includes('yes') || response.toLowerCase().includes('yeah') || response.toLowerCase().includes('sure') || response.toLowerCase().includes('ok'))) {
      handleStartFilling();
    } else {
      await speak('Okay, we can try again later.');
      setStatus('IDLE');
    }
  };

  useEffect(() => {
    // Check browser compatibility
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setBrowserSupported(false);
      setError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
    }
  }, []);

  useEffect(() => {
    if (status === 'CONFIRM_PROCEED') {
      confirmProceed();
    }
  }, [status]);

  const handleScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type || (!file.type.startsWith('image/') && file.type !== 'application/pdf')) {
      await speak('Please choose a valid image or PDF file to scan.');
      setError('Please select a valid image or PDF file.');
      return;
    }

    setStatus('SCANNING');
    setError('');
    await speak('Scanning form. Please wait.');

    try {
      console.log('Starting OCR scan for file:', file.name, 'Type:', file.type);
      const rawText = await scanImage(file);
      console.log('OCR raw text result:', rawText);

      if (!rawText || rawText.trim().length === 0) {
        await speak('No text detected in the image. Please try a clearer image with better contrast.');
        setError('No text detected. Try a clearer image with better contrast.');
        setStatus('IDLE');
        return;
      }

      const detected = extractFormFields(rawText, getOCRLang(language));
      console.log('Extracted form fields:', detected);

      if (detected.length === 0) {
        await speak('No form fields detected. The image might not contain a form, or the text is unclear. Try taking a closer photo.');
        setError('No form fields found. Make sure the image contains a clear form with visible field labels.');
        setStatus('IDLE');
      } else {
        setFields(detected);
        setCurrentIdx(0);
        setStatus('CONFIRM_PROCEED');
        // Automatic confirmation will be handled in useEffect
      }
    } catch (err) {
      console.error('VoiceForm OCR error:', err);
      const errorMessage = err.message || 'Error scanning form. Please try another image or PDF document.';
      await speak(errorMessage);
      setError(errorMessage);
      setStatus('IDLE');
    }
  };

  const handleStartFilling = async () => {
    if (fields.length === 0) return;

    setStatus('FILLING');
    runLoop(0);
  };

  const runLoop = async (index) => {
    if (index >= fields.length) {
      setStatus('REVIEW');
      await speak('Form complete. Review your answers below.');
      return;
    }

    const label = fields[index];
    setCurrentIdx(index);
    await speak(`Field ${index + 1} of ${fields.length}: ${label}. Please speak the value.`);

    const input = await listen();
    console.log(`Voice input for ${label}:`, input);

    if (!input || input.trim().length === 0) {
      await speak('I didn\'t hear anything. Please try again.');
      return runLoop(index);
    }

    await speak(`You said ${input} for ${label}. Is this correct?`);
    const confirm = await listen();
    console.log(`Confirmation response:`, confirm);

    if (confirm && (confirm.toLowerCase().includes('yes') || confirm.toLowerCase().includes('yeah') || confirm.toLowerCase().includes('correct') || confirm.toLowerCase().includes('right'))) {
      setFormData(prev => ({ ...prev, [label]: input }));
      runLoop(index + 1);
    } else if (confirm && (confirm.toLowerCase().includes('no') || confirm.toLowerCase().includes('not') || confirm.toLowerCase().includes('wrong'))) {
      await speak('Okay, let us try again.');
      runLoop(index);
    } else {
      await speak('I could not understand your confirmation. Please try again.');
      runLoop(index);
    }
  };

  // Manual Trigger for Mic (If auto-listen fails)
  const manualMicTrigger = async () => {
    // Not used in fully voice-driven mode
  };

  return (
    <div className="bg-zinc-950 border-4 border-amber-400 rounded-[3rem] p-10 shadow-2xl min-h-[500px] flex flex-col justify-center">
      {/* Browser Compatibility Warning */}
      {!browserSupported && (
        <div className="mb-6 p-4 bg-red-900 border border-red-600 rounded-xl">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-red-400" />
            <div>
              <h3 className="text-red-400 font-bold">Browser Not Supported</h3>
              <p className="text-red-300 text-sm">Speech recognition requires Chrome, Edge, or Safari. Please switch browsers.</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-900 border border-red-600 rounded-xl">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-red-400" />
            <div className="flex-1">
              <p className="text-red-300">{error}</p>
            </div>
            <button
              onClick={() => {
                setError('');
                setStatus('IDLE');
              }}
              className="px-3 py-1 bg-red-700 text-red-200 rounded-lg hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {status === 'IDLE' && browserSupported && (
        <div className="space-y-6">
          <div className="p-6 bg-zinc-900 rounded-3xl border border-amber-400">
            <h2 className="text-2xl font-black text-white mb-3">Voice Form Helper</h2>
            <p className="text-slate-300 mb-4">
              Scan a printed form image or PDF and then speak your answers aloud. The system will guide you through each field.
            </p>
            <div className="text-sm text-amber-400 mb-4">
              <p>• Make sure your microphone is enabled</p>
              <p>• Use clear, well-lit photos of forms</p>
              <p>• Speak clearly when prompted</p>
            </div>
            <div className="flex items-center gap-3">
              <Globe size={20} className="text-amber-400" />
              <label className="text-white font-bold">Language:</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-zinc-800 text-white border border-amber-400 rounded-lg px-3 py-1"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex flex-col items-center justify-center py-20 bg-amber-400 text-black rounded-[2rem] cursor-pointer shadow-lg active:scale-95 transition-transform">
            <Camera size={80} strokeWidth={3} />
            <span className="text-4xl font-black mt-6 uppercase italic">Scan Form</span>
            <input type="file" className="hidden" onChange={handleScan} accept="image/*,application/pdf" />
          </label>
        </div>
      )}

      {status === 'SCANNING' && (
        <div className="text-center text-amber-400">
          <Loader2 className="animate-spin mx-auto mb-6" size={80} />
          <p className="text-3xl font-black uppercase italic animate-pulse tracking-tighter">AI Reading Form...</p>
        </div>
      )}

      {(status === 'FILLING' || status === 'CONFIRM_PROCEED') && (
        <div className="text-center animate-in fade-in slide-in-from-bottom-10">
          <p className="text-amber-400 font-bold mb-4 uppercase tracking-[0.3em] opacity-70">
            {status === 'FILLING' ? `Question ${currentIdx + 1} of ${fields.length}` : "Confirmation"}
          </p>
          <h1 className="text-5xl font-black text-white uppercase mb-12 leading-tight">
            {status === 'FILLING' ? fields[currentIdx] : "Ready to Start?"}
          </h1>

          {/* Listening Indicator */}
          <div className={`w-48 h-48 rounded-full flex items-center justify-center mx-auto transition-all duration-500 border-8 ${isMicActive ? 'bg-red-600 border-white scale-110 shadow-[0_0_60px_rgba(220,38,38,0.8)]' : 'bg-amber-400 border-black shadow-xl'}`}>
            {isMicActive ? <div className="w-10 h-10 bg-white rounded-sm animate-pulse" /> : <Mic size={64} className="text-black" />}
          </div>

          <p className={`mt-10 font-black text-2xl uppercase tracking-widest ${isMicActive ? 'text-red-500 animate-bounce' : 'text-amber-400 opacity-40'}`}>
            {isMicActive ? "LISTENING NOW" : "PROCESSING"}
          </p>
        </div>
      )}

      {status === 'REVIEW' && (
        <div className="space-y-6 animate-in zoom-in">
          <div className="bg-green-500 p-6 rounded-3xl flex items-center gap-6 text-black">
            <CheckCircle size={50} />
            <span className="text-3xl font-black italic uppercase">Completed</span>
          </div>
          <div className="bg-zinc-900 p-6 rounded-3xl space-y-4 border border-zinc-700 max-h-[350px] overflow-y-auto">
            {Object.entries(formData).map(([k, v]) => (
              <div key={k} className="border-b border-zinc-800 pb-3">
                <p className="text-xs text-amber-500 font-black uppercase mb-1">{k}</p>
                <p className="text-3xl text-white font-bold">{v}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => downloadForm('json')}
              className="flex items-center justify-center gap-3 py-6 bg-blue-600 text-white rounded-2xl text-2xl font-black shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
            >
              <FileJson size={32} />
              <span>JSON</span>
            </button>
            <button
              onClick={() => downloadForm('csv')}
              className="flex items-center justify-center gap-3 py-6 bg-green-600 text-white rounded-2xl text-2xl font-black shadow-lg hover:bg-green-700 active:scale-95 transition-all"
            >
              <Download size={32} />
              <span>CSV</span>
            </button>
          </div>
          <button onClick={() => window.location.reload()} className="w-full py-8 bg-amber-400 text-black rounded-[2rem] text-4xl font-black shadow-2xl active:scale-95 transition-all">SUBMIT</button>
        </div>
      )}
    </div>
  );
};

export default VoiceForm;
