import React from 'react';
import { LogOut, User, Settings } from 'lucide-react';

const Header = ({ role, onBack, user }) => (
  <header className="p-4 flex justify-between items-center border-b-8 border-yellow-400 bg-black text-white">
    <div className="flex items-center gap-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 font-black text-lg px-6 py-3 rounded-xl border-4 border-yellow-400 bg-black text-yellow-400 hover:bg-yellow-400 hover:text-black focus:outline-none focus:ring-8 focus:ring-white transition-all duration-200 uppercase tracking-wide"
      >
        <LogOut size={24} /> SIGN OUT
      </button>

      {/* User Info */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-yellow-400 border-2 border-white">
          <User className="h-8 w-8 text-black" />
        </div>
        <div className="hidden sm:block">
          <p className="text-xl font-black uppercase tracking-wider">{user?.name || 'User'}</p>
          <p className="text-sm font-bold text-yellow-400 uppercase">{user?.email}</p>
        </div>
      </div>
    </div>

    <div className="flex items-center gap-4">
      <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase text-white bg-black px-4 py-1 border-4 border-white rounded-xl">AccessAble</h1>

      <div className="flex items-center gap-3 bg-zinc-900 border-4 border-yellow-400 px-4 py-2 rounded-xl">
        <div className="w-4 h-4 rounded-full animate-pulse bg-yellow-400" />
        <span className="text-lg font-black uppercase text-yellow-400 hidden md:inline">{role} MODE</span>
      </div>

      <button className="p-3 rounded-xl border-4 border-white bg-black hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-8 focus:ring-yellow-400 text-white">
        <Settings className="h-8 w-8" />
      </button>
    </div>
  </header>
);

export default Header;
