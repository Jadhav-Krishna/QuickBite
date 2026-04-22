import { Link } from 'react-router-dom';
import AuthSplitLayout from '../components/auth/AuthSplitLayout';

export default function ForgotPassword() {
  return (
    <AuthSplitLayout
      title="Reset Password"
      description="Enter your email and we’ll send you a recovery link."
      imageUrl="https://images.unsplash.com/photo-1495195129352-aeb325a55b65?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
      imageAlt="Premium culinary visual"
      quoteTitle="Recover your seat at the table."
      quoteText="Secure account recovery without breaking the premium flow."
      backTo="/login"
      backLabel="Back to Login"
    >
      <form className="space-y-5" onSubmit={(event) => event.preventDefault()}>
        <div>
          <label className="mb-2 ml-1 block text-sm font-semibold text-[var(--color-on-surface-variant)]">Email Address</label>
          <input
            type="email"
            placeholder="name@example.com"
            className="w-full rounded-2xl border border-transparent bg-[var(--color-surface-container-highest)] px-5 py-4 outline-none transition focus:border-[var(--color-outline-variant)] focus:bg-white"
          />
        </div>

        <button type="submit" className="hero-button flex min-h-14 w-full items-center justify-center rounded-full px-8 text-base font-bold text-[var(--color-on-primary)] shadow-[0_10px_30px_rgba(181,35,48,0.24)] transition hover:scale-[1.01]">
          Send Recovery Link
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-[var(--color-on-surface-variant)]">
        Remembered your password?{' '}
        <Link to="/login" className="font-bold text-[var(--color-primary)] transition hover:text-[var(--color-secondary-container)]">
          Return to login
        </Link>
      </p>
    </AuthSplitLayout>
  );
}
