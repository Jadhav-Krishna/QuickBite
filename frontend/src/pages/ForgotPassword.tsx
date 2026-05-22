import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import AuthSplitLayout from '../components/auth/AuthSplitLayout';
import { authService } from '../api/auth';

export default function ForgotPassword() {
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get('token');

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequestLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) { setError('Email is required'); return; }
    setLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!newPassword || newPassword.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await authService.resetPassword(resetToken!, newPassword);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  if (resetToken) {
    return (
      <AuthSplitLayout
        title="Set New Password"
        description="Enter your new password below."
        imageUrl="https://images.unsplash.com/photo-1495195129352-aeb325a55b65?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
        imageAlt="Premium culinary visual"
        quoteTitle="A fresh start."
        quoteText="Secure your account with a new password."
        backTo="/login"
        backLabel="Back to Login"
      >
        {success ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
            <p className="text-center font-semibold text-slate-700">Password reset successfully!</p>
            <Link to="/login" className="font-bold text-[var(--color-primary)] hover:underline">Go to Login</Link>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleResetPassword}>
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />{error}
              </div>
            )}
            <div>
              <label className="mb-2 ml-1 block text-sm font-semibold text-[var(--color-on-surface-variant)]">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full rounded-2xl border border-transparent bg-[var(--color-surface-container-highest)] px-5 py-4 outline-none transition focus:border-[var(--color-outline-variant)] focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-2 ml-1 block text-sm font-semibold text-[var(--color-on-surface-variant)]">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full rounded-2xl border border-transparent bg-[var(--color-surface-container-highest)] px-5 py-4 outline-none transition focus:border-[var(--color-outline-variant)] focus:bg-white"
              />
            </div>
            <button type="submit" disabled={loading} className="hero-button flex min-h-14 w-full items-center justify-center rounded-full px-8 text-base font-bold text-[var(--color-on-primary)] shadow-[0_10px_30px_rgba(181,35,48,0.24)] transition hover:scale-[1.01] disabled:opacity-50">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </AuthSplitLayout>
    );
  }

  return (
    <AuthSplitLayout
      title="Reset Password"
      description="Enter your email and we'll send you a recovery link."
      imageUrl="https://images.unsplash.com/photo-1495195129352-aeb325a55b65?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
      imageAlt="Premium culinary visual"
      quoteTitle="Recover your seat at the table."
      quoteText="Secure account recovery without breaking the premium flow."
      backTo="/login"
      backLabel="Back to Login"
    >
      {success ? (
        <div className="flex flex-col items-center gap-4 py-6">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
          <p className="text-center font-semibold text-slate-700">Recovery link sent! Check your email.</p>
          <Link to="/login" className="font-bold text-[var(--color-primary)] hover:underline">Back to Login</Link>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleRequestLink}>
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />{error}
            </div>
          )}
          <div>
            <label className="mb-2 ml-1 block text-sm font-semibold text-[var(--color-on-surface-variant)]">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full rounded-2xl border border-transparent bg-[var(--color-surface-container-highest)] px-5 py-4 outline-none transition focus:border-[var(--color-outline-variant)] focus:bg-white"
            />
          </div>
          <button type="submit" disabled={loading} className="hero-button flex min-h-14 w-full items-center justify-center rounded-full px-8 text-base font-bold text-[var(--color-on-primary)] shadow-[0_10px_30px_rgba(181,35,48,0.24)] transition hover:scale-[1.01] disabled:opacity-50">
            {loading ? 'Sending...' : 'Send Recovery Link'}
          </button>
        </form>
      )}
      <p className="mt-8 text-center text-sm text-[var(--color-on-surface-variant)]">
        Remembered your password?{' '}
        <Link to="/login" className="font-bold text-[var(--color-primary)] transition hover:text-[var(--color-secondary-container)]">
          Return to login
        </Link>
      </p>
    </AuthSplitLayout>
  );
}
