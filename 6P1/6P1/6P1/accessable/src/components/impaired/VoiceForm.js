import React, { useState, useEffect } from 'react';
import { useAssistant } from '../../hooks/useAssistant';
import { useOCR } from '../../hooks/useOCR';
import { extractFormFields } from '../../utils/formProcessor';
import { validateField } from '../../utils/validation';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun } from 'docx';
import { Camera, Mic, Loader2, CheckCircle, AlertTriangle, Globe, FileText, FileDown, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

const VoiceForm = () => {
  const [language, setLanguage] = useState('en-US');
  const { speak, listen, isMicActive } = useAssistant(language);
  const [status, setStatus] = useState('IDLE');
  const [fields, setFields] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [browserSupported, setBrowserSupported] = useState(true);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageDimensions, setImageDimensions] = useState(null);

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

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setBrowserSupported(false);
      setError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
    }
  }, []);

  const downloadForm = async (format = 'pdf') => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `form_export_${timestamp}`;

    if (format === 'pdf') {
      const doc = new jsPDF();
      
      // If we have the original form image, embed it as the full page background!
      if (uploadedImage) {
        doc.addImage(uploadedImage, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
        // We NO LONGER add a white overlay. We want it to look like a naturally filled form.
      }

      doc.setFontSize(14);
      doc.setTextColor(0, 0, 200); // Blue ink color for filled fields
      
      Object.entries(formData).forEach(([label, value]) => {
        // Find the field to get its bounding box
        const field = fields.find(f => f.label === label);
        if (field && field.bbox && imageDimensions) {
          // Map Tesseract pixels to jsPDF A4 dimensions (210x297 mm)
          const scaleX = 210 / imageDimensions.width;
          const scaleY = 297 / imageDimensions.height;
          
          // Place the text to the right of the label's bounding box
          // bbox has x0, y0, x1, y1
          const xPos = (field.bbox.x1 + 10) * scaleX; 
          const yPos = (field.bbox.y1 - 2) * scaleY; // slightly adjust baseline
          
          doc.text(String(value), xPos, yPos);
        } else {
          // Fallback if no bbox is found for some reason
          doc.text(`${label}: ${value}`, 20, 20);
        }
      });
      
      doc.save(`${filename}.pdf`);
      
    } else if (format === 'docx') {
      const children = [];

      // If we have an uploaded image (letterhead/form), embed it at the top of the Word Doc
      if (uploadedImage) {
        const base64Data = uploadedImage.split(',')[1];
        const binaryString = window.atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        children.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: bytes,
                transformation: {
                  width: 500,
                  height: 700,
                },
              }),
            ],
            spacing: { after: 400 }
          })
        );
      }

      children.push(
        new Paragraph({
          text: 'Filled Form Data',
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 400 }
        })
      );

      Object.entries(formData).forEach(([key, value]) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${key}: `, bold: true }),
              new TextRun({ text: String(value) })
            ],
            spacing: { after: 200 }
          })
        );
      });

      const doc = new Document({
        sections: [{ children }]
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.docx`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

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
    setFieldError('');
    
    // Save image data URL to embed in the final PDF/Docx as a letterhead
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target.result);
    };
    reader.readAsDataURL(file);

    await speak('Scanning form fields. Please wait.');

    try {
      const { lines, width, height } = await scanImage(file);
      setImageDimensions({ width, height });

      if (!lines || lines.length === 0) {
        await speak('No text detected in the form image. Please try a clearer picture.');
        setError('No text detected. Try a clearer image with better lighting.');
        setStatus('IDLE');
        return;
      }

      const detected = extractFormFields(lines, getOCRLang(language));

      if (detected.length === 0) {
        await speak('No form fields detected. Please try scanning a document with clear labels.');
        setError('No form fields found. Make sure the image contains clear field labels.');
        setStatus('IDLE');
      } else {
        setFields(detected);
        setFormData({});
        setCurrentIdx(0);
        setStatus('FILLING');
        await speak(`Found ${detected.length} form fields. Let us begin with field 1: ${detected[0].label}. Please speak the answer.`);
        startListeningForField(0, detected);
      }
    } catch (err) {
      console.error('VoiceForm OCR error:', err);
      const errorMessage = err.message || 'Error scanning form. Please try another image.';
      await speak(errorMessage);
      setError(errorMessage);
      setStatus('IDLE');
    }
  };

  // Dedicated single-step field recording function (Fast voice loop without double confirmations)
  const startListeningForField = async (index, currentFieldsList = fields) => {
    const fieldList = currentFieldsList.length > 0 ? currentFieldsList : fields;

    if (index >= fieldList.length) {
      setStatus('REVIEW');
      await speak('Form completed successfully! Review your entries below.');
      return;
    }

    const fieldLabel = fieldList[index].label;
    setCurrentIdx(index);
    setFieldError('');

    const spokenInput = await listen();
    // Only strip trailing punctuation to avoid destroying email addresses (like .com)
    const cleanInput = (spokenInput || '').trim().replace(/[.,!?;:]+$/, '');

    if (!cleanInput) {
      setFieldError('No voice input detected. Say answer or say skip / back.');
      await speak(`I didn't hear anything for ${fieldLabel}. Please speak your answer, or say skip, or say back.`);
      return startListeningForField(index, fieldList);
    }

    const lowerInput = cleanInput.toLowerCase();

    // Check for Backward voice command
    if (lowerInput.includes('back') || lowerInput.includes('previous') || lowerInput.includes('last')) {
      if (index > 0) {
        const prevIdx = index - 1;
        await speak(`Going back to field ${prevIdx + 1}: ${fieldList[prevIdx].label}`);
        return startListeningForField(prevIdx, fieldList);
      } else {
        await speak('This is already the first field.');
        return startListeningForField(0, fieldList);
      }
    }

    // Check for Forward / Skip voice command
    if (lowerInput.includes('next') || lowerInput.includes('skip') || lowerInput.includes('forward') || lowerInput.includes('pass')) {
      await speak(`Skipping ${fieldLabel}. Moving to next field.`);
      return startListeningForField(index + 1, fieldList);
    }

    // Data Validation
    const validation = validateField(fieldLabel, cleanInput);
    if (!validation.isValid) {
      setFieldError(validation.message);
      await speak(`${validation.message}. Please try again.`);
      return startListeningForField(index, fieldList);
    }

    // Input is valid! Save and fast-forward to next field
    const sanitizedValue = validation.sanitized;
    setFormData(prev => ({ ...prev, [fieldLabel]: sanitizedValue }));
    setFieldError('');

    if (index + 1 < fieldList.length) {
      await speak(`Recorded ${sanitizedValue}. Next field: ${fieldList[index + 1].label}. Speak your answer.`);
      return startListeningForField(index + 1, fieldList);
    } else {
      setStatus('REVIEW');
      await speak(`Recorded ${sanitizedValue}. Form complete! Please review your details.`);
    }
  };

  // Manual navigation handlers
  const handlePrevField = () => {
    if (currentIdx > 0) {
      const prevIdx = currentIdx - 1;
      speak(`Going back to ${fields[prevIdx].label}`);
      startListeningForField(prevIdx);
    }
  };

  const handleNextField = () => {
    if (currentIdx < fields.length - 1) {
      const nextIdx = currentIdx + 1;
      speak(`Moving to ${fields[nextIdx].label}`);
      startListeningForField(nextIdx);
    }
  };

  const handleEditField = (index) => {
    setStatus('FILLING');
    speak(`Editing field ${index + 1}: ${fields[index].label}. Please speak the new value.`);
    startListeningForField(index);
  };

  return (
    <div className="bg-black border-4 border-yellow-400 rounded-3xl p-6 md:p-8 shadow-2xl min-h-[520px] flex flex-col justify-between">
      {/* Compatibility Warning */}
      {!browserSupported && (
        <div className="mb-6 p-6 bg-black border-4 border-yellow-400 rounded-2xl flex items-center gap-4">
          <AlertTriangle className="h-10 w-10 text-yellow-400 flex-shrink-0" />
          <div>
            <h3 className="text-white font-black text-xl uppercase">Browser Not Supported</h3>
            <p className="text-yellow-400 text-sm font-bold uppercase">Speech recognition requires Chrome, Edge, or Safari.</p>
          </div>
        </div>
      )}

      {/* General Error Alert */}
      {error && (
        <div className="mb-6 p-6 bg-black border-4 border-yellow-400 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <AlertTriangle className="h-10 w-10 text-yellow-400 flex-shrink-0" />
            <p className="text-white text-lg font-black uppercase">{error}</p>
          </div>
          <button
            onClick={() => { setError(''); setStatus('IDLE'); }}
            className="px-6 py-3 bg-yellow-400 text-black text-sm font-black uppercase tracking-widest rounded-xl hover:bg-yellow-300 focus:outline-none focus:ring-8 focus:ring-white border-4 border-white"
          >
            RESET
          </button>
        </div>
      )}

      {/* Initial IDLE State */}
      {status === 'IDLE' && browserSupported && (
        <div className="space-y-8 my-auto">
          <div className="p-8 bg-black rounded-3xl border-4 border-yellow-400 space-y-4">
            <h2 className="text-3xl font-black text-white uppercase tracking-wider">Voice Form Assistant</h2>
            <p className="text-yellow-400 text-lg font-bold uppercase leading-relaxed">
              Upload a form image or document. The assistant will detect fields and prompt you via voice.
            </p>
            <div className="text-sm text-white space-y-2 font-black uppercase">
              <p>✓ Auto field validation (Age, Email, Phone)</p>
              <p>✓ Fast voice entry (no duplicate prompts)</p>
              <p>✓ Say "BACK" or "NEXT" anytime to navigate</p>
            </div>
            <div className="pt-4 flex items-center gap-4">
              <Globe size={24} className="text-yellow-400" />
              <label className="text-white text-sm font-black uppercase">Speech Language:</label>
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

          <label className="flex flex-col items-center justify-center py-20 bg-yellow-400 text-black rounded-3xl cursor-pointer border-4 border-white hover:bg-yellow-300 focus-within:ring-8 focus-within:ring-white transition-all">
            <Camera size={80} strokeWidth={3} />
            <span className="text-4xl font-black mt-6 uppercase tracking-wider">Scan & Fill Form</span>
            <span className="text-lg font-black mt-2">UPLOAD FORM PHOTO / PDF</span>
            <input type="file" className="sr-only" onChange={handleScan} accept="image/*,application/pdf" />
          </label>
        </div>
      )}

      {/* OCR SCANNING State */}
      {status === 'SCANNING' && (
        <div className="my-auto text-center space-y-6 py-12">
          <Loader2 className="animate-spin mx-auto text-yellow-400" size={100} />
          <p className="text-4xl font-black text-yellow-400 uppercase tracking-wider animate-pulse">
            ANALYZING FORM FIELDS...
          </p>
          <p className="text-white text-xl font-bold uppercase">Detecting form labels & structure</p>
        </div>
      )}

      {/* FILLING State (With Forward & Backward Controls & Validation Feedback) */}
      {status === 'FILLING' && fields.length > 0 && (
        <div className="space-y-8 my-auto">
          {/* Progress & Step Bar */}
          <div className="space-y-4">
            <div className="flex justify-between items-center text-lg font-black text-yellow-400 uppercase tracking-widest">
              <span>FIELD {currentIdx + 1} OF {fields.length}</span>
              <span>{Math.round(((currentIdx + 1) / fields.length) * 100)}% COMPLETED</span>
            </div>
            <div className="w-full h-6 bg-black border-4 border-white rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / fields.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Current Field Card */}
          <div className="bg-black p-8 rounded-3xl border-4 border-yellow-400 text-center space-y-6 shadow-xl">
            <span className="inline-block px-6 py-2 bg-yellow-400 text-black text-sm font-black uppercase tracking-widest rounded-full border-4 border-white">
              ACTIVE QUESTION
            </span>
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-widest uppercase">
              {fields[currentIdx]?.label}
            </h2>

            {/* Field Validation Hint */}
            <p className="text-xl font-bold text-yellow-400 uppercase">
              {fields[currentIdx]?.label?.toLowerCase().includes('age') ? 'ENTER AGE (1 - 99)' :
               fields[currentIdx]?.label?.toLowerCase().includes('phone') || fields[currentIdx]?.label?.toLowerCase().includes('mobile') ? 'ENTER EXACTLY 10 DIGITS' :
               fields[currentIdx]?.label?.toLowerCase().includes('email') ? 'ENTER VALID EMAIL ADDRESS' : 'SPEAK CLEARLY OR SAY "SKIP" / "BACK"'}
            </p>

            {/* Validation Error Message */}
            {fieldError && (
              <div className="p-4 bg-black border-4 border-yellow-400 rounded-2xl text-white text-xl font-black uppercase animate-pulse">
                ⚠️ {fieldError}
              </div>
            )}
          </div>

          {/* Dynamic Mic Visualizer */}
          <div className="flex flex-col items-center justify-center space-y-6">
            <button
              onClick={() => startListeningForField(currentIdx)}
              className={`w-36 h-36 rounded-full flex items-center justify-center border-8 transition-all duration-300 focus:outline-none focus:ring-8 focus:ring-white ${
                isMicActive
                  ? 'bg-yellow-400 border-white scale-110 animate-pulse'
                  : 'bg-black border-yellow-400 hover:scale-105 hover:bg-zinc-900'
              }`}
            >
              <Mic size={64} className={isMicActive ? 'text-black' : 'text-yellow-400'} />
            </button>
            <p className={`text-xl font-black uppercase tracking-widest ${isMicActive ? 'text-yellow-400 animate-pulse' : 'text-white'}`}>
              {isMicActive ? 'LISTENING NOW...' : 'TAP MIC TO RE-SPEAK'}
            </p>
          </div>

          {/* Forward & Backward Form Navigation Controls */}
          <div className="flex items-center justify-between gap-6 pt-4">
            <button
              onClick={handlePrevField}
              disabled={currentIdx === 0}
              className="flex-1 flex items-center justify-center gap-3 py-6 px-4 bg-black disabled:opacity-50 text-white rounded-3xl font-black text-xl uppercase border-4 border-yellow-400 hover:bg-yellow-400 hover:text-black focus:outline-none focus:ring-8 focus:ring-white transition-all"
            >
              <ChevronLeft size={32} />
              <span>PREVIOUS</span>
            </button>

            <button
              onClick={handleNextField}
              disabled={currentIdx === fields.length - 1}
              className="flex-1 flex items-center justify-center gap-3 py-6 px-4 bg-black disabled:opacity-50 text-white rounded-3xl font-black text-xl uppercase border-4 border-yellow-400 hover:bg-yellow-400 hover:text-black focus:outline-none focus:ring-8 focus:ring-white transition-all"
            >
              <span>NEXT / SKIP</span>
              <ChevronRight size={32} />
            </button>
          </div>
        </div>
      )}

      {/* REVIEW State */}
      {status === 'REVIEW' && (
        <div className="space-y-8 my-auto">
          <div className="bg-black border-4 border-yellow-400 p-6 rounded-3xl flex items-center gap-6 text-yellow-400">
            <CheckCircle size={48} className="flex-shrink-0" />
            <div>
              <h3 className="text-3xl font-black uppercase tracking-wider">FORM COMPLETED!</h3>
              <p className="text-lg font-bold text-white uppercase">All fields processed and validated.</p>
            </div>
          </div>

          <div className="bg-black p-6 rounded-3xl border-4 border-white max-h-[300px] overflow-y-auto space-y-4">
            {fields.map((field, idx) => (
              <div key={field.label} className="flex items-center justify-between p-4 bg-black rounded-2xl border-4 border-yellow-400">
                <div>
                  <p className="text-sm font-black text-yellow-400 uppercase tracking-widest">{field.label}</p>
                  <p className="text-2xl font-black text-white uppercase">{formData[field.label] || <span className="text-slate-500 italic">NOT ANSWERED</span>}</p>
                </div>
                <button
                  onClick={() => handleEditField(idx)}
                  className="px-6 py-2 bg-yellow-400 text-black border-4 border-white text-sm font-black rounded-xl hover:bg-yellow-300 focus:outline-none focus:ring-4 focus:ring-white uppercase"
                >
                  EDIT
                </button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <button
              onClick={() => downloadForm('pdf')}
              className="flex items-center justify-center gap-3 py-6 bg-black hover:bg-yellow-400 hover:text-black focus:outline-none focus:ring-8 focus:ring-white text-yellow-400 font-black rounded-3xl border-4 border-yellow-400 transition-all text-xl uppercase"
            >
              <FileText size={32} />
              <span>EXPORT PDF</span>
            </button>
            <button
              onClick={() => downloadForm('docx')}
              className="flex items-center justify-center gap-3 py-6 bg-black hover:bg-yellow-400 hover:text-black focus:outline-none focus:ring-8 focus:ring-white text-yellow-400 font-black rounded-3xl border-4 border-yellow-400 transition-all text-xl uppercase"
            >
              <FileDown size={32} />
              <span>EXPORT WORD</span>
            </button>
          </div>

          <button
            onClick={() => { setStatus('IDLE'); setFormData({}); setFields([]); }}
            className="w-full py-6 bg-yellow-400 hover:bg-yellow-300 focus:outline-none focus:ring-8 focus:ring-white text-black font-black text-2xl uppercase rounded-3xl border-4 border-white flex items-center justify-center gap-4 tracking-widest"
          >
            <RotateCcw size={28} />
            <span>SCAN ANOTHER FORM</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default VoiceForm;
