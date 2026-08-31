import React, { useState } from 'react';
import { UserProfile } from '../types';
import { COUNTRIES_LIST, getCurrencyForCountry } from '../data/countries';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  loginWithGoogle,
  initializeUserInFirestore,
  auth,
} from '../lib/firebase';

interface AuthViewProps {
  initialMode?: 'login' | 'signup';
  onAuthSuccess: (user: UserProfile, isNewAccount: boolean) => void;
  onBackToLanding?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  initialMode = 'login',
  onAuthSuccess,
  onBackToLanding,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('United States');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Visibility Toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Loading & Error
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currInfo = getCurrencyForCountry(country);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        if (!agreeTerms) {
          setError('Please agree to the Terms of Service & Privacy Policy.');
          setIsLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          setIsLoading(false);
          return;
        }

        const creds = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const displayName = fullName.trim() || email.split('@')[0];
        const newProfile: UserProfile = {
          name: displayName,
          avatarUrl:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuBBB8cSMrzEhwY1glldjR4IUdUhsLg2jQPhb8VHua-RY3EEZB3SImAP538QIpMeVjHSR4VklxpwO7DCXtaKch4d36DGoKgfJkmKy2gHQGy3Z5GLIwnJaOoNtwdxZlTc2Pj3sVUrWdBjODMdLcGD8vDcOnvvl-J6ChoI5CXheV6Lr4UhyDG2dYAXzTFTlqnV6bkW2A2yEFuJiereUG_wy_EPRbWHVjCt7CqoTI-ibv8vutRDKJCd_UaQ',
          email: email.trim(),
          country: country,
          currency: currInfo.code,
          currencySymbol: currInfo.symbol,
          monthlyBudget: 300,
        };

        await initializeUserInFirestore(creds.user.uid, newProfile, false);
        onAuthSuccess(newProfile, true);
      } else {
        // Log in
        const creds = await signInWithEmailAndPassword(auth, email.trim(), password);
        const userProfile: UserProfile = {
          name: creds.user.displayName || email.split('@')[0],
          avatarUrl:
            creds.user.photoURL ||
            'https://lh3.googleusercontent.com/aida-public/AB6AXuBBB8cSMrzEhwY1glldjR4IUdUhsLg2jQPhb8VHua-RY3EEZB3SImAP538QIpMeVjHSR4VklxpwO7DCXtaKch4d36DGoKgfJkmKy2gHQGy3Z5GLIwnJaOoNtwdxZlTc2Pj3sVUrWdBjODMdLcGD8vDcOnvvl-J6ChoI5CXheV6Lr4UhyDG2dYAXzTFTlqnV6bkW2A2yEFuJiereUG_wy_EPRbWHVjCt7CqoTI-ibv8vutRDKJCd_UaQ',
          email: email.trim(),
          country: country,
          currency: currInfo.code,
          currencySymbol: currInfo.symbol,
          monthlyBudget: 300,
        };
        onAuthSuccess(userProfile, false);
      }
    } catch (err: any) {
      console.error(err);
      const code = err?.code || '';
      if (code === 'auth/operation-not-allowed') {
        setError('Email & Password sign-up is disabled in Firebase Console. Please sign in with Google.');
      } else if (
        code === 'auth/wrong-password' ||
        code === 'auth/user-not-found' ||
        code === 'auth/invalid-credential' ||
        code === 'auth/invalid-login-credentials'
      ) {
        setError('Invalid email or password.');
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please log in instead.');
      } else if (code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError(err?.message || 'Invalid email or password.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await loginWithGoogle();
      if (!result || !result.user) {
        // Redirect was initiated or background listener is processing
        return;
      }
      const user = result.user;
      const profile: UserProfile = {
        name: user.displayName || 'Google User',
        avatarUrl:
          user.photoURL ||
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBBB8cSMrzEhwY1glldjR4IUdUhsLg2jQPhb8VHua-RY3EEZB3SImAP538QIpMeVjHSR4VklxpwO7DCXtaKch4d36DGoKgfJkmKy2gHQGy3Z5GLIwnJaOoNtwdxZlTc2Pj3sVUrWdBjODMdLcGD8vDcOnvvl-J6ChoI5CXheV6Lr4UhyDG2dYAXzTFTlqnV6bkW2A2yEFuJiereUG_wy_EPRbWHVjCt7CqoTI-ibv8vutRDKJCd_UaQ',
        email: user.email || '',
        country: country,
        currency: currInfo.code,
        currencySymbol: currInfo.symbol,
        monthlyBudget: 300,
      };
      await initializeUserInFirestore(user.uid, profile, false);
      onAuthSuccess(profile, false);
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      const code = err?.code || '';
      if (code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled.');
      } else if (code === 'auth/unauthorized-domain') {
        setError('Domain not authorized in Firebase Console (add localhost or your app domain).');
      } else if (code === 'auth/operation-not-allowed') {
        setError('Google Sign-In is not enabled in your Firebase Console.');
      } else if (code === 'auth/popup-blocked') {
        setError('Sign-in popup was blocked. Please allow popups or use email login.');
      } else {
        setError(err.message || 'Google login failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-center p-4 py-8 relative">
      {/* Main Card */}
      <div className="bg-white rounded-3xl max-w-[440px] w-full p-8 md:p-10 shadow-[0_8px_30px_rgba(26,54,93,0.08)] border border-[#c4c6cf]/20 flex flex-col items-center">
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <img src="/app-icon.svg" alt="SubTracker" className="w-12 h-12 rounded-2xl object-contain shadow-md" />
          <span className="text-2xl font-bold text-[#002045] tracking-tight font-sans">
            SubTracker
          </span>
        </div>

        {mode === 'signup' ? (
          /* CREATE ACCOUNT FORM */
          <div className="w-full flex flex-col items-center animate-fade-in">
            <h2 className="text-2xl md:text-3xl font-bold text-[#002045] tracking-tight text-center">
              Create Account
            </h2>
            <p className="text-sm text-[#43474e] text-center mt-1.5 mb-6">
              Start managing your subscriptions today.
            </p>

            {error && (
              <div className="w-full mb-4 p-3 rounded-xl bg-[#ffdad6] text-[#93000a] text-xs font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="w-full space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-[#0d1c2e] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#74777f] text-[20px]">
                    person
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#c4c6cf] text-sm text-[#0d1c2e] placeholder-[#a0a3bd] focus:outline-none focus:ring-2 focus:ring-[#002045] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-[#0d1c2e] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#74777f] text-[20px]">
                    mail
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="jane@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#c4c6cf] text-sm text-[#0d1c2e] placeholder-[#a0a3bd] focus:outline-none focus:ring-2 focus:ring-[#002045] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Country of Residence */}
              <div>
                <label className="block text-xs font-semibold text-[#0d1c2e] mb-1">
                  Country of Residence
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#74777f] text-[20px]">
                    public
                  </span>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#c4c6cf] text-sm text-[#0d1c2e] bg-white focus:outline-none focus:ring-2 focus:ring-[#002045] focus:border-transparent transition-all"
                  >
                    {COUNTRIES_LIST.map((c) => (
                      <option key={c.code} value={c.name}>
                        {c.name} ({c.currencyCode} - {c.currencySymbol})
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[11px] text-[#74777f] mt-1 pl-1">
                  Currency automatically set to: <strong>{currInfo.code} ({currInfo.symbol})</strong>
                </p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-[#0d1c2e] mb-1">
                  Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#74777f] text-[20px]">
                    lock
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-3 rounded-xl border border-[#c4c6cf] text-sm text-[#0d1c2e] placeholder-[#a0a3bd] focus:outline-none focus:ring-2 focus:ring-[#002045] focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#74777f] hover:text-[#0d1c2e]"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-[#0d1c2e] mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#74777f] text-[20px]">
                    lock_reset
                  </span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-3 rounded-xl border border-[#c4c6cf] text-sm text-[#0d1c2e] placeholder-[#a0a3bd] focus:outline-none focus:ring-2 focus:ring-[#002045] focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#74777f] hover:text-[#0d1c2e]"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showConfirmPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-[#c4c6cf] text-[#002045] focus:ring-[#002045]"
                />
                <label htmlFor="agreeTerms" className="text-xs text-[#43474e] leading-snug">
                  I agree to the{' '}
                  <a href="#terms" onClick={(e) => e.preventDefault()} className="font-semibold text-[#002045] hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#privacy" onClick={(e) => e.preventDefault()} className="font-semibold text-[#002045] hover:underline">
                    Privacy Policy
                  </a>
                  .
                </label>
              </div>

              {/* Create Account Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 h-12 bg-[#002045] text-white font-semibold text-sm rounded-xl hover:bg-[#1a365d] transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.99] disabled:opacity-50"
              >
                <span>{isLoading ? 'Creating...' : 'Create Account'}</span>
                <span className="material-symbols-outlined text-[18px]">
                  arrow_forward
                </span>
              </button>
            </form>

            {/* Divider */}
            <div className="w-full flex items-center my-6">
              <div className="flex-1 border-t border-[#c4c6cf]/40" />
              <span className="px-3 text-[11px] font-semibold text-[#74777f] uppercase tracking-wider">
                OR CONTINUE WITH
              </span>
              <div className="flex-1 border-t border-[#c4c6cf]/40" />
            </div>

            {/* Social Logins */}
            <div className="w-full">
              <button
                type="button"
                onClick={handleGoogleAuth}
                className="w-full h-11 rounded-xl border border-[#c4c6cf]/80 bg-white text-[#0d1c2e] font-semibold text-xs flex items-center justify-center gap-2.5 hover:bg-[#f8f9ff] transition-colors shadow-2xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>

            {/* Bottom Switch Link */}
            <p className="text-xs text-[#43474e] mt-6 text-center">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="font-bold text-[#002045] hover:underline"
              >
                Log In
              </button>
            </p>
          </div>
        ) : (
          /* LOG IN / WELCOME BACK FORM */
          <div className="w-full flex flex-col items-center animate-fade-in">
            <h2 className="text-2xl md:text-3xl font-bold text-[#002045] tracking-tight text-center">
              Welcome Back
            </h2>
            <p className="text-sm text-[#43474e] text-center mt-1.5 mb-6">
              Log in to manage your financial commitments securely.
            </p>

            {error && (
              <div className="w-full mb-4 p-3 rounded-xl bg-[#ffdad6] text-[#93000a] text-xs font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="w-full space-y-4">
              {/* Email Address */}
              <div>
                <label className="block text-[11px] font-bold text-[#43474e] uppercase tracking-wider mb-1">
                  EMAIL ADDRESS
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#74777f] text-[20px]">
                    mail
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#c4c6cf] text-sm text-[#0d1c2e] placeholder-[#a0a3bd] focus:outline-none focus:ring-2 focus:ring-[#002045] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[11px] font-bold text-[#43474e] uppercase tracking-wider">
                    PASSWORD
                  </label>
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Password reset instructions sent to your email.');
                    }}
                    className="text-xs font-medium text-[#002045] hover:underline"
                  >
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#74777f] text-[20px]">
                    lock
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-3 rounded-xl border border-[#c4c6cf] text-sm text-[#0d1c2e] placeholder-[#a0a3bd] focus:outline-none focus:ring-2 focus:ring-[#002045] focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#74777f] hover:text-[#0d1c2e]"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Log In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 h-12 bg-[#002045] text-white font-semibold text-sm rounded-xl hover:bg-[#1a365d] transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.99] disabled:opacity-50"
              >
                <span>{isLoading ? 'Logging in...' : 'Log In'}</span>
                <span className="material-symbols-outlined text-[18px]">
                  arrow_forward
                </span>
              </button>
            </form>

            {/* Divider */}
            <div className="w-full flex items-center my-6">
              <div className="flex-1 border-t border-[#c4c6cf]/40" />
              <span className="px-3 text-[11px] font-semibold text-[#74777f] uppercase tracking-wider">
                OR
              </span>
              <div className="flex-1 border-t border-[#c4c6cf]/40" />
            </div>

            {/* Social Logins - Stacked */}
            <div className="w-full">
              <button
                type="button"
                onClick={handleGoogleAuth}
                className="w-full h-12 rounded-xl border border-[#c4c6cf]/80 bg-white text-[#0d1c2e] font-semibold text-sm flex items-center justify-center gap-2.5 hover:bg-[#f8f9ff] transition-colors shadow-2xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Continue with Google
              </button>
            </div>

            {/* Bottom Switch Link */}
            <p className="text-xs text-[#43474e] mt-6 text-center">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                }}
                className="font-bold text-[#002045] hover:underline"
              >
                Create Account
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
