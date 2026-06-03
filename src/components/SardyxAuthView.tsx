import React, { useState } from 'react';
import { 
  Sparkles, 
  Mail, 
  Lock, 
  User, 
  ArrowRight,
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { motion } from 'motion/react';

interface SardyxAuthViewProps {
  onAuthSuccess: (session: { email: string; displayName: string }) => void;
  onBackToLanding: () => void;
  darkMode: boolean;
}

export default function SardyxAuthView({ 
  onAuthSuccess, 
  onBackToLanding, 
  darkMode 
}: SardyxAuthViewProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // UI alerts
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    // Simulate authentication processing for 800ms
    setTimeout(() => {
      setIsLoading(false);
      if (activeTab === 'forgot') {
        if (!email.trim()) {
          setErrorMsg('Please specify a valid email address.');
          return;
        }
        setSuccessMsg(`A verification token has been routed to ${email}. Please check your inbox.`);
        return;
      }

      if (activeTab === 'signup') {
        if (!email.trim() || !password.trim() || !displayName.trim()) {
          setErrorMsg('All credential fields are required for workforce activation.');
          return;
        }
        if (password.length < 6) {
          setErrorMsg('Password integrity threshold requires at least 6 characters.');
          return;
        }
        
        // Sign up success
        setSuccessMsg('Account registered successfully! Automatic persistence configured.');
        setTimeout(() => {
          onAuthSuccess({
            email,
            displayName: displayName || email.split('@')[0],
          });
        }, 1200);
      } else {
        // Sign in
        if (!email.trim() || !password.trim()) {
          setErrorMsg('Email and password keys must be fully initialized.');
          return;
        }
        
        // Sim success
        onAuthSuccess({
          email,
          displayName: email.split('@')[0].toUpperCase(),
        });
      }
    }, 850);
  };

  const handleOAuthLogin = (provider: 'google' | 'github') => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onAuthSuccess({
        email: `${provider}-sandbox@sardyx.ai`,
        displayName: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Operator`,
      });
    }, 600);
  };

  return (
    <div className={`min-h-screen py-16 px-6 flex flex-col items-center justify-center relative font-sans transition-colors duration-500 ${
      darkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'
    }`}>
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Auth Card wrapper */}
      <div className="w-full max-w-md relative z-10">
        
        {/* Brand logo */}
        <div className="flex flex-col items-center mb-8 cursor-pointer text-center" onClick={onBackToLanding}>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-blue-500 flex items-center justify-center shadow-xl shadow-indigo-500/20 mb-3 animate-pulse">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="font-extrabold tracking-tight text-2xl bg-gradient-to-r from-violet-400 via-indigo-500 to-blue-500 bg-clip-text text-transparent">
            Sardyx AI
          </span>
          <span className="text-[10px] font-mono tracking-widest block uppercase text-zinc-500 font-bold mt-0.5">
            Unified Credentials Portal
          </span>
        </div>

        {/* Card Body */}
        <div className={`rounded-2xl border p-8 transition-all duration-300 ${
          darkMode 
            ? 'bg-zinc-900/60 border-zinc-800/80 backdrop-blur-md shadow-2xl shadow-black/60' 
            : 'bg-white border-zinc-200 shadow-xl shadow-zinc-300/40'
        }`}>
          {/* Header tabs */}
          {activeTab !== 'forgot' && (
            <div className="flex border-b border-zinc-800/10 dark:border-zinc-800/60 pb-4 mb-6">
              <button 
                id="tab-signin-btn"
                onClick={() => { setActiveTab('signin'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`flex-1 text-center pb-2 text-sm font-bold transition-all relative ${
                  activeTab === 'signin' 
                    ? (darkMode ? 'text-white' : 'text-zinc-950') 
                    : 'text-zinc-500'
                }`}
              >
                Sign In
                {activeTab === 'signin' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
                )}
              </button>
              <button 
                id="tab-signup-btn"
                onClick={() => { setActiveTab('signup'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`flex-1 text-center pb-2 text-sm font-bold transition-all relative ${
                  activeTab === 'signup' 
                    ? (darkMode ? 'text-white' : 'text-zinc-950') 
                    : 'text-zinc-500'
                }`}
              >
                Create Account
                {activeTab === 'signup' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
                )}
              </button>
            </div>
          )}

          {activeTab === 'forgot' && (
            <div className="mb-6">
              <h3 className="text-lg font-bold">Reset Workforce Access</h3>
              <p className="text-zinc-500 text-xs mt-1">Specify your email coordinates to reset access tokens.</p>
            </div>
          )}

          {/* Feedback banners */}
          {errorMsg && (
            <div className="flex items-center gap-2.5 p-3.5 mb-5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/20">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2.5 p-3.5 mb-5 rounded-lg text-xs font-semibold bg-green-500/10 text-green-500 border border-green-500/20">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* OAuth Buttons */}
          {activeTab !== 'forgot' && (
            <div className="space-y-3 mb-6">
              <button
                id="oauth-google-btn"
                type="button"
                onClick={() => handleOAuthLogin('google')}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all ${
                  darkMode 
                    ? 'bg-zinc-950/40 border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white' 
                    : 'bg-zinc-50 border-zinc-200 text-zinc-650 hover:bg-zinc-100 hover:text-zinc-900'
                }`}
              >
                <span className="font-bold text-red-500">G</span>
                <span>Continue with Google Account</span>
              </button>
              <button
                id="oauth-github-btn"
                type="button"
                onClick={() => handleOAuthLogin('github')}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all ${
                  darkMode 
                    ? 'bg-zinc-950/40 border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white' 
                    : 'bg-zinc-50 border-zinc-200 text-zinc-650 hover:bg-zinc-100 hover:text-zinc-900'
                }`}
              >
                <span>Continue with GitHub Developer Auth</span>
              </button>

              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-zinc-800/10 dark:border-zinc-800/60" />
                <span className="px-3 text-[10px] font-mono tracking-wider font-extrabold text-zinc-500 uppercase">Or use secure key credentials</span>
                <div className="flex-1 border-t border-zinc-800/10 dark:border-zinc-800/60" />
              </div>
            </div>
          )}

          {/* Formal credentials form */}
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {activeTab === 'signup' && (
              <div>
                <label className="block text-[11px] font-mono tracking-widest font-extrabold uppercase text-zinc-500 mb-1.5">DisplayName</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Administrator Jenkins"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-xs outline-none border transition-all ${
                      darkMode 
                        ? 'bg-zinc-950 border-zinc-800 text-white focus:border-indigo-500' 
                        : 'bg-zinc-100/50 border-zinc-200 text-zinc-900 focus:border-indigo-600'
                    }`}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-mono tracking-widest font-extrabold uppercase text-zinc-500 mb-1.5">Emailcoordinates</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-xs outline-none border transition-all ${
                    darkMode 
                      ? 'bg-zinc-950 border-zinc-800 text-white focus:border-indigo-500' 
                      : 'bg-zinc-100/50 border-zinc-200 text-zinc-900 focus:border-indigo-600'
                  }`}
                />
              </div>
            </div>

            {activeTab !== 'forgot' && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[11px] font-mono tracking-widest font-extrabold uppercase text-zinc-500">SecurityPassword</label>
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-indigo-500 text-[11px] font-mono hover:underline outline-none"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-xs outline-none border transition-all ${
                      darkMode 
                        ? 'bg-zinc-950 border-zinc-800 text-white focus:border-indigo-500' 
                        : 'bg-zinc-100/50 border-zinc-200 text-zinc-900 focus:border-indigo-600'
                    }`}
                  />
                </div>
              </div>
            )}

            {activeTab === 'signin' && (
              <div className="text-right">
                <button 
                  type="button" 
                  onClick={() => setActiveTab('forgot')}
                  className="text-[11px] font-mono text-zinc-500 hover:text-indigo-500"
                >
                  Forgot your credential code?
                </button>
              </div>
            )}

            {/* Submit button */}
            <button
              id="auth-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:brightness-110 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
            >
              <span>{isLoading ? "Validating security vectors..." : (activeTab === 'signin' ? "Activate Authorization" : activeTab === 'forgot' ? "Submit Coordinates" : "Provision New Workforce Node")}</span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>

            {activeTab === 'forgot' && (
              <div className="text-center pt-2">
                <button 
                  type="button" 
                  onClick={() => setActiveTab('signin')}
                  className="text-[11px] font-mono text-indigo-500 hover:underline"
                >
                  Return to Sign In
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <button 
            type="button"
            onClick={onBackToLanding}
            className="text-xs text-zinc-500 hover:text-indigo-500 flex items-center gap-1 justify-center mx-auto"
          >
            ← Disconnect, Return to HomePage
          </button>
        </div>
      </div>
    </div>
  );
}
