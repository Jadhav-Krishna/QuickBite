import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { authService, type SignupRole } from '../api/auth';
import AuthSplitLayout from '../components/auth/AuthSplitLayout';

const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

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

  const isRestaurantOwner = role === 'RESTAURANT_OWNER';

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const fullName = `${firstName} ${lastName}`.trim();
      const normalizedPhone = phone.trim();

      if (!fullName) {
        throw new Error('Full name is required.');
      }

      if (normalizedPhone && !PHONE_REGEX.test(normalizedPhone)) {
        throw new Error('Enter a valid phone number in international format.');
      }

      await authService.signup({
        email,
        password,
        fullName,
        phone: normalizedPhone || undefined,
        role,
        restaurantName: isRestaurantOwner ? restaurantName : undefined,
        restaurantAddress: isRestaurantOwner ? restaurantAddress : undefined,
      });
      navigate('/login');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during signup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthSplitLayout
      title="Join the Table"
      description="Create your account and step into the premium QuickBite experience."
      imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuCogmpyZNPC9cnifdmQ7T-Qe7vuj5I8zH-Nty3D8DD3HiHF0DwkV8lIuUgbkxzEKbDK8RaZzbeEuliw5Zrpq4groYP6qTqIZzNKCcUeqxDK-THxLThtSpFbLrBbx4HsraDEBNx7zpkf53uEgGVikhNd9xoMUvYApanFCb2KL0tD0watpbaiesyl3YXM_6pVq3zbjTg3RF4mktZEm6UiArYF3GiGFxnqeoye4Uvjp-fBIjR-0HaS1lQr_nUFqK_RLmpE-pXhhya68G4"
      imageAlt="Chef plating a gourmet dish"
      quoteTitle="QuickBite"
      quoteText="The art of fine dining, delivered."
      reverse
    >
      <form className="space-y-5" onSubmit={handleSignup}>
        {error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 ml-1 block text-sm font-semibold text-[var(--color-on-surface-variant)]">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              required
              placeholder="Jane"
              className="w-full rounded-2xl border border-transparent bg-[var(--color-surface-container-highest)] px-5 py-4 outline-none transition focus:border-[var(--color-outline-variant)] focus:bg-white"
            />
          </div>
          <div>
            <label className="mb-2 ml-1 block text-sm font-semibold text-[var(--color-on-surface-variant)]">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              required
              placeholder="Doe"
              className="w-full rounded-2xl border border-transparent bg-[var(--color-surface-container-highest)] px-5 py-4 outline-none transition focus:border-[var(--color-outline-variant)] focus:bg-white"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 ml-1 block text-sm font-semibold text-[var(--color-on-surface-variant)]">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            placeholder="jane@example.com"
            className="w-full rounded-2xl border border-transparent bg-[var(--color-surface-container-highest)] px-5 py-4 outline-none transition focus:border-[var(--color-outline-variant)] focus:bg-white"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 ml-1 block text-sm font-semibold text-[var(--color-on-surface-variant)]">Phone (Optional)</label>
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+14155552671"
              className="w-full rounded-2xl border border-transparent bg-[var(--color-surface-container-highest)] px-5 py-4 outline-none transition focus:border-[var(--color-outline-variant)] focus:bg-white"
            />
          </div>
          <div>
            <label className="mb-2 ml-1 block text-sm font-semibold text-[var(--color-on-surface-variant)]">Role</label>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as SignupRole)}
              className="w-full rounded-2xl border border-transparent bg-[var(--color-surface-container-highest)] px-5 py-4 outline-none transition focus:border-[var(--color-outline-variant)] focus:bg-white"
            >
              <option value="CUSTOMER">Customer</option>
              <option value="RESTAURANT_OWNER">Restaurant Owner</option>
              <option value="DELIVERY_AGENT">Delivery Agent</option>
            </select>
          </div>
        </div>

        {isRestaurantOwner ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 ml-1 block text-sm font-semibold text-[var(--color-on-surface-variant)]">Restaurant Name</label>
              <input
                type="text"
                value={restaurantName}
                onChange={(event) => setRestaurantName(event.target.value)}
                required={isRestaurantOwner}
                placeholder="The Urban Spoon"
                className="w-full rounded-2xl border border-transparent bg-[var(--color-surface-container-highest)] px-5 py-4 outline-none transition focus:border-[var(--color-outline-variant)] focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-2 ml-1 block text-sm font-semibold text-[var(--color-on-surface-variant)]">Restaurant Address</label>
              <input
                type="text"
                value={restaurantAddress}
                onChange={(event) => setRestaurantAddress(event.target.value)}
                required={isRestaurantOwner}
                placeholder="123 Main St, Springfield"
                className="w-full rounded-2xl border border-transparent bg-[var(--color-surface-container-highest)] px-5 py-4 outline-none transition focus:border-[var(--color-outline-variant)] focus:bg-white"
              />
            </div>
          </div>
        ) : null}

        <div>
          <label className="mb-2 ml-1 block text-sm font-semibold text-[var(--color-on-surface-variant)]">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              placeholder="Create a secure password"
              className="w-full rounded-2xl border border-transparent bg-[var(--color-surface-container-highest)] px-5 py-4 pr-14 outline-none transition focus:border-[var(--color-outline-variant)] focus:bg-white"
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
          {loading ? 'Creating Account...' : 'Create Account'}
          {!loading ? <ArrowRight size={18} /> : null}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-[var(--color-on-surface-variant)]">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-[var(--color-primary)] transition hover:text-[var(--color-secondary-container)]">
          Log in
        </Link>
      </p>
    </AuthSplitLayout>
  );
}