import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';

export default function AuthScreen() {
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (mode === 'forgot') {
        await resetPassword(email);
        setMessage('Password reset email sent. Check your inbox.');
      } else if (mode === 'signup') {
        await signUp(email, password);
        setMessage('Check your email to confirm your account.');
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-5xl block mb-3">💪</span>
          <h1 className="text-2xl font-extrabold text-bark-700 tracking-tight">NourishPlan</h1>
          <p className="text-xs text-bark-400 mt-1">Protein-first meal planner</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-cream-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-bark-700 mb-4">
            {mode === 'login' && 'Sign in'}
            {mode === 'signup' && 'Create account'}
            {mode === 'forgot' && 'Reset password'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-bark-600 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-cream-200 rounded-xl bg-cream-50 focus:outline-none focus:border-sage-400 focus:ring-1 focus:ring-sage-300 transition-colors"
                placeholder="you@example.com"
              />
            </div>

            {mode !== 'forgot' && (
              <div>
                <label className="block text-xs font-semibold text-bark-600 mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-cream-200 rounded-xl bg-cream-50 focus:outline-none focus:border-sage-400 focus:ring-1 focus:ring-sage-300 transition-colors"
                  placeholder="Min 6 characters"
                />
              </div>
            )}

            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            {message && (
              <div className="text-xs text-sage-700 bg-sage-50 border border-sage-200 rounded-lg px-3 py-2">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-sage-500 to-sage-600 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg hover:from-sage-600 hover:to-sage-700 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? 'Please wait...'
                : mode === 'login'
                ? 'Sign in'
                : mode === 'signup'
                ? 'Create account'
                : 'Send reset link'}
            </button>
          </form>

          {/* Mode toggles */}
          <div className="mt-4 pt-4 border-t border-cream-200 space-y-2 text-center">
            {mode === 'login' && (
              <>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(''); setMessage(''); }}
                  className="text-xs text-sage-600 hover:text-sage-700 font-medium"
                >
                  Don't have an account? <span className="font-bold">Sign up</span>
                </button>
                <br />
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); setError(''); setMessage(''); }}
                  className="text-xs text-bark-400 hover:text-bark-600"
                >
                  Forgot password?
                </button>
              </>
            )}
            {mode === 'signup' && (
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); setMessage(''); }}
                className="text-xs text-sage-600 hover:text-sage-700 font-medium"
              >
                Already have an account? <span className="font-bold">Sign in</span>
              </button>
            )}
            {mode === 'forgot' && (
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); setMessage(''); }}
                className="text-xs text-sage-600 hover:text-sage-700 font-medium"
              >
                Back to <span className="font-bold">sign in</span>
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-[10px] text-bark-400 mt-4">
          Your data syncs securely to the cloud when signed in.
        </p>
      </div>
    </div>
  );
}
