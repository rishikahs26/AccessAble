import React from 'react';
import LiveCaptions from './LiveCaptions';
import OCRScanner from './OCRScanner';
import VoiceForm from './VoiceForm';
import { Eye, Camera, Mic, Sparkles } from 'lucide-react';

const AssistantMode = () => (
  <div className="min-h-screen bg-black text-white p-6">
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="bg-zinc-900 rounded-3xl p-8 border-4 border-yellow-400 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-4 border-yellow-400 pb-6">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-yellow-400 text-black rounded-full border-4 border-white">
              <Sparkles className="h-10 w-10 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-4">
                <h2 className="text-4xl font-black tracking-wider text-white uppercase">Accessibility Assistant</h2>
                <span className="px-4 py-2 bg-yellow-400 text-black text-sm font-black uppercase tracking-widest rounded-xl border-4 border-white">
                  Sensory Mode
                </span>
              </div>
              <p className="text-yellow-400 mt-2 text-lg font-bold uppercase">
                Smart voice transcription, document OCR scanning, and interactive voice-assisted forms.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Cards Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="flex items-center gap-4 p-6 bg-black rounded-2xl border-4 border-yellow-400 hover:bg-zinc-800 transition-all focus:outline-none focus:ring-8 focus:ring-white">
            <div className="p-4 bg-yellow-400 text-black rounded-full border-4 border-white">
              <Eye className="h-8 w-8" />
            </div>
            <div>
              <h3 className="font-black text-white text-xl uppercase">Live Transcriber</h3>
              <p className="text-sm font-bold text-yellow-400 uppercase">Real-time speech to text conversion</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-6 bg-black rounded-2xl border-4 border-yellow-400 hover:bg-zinc-800 transition-all focus:outline-none focus:ring-8 focus:ring-white">
            <div className="p-4 bg-yellow-400 text-black rounded-full border-4 border-white">
              <Camera className="h-8 w-8" />
            </div>
            <div>
              <h3 className="font-black text-white text-xl uppercase">OCR Scanner</h3>
              <p className="text-sm font-bold text-yellow-400 uppercase">Extract text from document images</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-6 bg-black rounded-2xl border-4 border-yellow-400 hover:bg-zinc-800 transition-all focus:outline-none focus:ring-8 focus:ring-white">
            <div className="p-4 bg-yellow-400 text-black rounded-full border-4 border-white">
              <Mic className="h-8 w-8" />
            </div>
            <div>
              <h3 className="font-black text-white text-xl uppercase">Voice Form Filler</h3>
              <p className="text-sm font-bold text-yellow-400 uppercase">Step-by-step voice form assistant</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Accessibility Components */}
      <div className="space-y-8">
        <section>
          <LiveCaptions />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
            <OCRScanner />
          </div>
          <div className="lg:col-span-7">
            <VoiceForm />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default AssistantMode;