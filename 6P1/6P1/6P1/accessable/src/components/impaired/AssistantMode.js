import React from 'react';
import LiveCaptions from './LiveCaptions';
import OCRScanner from './OCRScanner';
import VoiceForm from './VoiceForm';
import EmergencyButton from './EmergencyButton';
import { Eye, Camera, Mic, AlertTriangle, Sparkles } from 'lucide-react';

const AssistantMode = () => (
  <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-200">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
            <Sparkles size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Accessibility Assistant</h2>
            <p className="text-slate-600">Enhanced accessibility tools for sensory-impaired users</p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg">
            <Eye className="h-6 w-6 text-amber-600" />
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Live Captions</h3>
              <p className="text-xs text-slate-600">Real-time speech to text</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg">
            <Camera className="h-6 w-6 text-orange-600" />
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">OCR Scanner</h3>
              <p className="text-xs text-slate-600">Text recognition from images</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg">
            <Mic className="h-6 w-6 text-yellow-600" />
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Voice Forms</h3>
              <p className="text-xs text-slate-600">Voice-guided form filling</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Emergency</h3>
              <p className="text-xs text-slate-600">Quick emergency access</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        <section>
          <LiveCaptions />
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <OCRScanner />
          <VoiceForm />
        </div>

        <EmergencyButton />
      </div>
    </div>
  </div>
);

export default AssistantMode;