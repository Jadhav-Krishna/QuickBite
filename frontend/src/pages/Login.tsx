import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { authService } from '../api/auth';
import { notificationService } from '../api/notification';
import { useAuth } from '../context/AuthContext';

gsap.registerPlugin(ScrollTrigger);

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || '';

// Validation patterns
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function Login() {
  const navigate = useNavigate();
  const { login: saveLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Refs for GSAP animations
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);
  const floatingRef1 = useRef<HTMLDivElement>(null);
  const floatingRef2 = useRef<HTMLDivElement>(null);
  const floatingRef3 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Entrance animations
      gsap.from(containerRef.current, {
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
      });

      gsap.from(formRef.current?.children || [], {
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.2,
      });

      // Floating animations
      gsap.to(floatingRef1.current, {
        y: -20,
        x: 10,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      gsap.to(floatingRef2.current, {
        y: -30,
        x: -15,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 0.5,
      });

      gsap.to(floatingRef3.current, {
        y: -25,
        x: 20,
        duration: 4.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1,
      });

      // Parallax effect for hero image
      if (heroImageRef.current) {
        gsap.to(heroImageRef.current, {
          yPercent: 20,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          },
        });
      }
    });

    return () => ctx.revert();
  }, []);

  const validateEmail = (value: string): boolean => {
    if (!value) {
      setEmailError('Email is required');
      return false;
    }
    if (!EMAIL_REGEX.test(value)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (value: string): boolean => {
    if (!value) {
      setPasswordError('Password is required');
      return false;
    }
    if (value.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

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

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

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

      void notificationService.sendTestNotification({
        eventType: 'USER_LOGIN',
        userId: response.userId,
        title: 'Login Successful',
        message: `Welcome back, ${response.fullName}. You have logged in successfully.`,
        notificationType: 'IN_APP',
        recipientEmail: response.email,
        recipientRole: response.role,
      }).catch(() => undefined);

      // Success animation
      gsap.to(formRef.current, {
        scale: 0.95,
        opacity: 0,
        duration: 0.3,
        onComplete: () => navigate(getRedirectPath(response.role)),
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during login.');
      // Shake animation on error
      gsap.fromTo(
        formRef.current,
        { x: -10 },
        { x: 10, duration: 0.1, repeat: 5, yoyo: true, ease: 'power1.inOut' }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (!GOOGLE_CLIENT_ID) {
      setError('Google OAuth is not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file.');
      return;
    }
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const scope = 'openid email profile';
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}`;
    window.location.href = authUrl;
  };

  const handleGitHubLogin = () => {
    if (!GITHUB_CLIENT_ID) {
      setError('GitHub OAuth is not configured. Please set VITE_GITHUB_CLIENT_ID in your .env file.');
      return;
    }
    const redirectUri = `${window.location.origin}/auth/github/callback`;
    const scope = 'read:user user:email';
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
    window.location.href = authUrl;
  };

  return (
    <div ref={containerRef} className="min-h-screen flex overflow-hidden bg-gradient-to-br from-rose-50 via-white to-red-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div ref={floatingRef1} className="absolute top-20 left-20 w-72 h-72 bg-rose-200/30 rounded-full blur-3xl" />
        <div ref={floatingRef2} className="absolute bottom-20 right-20 w-96 h-96 bg-red-200/30 rounded-full blur-3xl" />
        <div ref={floatingRef3} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-200/20 rounded-full blur-3xl" />
      </div>

      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative z-10">
        <div className="w-full max-w-md space-y-8 bg-white rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 shadow-2xl">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
            </div>
            <Link to="/" className="font-display text-3xl font-black bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-transparent">
              QuickBite
            </Link>
          </div>

          {/* Title */}
          <div className="space-y-3">
            <h1 className="font-display text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
              Welcome<br />Back
            </h1>
            <p className="text-base sm:text-lg text-slate-600 font-medium">
              Sign in to continue your premium experience
            </p>
          </div>

          {/* Form */}
          <form ref={formRef} onSubmit={handleLogin} className="space-y-6">
            {/* Error Alert */}
            {error && (
              <div className="flex items-start gap-3 rounded-2xl bg-red-50 border border-red-200 px-4 py-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) validateEmail(e.target.value);
                  }}
                  onBlur={(e) => validateEmail(e.target.value)}
                  placeholder="chef@quickbite.com"
                  className={`w-full rounded-2xl bg-white border-2 ${
                    emailError ? 'border-red-300' : 'border-slate-200'
                  } px-12 py-4 text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10`}
                />
                {emailError && (
                  <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {emailError}
                  </p>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-slate-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-bold text-rose-600 hover:text-rose-700 transition-colors"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) validatePassword(e.target.value);
                  }}
                  onBlur={(e) => validatePassword(e.target.value)}
                  placeholder="Enter your password"
                  className={`w-full rounded-2xl bg-white border-2 ${
                    passwordError ? 'border-red-300' : 'border-slate-200'
                  } px-12 py-4 pr-14 text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                {passwordError && (
                  <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {passwordError}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-red-600 px-8 py-4 text-base font-bold text-white shadow-lg transition-colors duration-200 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500 font-semibold">Or continue with</span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="group flex items-center justify-center gap-3 rounded-2xl bg-white border-2 border-slate-200 px-5 py-4 font-bold text-slate-700 transition-all duration-300 hover:border-slate-300 hover:bg-slate-50 hover:shadow-lg active:scale-95"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="hidden sm:inline">Google</span>
            </button>
            <button
              type="button"
              onClick={handleGitHubLogin}
              className="group flex items-center justify-center gap-3 rounded-2xl bg-white border-2 border-slate-200 px-5 py-4 font-bold text-slate-700 transition-all duration-300 hover:border-slate-300 hover:bg-slate-50 hover:shadow-lg active:scale-95"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span className="hidden sm:inline">GitHub</span>
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-slate-600">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-bold text-rose-600 hover:text-rose-700 transition-colors"
            >
              Create one now
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Hero with Parallax */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div ref={heroImageRef} className="absolute inset-0 w-full h-[120%] -top-[10%]">
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80"
            alt="Premium food"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/70 to-white/30" />
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 via-transparent to-transparent" />

        <div className="relative z-10 flex flex-col justify-end p-16">
          <div className="space-y-6 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/10 backdrop-blur-md px-4 py-2 text-sm font-bold border border-rose-200">
              <Sparkles className="h-4 w-4 text-rose-600" />
              <span className="text-rose-900">Premium Food Delivery</span>
            </div>

            <h2 className="font-display text-6xl font-black leading-tight text-slate-900">
              Welcome back to the table.
            </h2>
            <p className="text-xl text-slate-700 font-medium">
              Fine dining, reordered for speed, clarity, and everyday access.
            </p>

            <div className="flex items-center gap-8 pt-8 border-t border-slate-300">
              <div>
                <div className="text-4xl font-black bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-transparent">10K+</div>
                <div className="text-sm text-slate-600 font-semibold">Active Users</div>
              </div>
              <div>
                <div className="text-4xl font-black bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-transparent">500+</div>
                <div className="text-sm text-slate-600 font-semibold">Restaurants</div>
              </div>
              <div>
                <div className="text-4xl font-black bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-transparent">4.9★</div>
                <div className="text-sm text-slate-600 font-semibold">Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
