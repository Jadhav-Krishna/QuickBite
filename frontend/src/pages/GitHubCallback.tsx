import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { authService } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function GitHubCallback() {
  const navigate = useNavigate();
  const { login: saveLogin } = useAuth();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');

        if (!code) {
          throw new Error('No authorization code received from GitHub');
        }

        // Exchange code for access token via backend
        // Note: This requires a backend endpoint to exchange the code
        // For now, we'll send the code as the token (backend needs to handle exchange)
        const response = await authService.loginWithOAuth2({
          provider: 'GITHUB',
          token: code,
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
        setError(err?.message || 'GitHub authentication failed');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    void handleCallback();
  }, [navigate, saveLogin, searchParams]);

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
            <p className="text-slate-600 font-semibold">Authenticating with GitHub...</p>
          </>
        )}
      </div>
    </div>
  );
}
