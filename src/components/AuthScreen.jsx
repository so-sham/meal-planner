import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';

export default function AuthScreen() {
  const { sendOtp, verifyOtp } = useAuth();
  const [step, setStep] = useState('email'); // 'email' | 'otp'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = useRef([]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // Auto-focus first OTP input when entering OTP step
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await sendOtp(email);
      setStep('otp');
      setResendCooldown(60);
      setMessage('A 6-digit code has been sent to your email.');
    } catch (err) {
      setError(err.message || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setLoading(true);
    try {
      await sendOtp(email);
      setResendCooldown(60);
      setMessage('New code sent.');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } catch (err) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (code) => {
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await verifyOtp(email, code);
      // Auth state change will be picked up by AuthContext
    } catch (err) {
      setError(err.message || 'Invalid code. Please try again.');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // OTP input handlers
  const handleOtpChange = (index, value) => {
    // Allow only digits
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (digit && index === 5) {
      const code = newOtp.join('');
      if (code.length === 6) handleVerifyOtp(code);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') {
      const code = otp.join('');
      if (code.length === 6) handleVerifyOtp(code);
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || '';
    }
    setOtp(newOtp);
    // Focus last filled or submit
    if (pasted.length === 6) {
      handleVerifyOtp(pasted);
    } else {
      otpRefs.current[Math.min(pasted.length, 5)]?.focus();
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
          {step === 'email' ? (
            <>
              <h2 className="text-lg font-bold text-bark-700 mb-1">Sign in</h2>
              <p className="text-xs text-bark-400 mb-4">We'll send a 6-digit code to your email</p>

              <form onSubmit={handleSendOtp} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-bark-600 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-cream-200 rounded-xl bg-cream-50 focus:outline-none focus:border-sage-400 focus:ring-1 focus:ring-sage-300 transition-colors"
                    placeholder="you@example.com"
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-gradient-to-r from-sage-500 to-sage-600 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg hover:from-sage-600 hover:to-sage-700 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send code'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-lg font-bold text-bark-700 mb-1">Enter code</h2>
              <p className="text-xs text-bark-400 mb-5">
                Sent to <span className="font-semibold text-bark-600">{email}</span>
              </p>

              {/* OTP input boxes */}
              <div className="flex justify-center gap-2 mb-4" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-11 h-12 text-center text-lg font-bold border border-cream-200 rounded-xl bg-cream-50 focus:outline-none focus:border-sage-400 focus:ring-2 focus:ring-sage-300 transition-colors"
                  />
                ))}
              </div>

              {error && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
                  {error}
                </div>
              )}

              {message && (
                <div className="text-xs text-sage-700 bg-sage-50 border border-sage-200 rounded-lg px-3 py-2 mb-3">
                  {message}
                </div>
              )}

              {loading && (
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="w-4 h-4 border-2 border-sage-200 border-t-sage-600 rounded-full animate-spin" />
                  <span className="text-xs text-bark-400">Verifying...</span>
                </div>
              )}

              {/* Resend + change email */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-cream-200">
                <button
                  type="button"
                  onClick={() => { setStep('email'); setError(''); setMessage(''); setOtp(['', '', '', '', '', '']); }}
                  className="text-xs text-bark-400 hover:text-bark-600"
                >
                  Change email
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || loading}
                  className="text-xs font-semibold text-sage-600 hover:text-sage-700 disabled:text-bark-300 disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                </button>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-[10px] text-bark-400 mt-4">
          No password needed. Your data syncs securely to the cloud.
        </p>
      </div>
    </div>
  );
}
