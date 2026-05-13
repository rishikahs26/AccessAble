import React from 'react';
import SignCamera from './SignCamera';
import TextToSign from './TextToSign';
import { Smartphone, MessageSquare, Camera, Type } from 'lucide-react';

const TranslatorMode = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <Smartphone size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Sign Language Translator</h2>
            <p className="text-slate-600">Real-time sign language recognition and translation</p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
            <Camera className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="font-semibold text-slate-800">Live Recognition</h3>
              <p className="text-sm text-slate-600">AI-powered gesture detection</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
            <MessageSquare className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="font-semibold text-slate-800">Text to Sign</h3>
              <p className="text-sm text-slate-600">Convert text to sign language</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
            <Type className="h-8 w-8 text-purple-600" />
            <div>
              <h3 className="font-semibold text-slate-800">Voice Commands</h3>
              <p className="text-sm text-slate-600">Hands-free operation</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Camera Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Sign Recognition
            </h3>
            <SignCamera />
          </div>
        </div>

        {/* Text to Sign Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Type className="h-5 w-5" />
              Text to Sign
            </h3>
            <TextToSign />
          </div>

          {/* Instructions Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
            <h4 className="font-bold text-slate-800 text-sm uppercase mb-3 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Quick Tips
            </h4>
            <ul className="text-sm text-slate-600 space-y-2">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                Ensure your hand is fully visible in the camera
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                Use good lighting for better recognition
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                Speak commands like "translate hello" for voice input
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                The system learns and improves with use
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default TranslatorMode;
