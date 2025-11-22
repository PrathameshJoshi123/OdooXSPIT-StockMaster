// src/pages/AuthPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loginId, setLoginId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');

  const fieldBaseStyles = 'mt-1 w-full rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-150';

  const navigate = useNavigate();

  // --- Validation Logic (Frontend UX Feedback) ---
  // Login ID checks [cite: image_294500.png]: 6-12 characters
  const isLoginIdValid = loginId.length >= 6 && loginId.length <= 12;

  // Password checks [cite: image_294500.png]: length > 8, small/large/special char
  const isLengthValid = password.length >= 9; // "more than 8 characters" is >= 9
  const hasLowerCase = /[a-z]/.test(password); // Checks for small case
  const hasUpperCase = /[A-Z]/.test(password); // Checks for large case
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password); // Checks for special character
  const passwordsMatch = password === rePassword;

  const handleAuth = (e) => {
    e.preventDefault();
    
    if (!isLogin) {
      // --- Frontend Sign Up Validation ---
      if (!isLoginIdValid) {
        alert("Login ID must be between 6 and 12 characters.");
        return;
      }
      if (!isLengthValid || !hasLowerCase || !hasUpperCase || !hasSpecialChar) {
        alert("Password must be 9+ characters and contain a small case, large case, and special character.");
        return;
      }
      if (!passwordsMatch) {
        alert("Passwords do not match.");
        return;
      }
      
      // If client-side validation passes, proceed to backend API call for uniqueness check and signup
      alert("Sign Up data ready for backend processing. (Backend checks uniqueness and email duplication!)");
      setIsLogin(true);
      setPassword('');
      setRePassword('');
      return;
    }

    // On successful login, Redirect to Inventory Dashboard.
    navigate('/dashboard'); 
  };

  const handlePasswordReset = () => {
    // Exact functionality: OTP-based password reset.
    alert("Initiating OTP-based password reset... (Implementation needed)");
  };

  return (
    <div className="relative min-h-screen bg-slate-950 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-24 -left-16 h-80 w-80 rounded-full bg-indigo-600 blur-3xl" />
        <div className="absolute top-1/2 right-0 h-96 w-96 translate-x-1/3 rounded-full bg-purple-700 blur-[140px]" />
        <div className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-500 blur-[120px]" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
        <div className="grid w-full max-w-5xl gap-10 rounded-[32px] bg-white/5 p-8 shadow-2xl shadow-indigo-900/40 ring-1 ring-white/10 backdrop-blur-2xl lg:grid-cols-[1.1fr_0.9fr] lg:p-12">
          <div className="hidden flex-col justify-between rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-10 text-white lg:flex">
            <div className="space-y-6">
              <p className="inline-flex items-center rounded-full border border-white/30 px-3 py-1 text-xs tracking-[0.2em] uppercase text-white/70">StockMaster</p>
              <h1 className="text-4xl font-semibold leading-tight">
                Modular IMS that keeps <span className="text-cyan-300">every stock move</span> live and traceable.
              </h1>
              <p className="text-base text-white/70">
                A centralized, real-time cockpit anyone can drive.
              </p>

             

              <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
                <img
                  src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=600&q=60"
                  alt="Warehouse operators collaborating with digital dashboards"
                  className="h-36 w-full object-cover opacity-90"
                  loading="lazy"
                />
              </div>
            </div>
          
          </div>

          <div className="w-full rounded-3xl border border-white/10 bg-white/95 p-8 shadow-2xl shadow-indigo-900/20 sm:p-10">
            <div className="space-y-1 text-center text-slate-900">
              <p className="text-sm uppercase tracking-[0.3em] text-indigo-600">StockMaster</p>
              <h2 className="text-3xl font-bold">{isLogin ? 'Welcome back' : 'Sign up'}</h2>
             
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleAuth}>
              {/* LOGIN ID / EMAIL ID Field */}
              <div>
                <label htmlFor="loginId" className="block text-sm font-medium text-gray-700">
                  {isLogin ? 'Login Id' : 'Enter Login Id'}
                </label>
                <input
                  id="loginId"
                  type="text"
                  required
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className={fieldBaseStyles}
                />
                {/* Login ID Length Feedback (Sign Up Only) */}
                {!isLogin && loginId.length > 0 && (
                  <p className={`mt-1 text-xs ${isLoginIdValid ? 'text-green-500' : 'text-red-500'}`}>
                    Login ID length must be between 6 and 12 characters.
                  </p>
                )}
              </div>

              {/* EMAIL ID Field (Sign Up Only) */}
              {!isLogin && (
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Enter Email Id</label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={fieldBaseStyles}
                  />
                </div>
              )}

              {/* PASSWORD Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">{isLogin ? 'Password' : 'Enter Password'}</label>
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="off"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={fieldBaseStyles}
                />
              </div>

              {/* RE-ENTER PASSWORD Field (Sign Up Only) */}
              {!isLogin && (
                <div>
                  <label htmlFor="rePassword" className="block text-sm font-medium text-gray-700">Re-Enter Password</label>
                  <input
                    id="rePassword"
                    type="password"
                    required
                    autoComplete="off"
                    value={rePassword}
                    onChange={(e) => setRePassword(e.target.value)}
                    className={fieldBaseStyles}
                  />
                  {rePassword.length > 0 && !passwordsMatch && (
                    <p className="mt-1 text-xs text-red-500">
                      Passwords do not match.
                    </p>
                  )}
                </div>
              )}

              {/* Forgot Password / Sign Up Toggle */}
              {isLogin && (
                <div className="flex items-center justify-between">
                  <button type="button" onClick={handlePasswordReset} className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition duration-150">
                    Forgot Password ? (OTP Reset)
                  </button>
                </div>
              )}

              <button type="submit" className="w-full flex justify-center rounded-2xl border border-transparent bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-lg font-semibold text-white shadow-lg shadow-indigo-500/30 transition duration-150 hover:scale-[1.01] hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 active:scale-[0.98]">
                {isLogin ? 'SIGN IN' : 'SIGN UP'}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between rounded-2xl bg-slate-100 p-4 text-sm">
              <span className="text-gray-500">{isLogin ? 'Need an account?' : 'Already onboarded?'}</span>
              <button onClick={() => setIsLogin(!isLogin)} className="font-semibold text-indigo-600 hover:text-indigo-500">
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;