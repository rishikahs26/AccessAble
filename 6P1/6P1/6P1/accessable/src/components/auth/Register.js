import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { validateEmail } from '../../utils/validation';

const Register = ({ onRegister, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setError(emailValidation.message);
      setIsLoading(false);
      return;
    }
    const cleanEmail = emailValidation.sanitized;

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email: cleanEmail, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Registration failed. Please try again.');
        setIsLoading(false);
        return;
      }

      window.localStorage.setItem('accessableToken', data.token);
      setIsLoading(false);
      onRegister(data.user);
    } catch (err) {
      setError('Unable to connect to server. Please try again later.');
      console.error('Registration error:', err);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-yellow-400 border-4 border-white rounded-2xl mb-4">
            <span className="text-5xl font-black text-black">A</span>
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-wider mb-2">AccessAble</h1>
          <p className="text-xl font-bold text-yellow-400 uppercase">Inclusive communication</p>
        </div>

        {/* Register Form */}
        <div className="bg-zinc-900 rounded-3xl border-4 border-yellow-400 p-8 shadow-2xl">
          <h2 className="text-3xl font-black text-white mb-8 text-center uppercase tracking-wide">Create Account</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-lg font-bold text-yellow-400 mb-2 uppercase">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black h-6 w-6" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-black bg-white border-4 border-yellow-400 rounded-xl focus:outline-none focus:ring-4 focus:ring-yellow-400 font-black text-xl placeholder-gray-600"
                  placeholder="ENTER YOUR FULL NAME"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-lg font-bold text-yellow-400 mb-2 uppercase">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black h-6 w-6" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    let val = e.target.value.toLowerCase();
                    // Auto-format spoken 'at' and 'dot' for visual feedback
                    val = val.replace(/\b(at)\b/g, '@').replace(/\b(dot)\b/g, '.').replace(/\s+/g, '');
                    setEmail(val);
                  }}
                  className="w-full pl-12 pr-4 py-4 text-black bg-white border-4 border-yellow-400 rounded-xl focus:outline-none focus:ring-4 focus:ring-yellow-400 font-black text-xl placeholder-gray-600"
                  placeholder="ENTER YOUR EMAIL"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-lg font-bold text-yellow-400 mb-2 uppercase">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black h-6 w-6" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 text-black bg-white border-4 border-yellow-400 rounded-xl focus:outline-none focus:ring-4 focus:ring-yellow-400 font-black text-xl placeholder-gray-600"
                  placeholder="CREATE A PASSWORD"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-black hover:text-gray-700 focus:outline-none focus:ring-4 focus:ring-yellow-400 rounded-full p-1"
                >
                  {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-lg font-bold text-yellow-400 mb-2 uppercase">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black h-6 w-6" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 text-black bg-white border-4 border-yellow-400 rounded-xl focus:outline-none focus:ring-4 focus:ring-yellow-400 font-black text-xl placeholder-gray-600"
                  placeholder="CONFIRM YOUR PASSWORD"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-black hover:text-gray-700 focus:outline-none focus:ring-4 focus:ring-yellow-400 rounded-full p-1"
                >
                  {showConfirmPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-950 border-4 border-red-500 rounded-xl p-4">
                <p className="text-red-400 text-lg font-bold text-center uppercase">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-yellow-400 text-black py-4 px-6 rounded-xl font-black text-2xl uppercase tracking-wider hover:bg-yellow-300 focus:outline-none focus:ring-8 focus:ring-white transition-all disabled:opacity-50 flex items-center justify-center gap-3 border-4 border-black"
            >
              {isLoading ? (
                <>
                  <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                  CREATING ACCOUNT...
                </>
              ) : (
                <>
                  CREATE ACCOUNT
                  <ArrowRight className="h-8 w-8" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center bg-black p-4 rounded-2xl border-2 border-white">
            <p className="text-lg font-bold text-white uppercase">
              ALREADY HAVE AN ACCOUNT?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-yellow-400 hover:text-white underline focus:outline-none focus:ring-4 focus:ring-yellow-400 p-2 rounded-lg"
              >
                SIGN IN
              </button>
            </p>
          </div>
        </div>

        {/* Accessibility Note */}
        <div className="mt-8 text-center bg-zinc-900 border-2 border-yellow-400 p-4 rounded-xl">
          <p className="text-sm font-bold text-yellow-400 uppercase tracking-widest">
            FOR ACCESSIBILITY, USE VOICE COMMANDS OR SCREEN READERS
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;