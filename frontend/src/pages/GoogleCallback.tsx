import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { authService } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function GoogleCallback() {
  const navigate = useNavigate();
  const { login: saveLogin } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extract access token from URL hash
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');

        if (!accessToken) {
          throw new Error('No access token received from Google');
        }

        // Send token to backend for validation and user creation/login
        const response = await authService.loginWithOAuth2({
          provider: 'GOOGLE',
          token: accessToken,
        });

        const user = {
          userId: response.userId,
          email: response.email,
          fullName: response.fullName,
          role: response.role,
        };

        saveLogin(user, response.accessToken, response.refreshToken);

        // Redirect based on role
        const redirectPath = response.role === 'ADMIN' ? '/admin/overview' : '/restaurants';
        navigate(redirectPath);
      } catch (err: any) {
        setError(err?.message || 'Google authentication failed');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    void handleCallback();
  }, [navigate, saveLogin]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white">
      <div className="text-center space-y-4">
        {error ? (
          <>
            <div className="text-red-600 font-bold text-lg">{error}</div>
            <p className="text-slate-600">Redirecting to login...</p>
          </>
        ) : (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-[var(--color-primary)] mx-auto" />
            <p className="text-slate-600 font-semibold">Authenticating with Google...</p>
          </>
        )}
      </div>
    </div>
  );
}
