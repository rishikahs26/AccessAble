import React, { useState } from 'react';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import SignIn from './components/auth/SignIn';
import AssistantMode from './components/impaired/AssistantMode';
import TranslatorMode from './components/regular/TranslatorMode';
import Header from './components/layout/Header';

function App() {
  const [user, setUser] = useState(null);
  const [userMode, setUserMode] = useState(null);
  const [isLogin, setIsLogin] = useState(true);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleRegister = (userData) => {
    setUser(userData);
  };

  const handleSignIn = (mode) => {
    setUserMode(mode);
  };

  const handleSignOut = () => {
    setUserMode(null);
    setUser(null);
  };

  const switchToRegister = () => {
    setIsLogin(false);
  };

  const switchToLogin = () => {
    setIsLogin(true);
  };

  return (
    <div className={`min-h-screen ${userMode === 'impaired' ? 'bg-black' : 'bg-slate-50'}`}>
      {!user ? (
        isLogin ? (
          <Login onLogin={handleLogin} onSwitchToRegister={switchToRegister} />
        ) : (
          <Register onRegister={handleRegister} onSwitchToLogin={switchToLogin} />
        )
      ) : !userMode ? (
        <SignIn onSignIn={handleSignIn} user={user} />
      ) : (
        <>
          {/* Header with Sign Out capability */}
          <Header role={userMode} onBack={handleSignOut} user={user} />
          
          <main className="animate-in fade-in zoom-in duration-500">
            {userMode === 'impaired' ? (
              <AssistantMode />
            ) : (
              <TranslatorMode />
            )}
          </main>
        </>
      )}
    </div>
  );
}

export default App;
