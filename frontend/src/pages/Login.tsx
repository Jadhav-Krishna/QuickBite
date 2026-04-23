import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { authService } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import AuthSplitLayout from '../components/auth/AuthSplitLayout';

export default function Login() {
  const navigate = useNavigate();
  const { login: saveLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getRedirectPath = (role: string) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN':
      case 'ROLE_ADMIN':
      case 'APPLICATION_ADMIN':
      case 'ROLE_APPLICATION_ADMIN':
        return '/admin/overview';
      case 'PARTNER':
      case 'RESTAURANT_PARTNER':
      case 'RESTAURANT_OWNER':
      case 'ROLE_PARTNER':
        return '/partner/dashboard';
      case 'AGENT':
      case 'DELIVERY_AGENT':
      case 'COURIER':
      case 'ROLE_AGENT':
        return '/agent/dashboard';
      default:
        return '/restaurants';
    }
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await authService.login({ email, password });
      const user = {
        userId: response.userId,
        email: response.email,
        fullName: response.fullName,
        role: response.role,
      };

      saveLogin(user, response.accessToken, response.refreshToken);
      navigate(getRedirectPath(response.role));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthSplitLayout
      title="Welcome Back"
      description="Sign in to continue your curated delivery experience."
      imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuDBXYZNR1NIBqHZ2sxjmOCSpTDuOjCxcVsbaOKprc2FnHLcrotWUExyByNQNfXqJoWfEV3_OQCS42v1LqytOOn6iJ4AiHUy-zKhi2j51kamkIN3FlfgWcVj-4_Qtftqf-T7UttoJzurXGYroQYiiZ7ItlTA6mKdsrXmLyk0jOoHze4Dk9D7_hSUT4rtA4F4s3eP7tTjotst-hBFpF6_j4yW4P1122YOVWE15iVj5g9cuZVGYfpqxdULH-HFfkyeakn8lZ0YVb8gjGs"
      imageAlt="Rustic artisanal food on a wooden table"
      quoteTitle="Welcome back to the table."
      quoteText="Fine dining, reordered for speed, clarity, and everyday access."
    >
      <form className="space-y-5" onSubmit={handleLogin}>
        {error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div>
          <label className="mb-2 ml-1 block text-sm font-semibold text-[var(--color-on-surface-variant)]">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            placeholder="chef@example.com"
            className="w-full rounded-2xl border border-transparent bg-[var(--color-surface-container-highest)] px-5 py-4 text-[var(--color-on-surface)] outline-none transition focus:border-[var(--color-outline-variant)] focus:bg-white"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="ml-1 block text-sm font-semibold text-[var(--color-on-surface-variant)]">Password</label>
            <Link to="/forgot-password" className="text-sm font-semibold text-[var(--color-primary)] transition hover:text-[var(--color-secondary-container)]">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              placeholder="Enter your password"
              className="w-full rounded-2xl border border-transparent bg-[var(--color-surface-container-highest)] px-5 py-4 pr-14 text-[var(--color-on-surface)] outline-none transition focus:border-[var(--color-outline-variant)] focus:bg-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] transition hover:text-[var(--color-primary)]"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`hero-button flex min-h-14 w-full items-center justify-center rounded-full px-8 text-base font-bold text-[var(--color-on-primary)] shadow-[0_10px_30px_rgba(181,35,48,0.24)] transition ${loading ? 'cursor-not-allowed opacity-70' : 'hover:scale-[1.01]'}`}
        >
          {loading ? 'Signing in...' : 'Login'}
        </button>
      </form>

      <div className="my-8 flex items-center gap-4">
        <div className="h-px flex-1 bg-[var(--color-outline-variant)]/50" />
        <span className="text-sm text-[var(--color-on-surface-variant)]">or</span>
        <div className="h-px flex-1 bg-[var(--color-outline-variant)]/50" />
      </div>

      <div className="space-y-3">
        <button type="button" className="w-full rounded-full border border-[var(--color-outline-variant)]/40 bg-white px-5 py-3 text-sm font-semibold transition hover:bg-[var(--color-surface-container-low)]">
          Continue with Google
        </button>
        <button type="button" className="w-full rounded-full border border-[var(--color-outline-variant)]/40 bg-white px-5 py-3 text-sm font-semibold transition hover:bg-[var(--color-surface-container-low)]">
          Continue with GitHub
        </button>
      </div>

      <p className="mt-8 text-center text-sm text-[var(--color-on-surface-variant)]">
        Don&apos;t have an account?{' '}
        <Link to="/signup" className="font-bold text-[var(--color-primary)] transition hover:text-[var(--color-secondary-container)]">
          Sign up
        </Link>
      </p>
    </AuthSplitLayout>
  );
}
