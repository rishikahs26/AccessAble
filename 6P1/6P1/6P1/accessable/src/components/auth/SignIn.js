import React, { useEffect } from 'react';
import { useAssistant } from '../../hooks/useAssistant';
import { Eye, Languages, Mic, User } from 'lucide-react';

const SignIn = ({ onSignIn, user }) => {
  const { speak, listen } = useAssistant();

  useEffect(() => {
    const runGreeting = async () => {
      const greeting = `Welcome back, ${user?.name || 'User'}. Please choose your mode. Say Open Assistant for sensory mode, or say Open Translator for regular mode. You can also tap the screen.`;
      
      // Wait for the voice greeting to completely finish before turning on the mic
      await speak(greeting);
      
      // Auto-listen for voice commands
      const cmd = await listen();
      if (!cmd) return;
      
      const lowerCmd = cmd.toLowerCase();
      if (lowerCmd.includes("assistant") || lowerCmd.includes("impaired") || lowerCmd.includes("sensory")) {
        onSignIn('impaired');
      } else if (lowerCmd.includes("translator") || lowerCmd.includes("regular")) {
        onSignIn('regular');
      }
    };

    runGreeting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col text-white">
      {/* User Welcome Header */}
      <div className="bg-black border-b-4 border-yellow-400 p-6">
        <div className="max-w-4xl mx-auto flex items-center gap-6">
          <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center border-4 border-white">
            <User className="h-8 w-8 text-black" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white uppercase tracking-wider">Welcome back, {user?.name || 'User'}!</h2>
            <p className="text-lg font-bold text-yellow-400 uppercase mt-1">Choose your accessibility mode</p>
          </div>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left: Sensory Mode Sign In */}
        <button 
          onClick={() => onSignIn('impaired')}
          className="flex-1 group relative flex flex-col items-center justify-center bg-yellow-400 text-black hover:bg-yellow-300 transition-all duration-300 border-b-8 md:border-b-0 md:border-r-8 border-black focus:outline-none focus:ring-8 focus:ring-white focus:ring-inset"
          aria-label="Sign in to Assistant Mode"
        >
          <Eye size={120} strokeWidth={3} className="mb-6 animate-pulse" />
          <h1 className="text-6xl md:text-7xl font-black uppercase tracking-tighter mb-4">Assistant</h1>
          <p className="text-2xl font-black uppercase mb-6 bg-black text-yellow-400 px-6 py-2 rounded-2xl border-4 border-black">Sensory Mode</p>
          <div className="bg-black text-white px-8 py-4 rounded-full font-black text-xl flex items-center gap-3 border-4 border-black">
            <Mic size={28} /> "Open Assistant"
          </div>
          <div className="mt-8 text-lg font-bold text-center max-w-sm px-4">
            High contrast layout and voice control for sensory impairments
          </div>
        </button>

        {/* Right: Regular Mode Sign In */}
        <button 
          onClick={() => onSignIn('regular')}
          className="flex-1 group relative flex flex-col items-center justify-center bg-zinc-900 text-white hover:bg-zinc-800 transition-all duration-300 focus:outline-none focus:ring-8 focus:ring-yellow-400 focus:ring-inset"
          aria-label="Sign in to Regular Mode"
        >
          <Languages size={120} strokeWidth={2.5} className="mb-6 text-white" />
          <h1 className="text-6xl md:text-7xl font-black uppercase tracking-tighter mb-4">Translator</h1>
          <p className="text-2xl font-black uppercase mb-6 bg-white text-black px-6 py-2 rounded-2xl border-4 border-white">Regular Mode</p>
          <div className="bg-white text-black px-8 py-4 rounded-full font-black text-xl flex items-center gap-3 border-4 border-white">
            <Mic size={28} /> "Open Translator"
          </div>
          <div className="mt-8 text-lg font-bold text-center max-w-sm px-4 text-zinc-300">
            Sign language translation and communication tools
          </div>
        </button>
      </div>

      {/* Footer */}
      <div className="bg-black border-t-4 border-yellow-400 p-6 text-center">
        <p className="text-xl font-bold text-yellow-400 uppercase">
          Need help? Use voice commands or contact our support team
        </p>
      </div>
    </div>
  );
};

export default SignIn;
