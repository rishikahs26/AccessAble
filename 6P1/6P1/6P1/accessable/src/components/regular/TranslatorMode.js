import React from 'react';
import SignCamera from './SignCamera';
import TextToSign from './TextToSign';
import { Smartphone, MessageSquare, Camera, Type } from 'lucide-react';

const TranslatorMode = () => (
  <div className="min-h-screen bg-black text-white p-6">
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="bg-zinc-900 rounded-3xl p-8 border-4 border-white shadow-2xl">
        <div className="flex items-center gap-6 mb-6 border-b-4 border-yellow-400 pb-6">
          <div className="p-4 bg-yellow-400 rounded-full border-4 border-white">
            <Smartphone size={40} className="text-black" />
          </div>
          <div>
            <h2 className="text-4xl font-black text-white uppercase tracking-wider">Sign Language Translator</h2>
            <p className="text-xl font-bold text-yellow-400 uppercase mt-2">Real-time sign language recognition and translation</p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="flex items-center gap-4 p-6 bg-black border-4 border-yellow-400 rounded-2xl">
            <Camera className="h-10 w-10 text-yellow-400" />
            <div>
              <h3 className="font-black text-white uppercase text-xl">Live Recognition</h3>
              <p className="text-sm font-bold text-yellow-400 uppercase">AI-powered gesture detection</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-6 bg-black border-4 border-yellow-400 rounded-2xl">
            <MessageSquare className="h-10 w-10 text-yellow-400" />
            <div>
              <h3 className="font-black text-white uppercase text-xl">Text to Sign</h3>
              <p className="text-sm font-bold text-yellow-400 uppercase">Convert text to sign language</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-6 bg-black border-4 border-yellow-400 rounded-2xl">
            <Type className="h-10 w-10 text-yellow-400" />
            <div>
              <h3 className="font-black text-white uppercase text-xl">Voice Commands</h3>
              <p className="text-sm font-bold text-yellow-400 uppercase">Hands-free operation</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Camera Section */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-900 rounded-3xl p-8 border-4 border-yellow-400">
            <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3 uppercase tracking-wider">
              <Camera className="h-8 w-8 text-yellow-400" />
              Sign Recognition
            </h3>
            <SignCamera />
          </div>
        </div>

        {/* Text to Sign Section */}
        <div className="space-y-8">
          <div className="bg-zinc-900 rounded-3xl p-8 border-4 border-yellow-400">
            <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3 uppercase tracking-wider">
              <Type className="h-8 w-8 text-yellow-400" />
              Text to Sign
            </h3>
            <TextToSign />
          </div>

          {/* Instructions Card */}
          <div className="bg-black rounded-3xl p-8 border-4 border-white">
            <h4 className="font-black text-yellow-400 text-2xl uppercase mb-6 flex items-center gap-3 tracking-wider">
              <MessageSquare className="h-8 w-8" />
              Quick Tips
            </h4>
            <ul className="text-lg font-bold text-white space-y-4 uppercase">
              <li className="flex items-start gap-4">
                <div className="w-3 h-3 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                Ensure your hand is fully visible in the camera
              </li>
              <li className="flex items-start gap-4">
                <div className="w-3 h-3 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                Use good lighting for better recognition
              </li>
              <li className="flex items-start gap-4">
                <div className="w-3 h-3 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                Speak commands like "translate hello" for voice input
              </li>
              <li className="flex items-start gap-4">
                <div className="w-3 h-3 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
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
