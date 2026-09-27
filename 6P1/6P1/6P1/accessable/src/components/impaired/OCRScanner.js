import React, { useState } from 'react';
import { useAssistant } from '../../hooks/useAssistant';
import { useOCR } from '../../hooks/useOCR';
import { Globe, Camera, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

const OCRScanner = () => {
  const [language, setLanguage] = useState('en-US');
  const [scannedResult, setScannedResult] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

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

  const { speak } = useAssistant(language);
  const { scanImage, loading } = useOCR(getOCRLang(language));

  const handleOCR = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type || (!file.type.startsWith('image/') && file.type !== 'application/pdf')) {
      await speak('Please choose a valid image or PDF file to scan.');
      setErrorMsg('Please choose a valid image or PDF file.');
      return;
    }

    setErrorMsg('');
    setScannedResult('');
    await speak('Scanning document. Please hold.');
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }

    try {
      const rawText = await scanImage(file);
      if (!rawText || rawText.trim().length === 0) {
        setErrorMsg('No text could be extracted. Please ensure document lighting is clear.');
        await speak('No text found in document.');
        return;
      }

      setScannedResult(rawText);
      await speak('Scanning finished. Document content reads: ' + rawText);
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
    } catch (err) {
      console.error('OCR error:', err);
      setErrorMsg('Error scanning document. Please try again.');
      speak('Error scanning document.');
    }
  };

  return (
    <div className="bg-black border-4 border-yellow-400 rounded-3xl p-6 shadow-2xl space-y-8 flex flex-col justify-between h-full">
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-6 border-b-4 border-yellow-400">
          <div className="flex items-center gap-4 text-yellow-400">
            <Camera size={32} />
            <h3 className="font-black text-2xl uppercase tracking-wider text-white">OCR Scanner</h3>
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

        <p className="text-yellow-400 text-lg font-bold uppercase">
          Upload or take a picture of printed text to have it scanned and read aloud automatically.
        </p>

        {errorMsg && (
          <div className="p-6 bg-black border-4 border-yellow-400 rounded-2xl flex items-center gap-4 text-white text-lg font-black uppercase">
            <AlertCircle size={32} className="flex-shrink-0 text-yellow-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {scannedResult && (
          <div className="p-6 bg-black border-4 border-yellow-400 rounded-2xl space-y-4">
            <div className="flex items-center gap-3 text-yellow-400 font-black text-sm uppercase tracking-widest">
              <CheckCircle2 size={24} />
              <span>EXTRACTED TEXT RESULT:</span>
            </div>
            <p className="text-white text-xl font-bold leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap uppercase">
              {scannedResult}
            </p>
          </div>
        )}
      </div>

      <label className={`w-full py-8 px-4 rounded-3xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-200 border-4 focus-within:outline-none focus-within:ring-8 focus-within:ring-white ${loading ? 'bg-zinc-800 border-zinc-600 text-zinc-500 cursor-not-allowed' : 'bg-yellow-400 hover:bg-yellow-300 text-black border-white active:scale-95'}`}>
        <FileText size={48} strokeWidth={3} />
        <span className="text-3xl font-black uppercase tracking-widest">
          {loading ? 'PROCESSING IMAGE...' : 'SCAN DOCUMENT'}
        </span>
        <input type="file" onChange={handleOCR} disabled={loading} className="sr-only" accept="image/*,application/pdf" />
      </label>
    </div>
  );
};

export default OCRScanner;
