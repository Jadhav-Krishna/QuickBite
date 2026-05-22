import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, Sparkles, ArrowRight, AlertCircle, Building2, MapPin } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { authService, type SignupRole } from '../api/auth';

gsap.registerPlugin(ScrollTrigger);

// Validation patterns
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
const NAME_REGEX = /^[a-zA-Z\s'-]+$/;
const PHONE_REGEX = /^(\+91[6-9]\d{9}|[6-9]\d{9})$/;

export default function SignUp() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<SignupRole>('CUSTOMER');
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantAddress, setRestaurantAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Validation errors
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);
  const floatingRef1 = useRef<HTMLDivElement>(null);
  const floatingRef2 = useRef<HTMLDivElement>(null);

  const isRestaurantOwner = role === 'RESTAURANT_OWNER';

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(containerRef.current, {
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
      });

      gsap.from(formRef.current?.children || [], {
        opacity: 0,
        y: 20,
        stagger: 0.05,
        duration: 0.6,
        ease: 'power3.out',
        delay: 0.2,
      });

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

      // Parallax effect
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
    if (!PASSWORD_REGEX.test(value)) {
      setPasswordError('Password must contain uppercase, lowercase, number, and special character');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateName = (first: string, last: string): boolean => {
    const fullName = `${first} ${last}`.trim();
    if (!fullName || fullName.length < 2) {
      setNameError('Full name is required');
      return false;
    }
    if (!NAME_REGEX.test(fullName)) {
      setNameError('Name can only contain letters, spaces, hyphens, and apostrophes');
      return false;
    }
    setNameError('');
    return true;
  };

  const validatePhone = (value: string): boolean => {
    if (!value) {
      setPhoneError('');
      return true;
    }
    if (!PHONE_REGEX.test(value)) {
      setPhoneError('Enter valid Indian mobile number (10 digits, 6-9)');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isNameValid = validateName(firstName, lastName);
    const isPhoneValid = validatePhone(phone);

    if (!isEmailValid || !isPasswordValid || !isNameValid || !isPhoneValid) {
      return;
    }

    setLoading(true);

    try {
      const fullName = `${firstName} ${lastName}`.trim();
      const normalizedPhone = phone.trim();

      await authService.signup({
        email,
        password,
        fullName,
        phone: normalizedPhone || undefined,
        role,
        restaurantName: isRestaurantOwner ? restaurantName : undefined,
        restaurantAddress: isRestaurantOwner ? restaurantAddress : undefined,
      });

      gsap.to(formRef.current, {
        scale: 0.95,
        opacity: 0,
        duration: 0.3,
        onComplete: () => navigate('/login'),
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during signup.');
      gsap.fromTo(
        formRef.current,
        { x: -10 },
        { x: 10, duration: 0.1, repeat: 5, yoyo: true, ease: 'power1.inOut' }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen flex bg-gradient-to-br from-rose-50 via-white to-red-50">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div ref={floatingRef1} className="absolute top-20 right-20 w-72 h-72 bg-red-200/30 rounded-full blur-3xl" />
        <div ref={floatingRef2} className="absolute bottom-20 left-20 w-96 h-96 bg-rose-200/30 rounded-full blur-3xl" />
      </div>

      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative z-10">
        <div className="w-full max-w-2xl space-y-5 py-6 bg-white rounded-3xl px-6 sm:px-10 shadow-2xl">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500 to-red-600 rounded-xl blur-lg opacity-50" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-600 shadow-xl">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
            </div>
            <Link to="/" className="font-display text-2xl font-black bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-transparent">
              QuickBite
            </Link>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="font-display text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
              Join the Table
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-medium">
              Create your account and experience premium delivery
            </p>
          </div>

          {/* Form */}
          <form ref={formRef} onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700">First Name</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      if (nameError) validateName(e.target.value, lastName);
                    }}
                    placeholder="John"
                    className="w-full rounded-xl bg-white border-2 border-slate-200 pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    if (nameError) validateName(firstName, e.target.value);
                  }}
                  placeholder="Doe"
                  className="w-full rounded-xl bg-white border-2 border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10"
                />
              </div>
            </div>
            {nameError && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {nameError}
              </p>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) validateEmail(e.target.value);
                  }}
                  onBlur={(e) => validateEmail(e.target.value)}
                  placeholder="john@example.com"
                  className={`w-full rounded-xl bg-white border-2 ${
                    emailError ? 'border-red-300' : 'border-slate-200'
                  } pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10`}
                />
                {emailError && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {emailError}
                  </p>
                )}
              </div>
            </div>

            {/* Phone & Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700">Phone (Optional)</label>
                <div className="relative group">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (phoneError) validatePhone(e.target.value);
                    }}
                    onBlur={(e) => validatePhone(e.target.value)}
                    placeholder="+919876543210"
                    className={`w-full rounded-xl bg-white border-2 ${
                      phoneError ? 'border-red-300' : 'border-slate-200'
                    } pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10`}
                  />
                  {phoneError && (
                    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {phoneError}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as SignupRole)}
                  className="w-full rounded-xl bg-white border-2 border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition-all duration-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10"
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="RESTAURANT_OWNER">Restaurant Owner</option>
                  <option value="DELIVERY_AGENT">Delivery Agent</option>
                </select>
              </div>
            </div>

            {/* Restaurant Fields */}
            {isRestaurantOwner && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-700">Restaurant Name</label>
                  <div className="relative group">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
                    <input
                      type="text"
                      value={restaurantName}
                      onChange={(e) => setRestaurantName(e.target.value)}
                      required={isRestaurantOwner}
                      placeholder="The Urban Spoon"
                      className="w-full rounded-xl bg-white border-2 border-slate-200 pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-700">Restaurant Address</label>
                  <div className="relative group">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
                    <input
                      type="text"
                      value={restaurantAddress}
                      onChange={(e) => setRestaurantAddress(e.target.value)}
                      required={isRestaurantOwner}
                      placeholder="123 Main St"
                      className="w-full rounded-xl bg-white border-2 border-slate-200 pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) validatePassword(e.target.value);
                  }}
                  onBlur={(e) => validatePassword(e.target.value)}
                  placeholder="Create a secure password"
                  className={`w-full rounded-xl bg-white border-2 ${
                    passwordError ? 'border-red-300' : 'border-slate-200'
                  } pl-10 pr-12 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                {passwordError && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {passwordError}
                  </p>
                )}
              </div>
              <p className="text-xs text-slate-500">
                8+ chars with uppercase, lowercase, number & special character
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-red-600 px-8 py-3.5 text-base font-bold text-white shadow-lg transition-colors duration-200 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-rose-600 hover:text-rose-700 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Hero with Parallax */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div ref={heroImageRef} className="absolute inset-0 w-full h-[120%] -top-[10%]">
          <img
            src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&q=80"
            alt="Chef preparing food"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/70 to-white/30" />
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 via-transparent to-transparent" />

        <div className="relative z-10 flex flex-col justify-end p-16">
          <div className="space-y-6 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/10 backdrop-blur-md px-4 py-2 text-sm font-bold border border-rose-200">
              <Sparkles className="h-4 w-4 text-rose-600" />
              <span className="text-rose-900">Join 10,000+ Happy Users</span>
            </div>

            <h2 className="font-display text-6xl font-black leading-tight text-slate-900">
              QuickBite
            </h2>
            <p className="text-xl text-slate-700 font-medium">
              The art of fine dining, delivered.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
