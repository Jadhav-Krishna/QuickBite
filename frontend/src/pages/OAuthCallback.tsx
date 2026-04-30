import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { login: saveLogin } = useAuth();
  const [searchParams] = useSearchParams();
  const [processed, setProcessed] = useState(false);

  useEffect(() => {
    if (processed) return;

    const handleCallback = () => {
      try {
        const token = searchParams.get('token');
        const refreshToken = searchParams.get('refreshToken');
        const userId = searchParams.get('userId');
        const email = searchParams.get('email');
        const role = searchParams.get('role');
        const fullName = searchParams.get('fullName');
        const error = searchParams.get('error');

        if (error) {
          throw new Error(error);
        }

        if (!token || !refreshToken || !userId || !email || !role) {
          throw new Error('Missing authentication data');
        }

        const user = {
          userId: parseInt(userId),
          email: email,
          fullName: fullName || '',
          role: role,
        };

        saveLogin(user, token, refreshToken);
        setProcessed(true);

        // Redirect based on role
        const getRedirectPath = (userRole: string) => {
          switch (userRole?.toUpperCase()) {
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

        navigate(getRedirectPath(role), { replace: true });
      } catch (err: any) {
        console.error('OAuth callback error:', err);
        setProcessed(true);
        navigate('/login?error=' + encodeURIComponent(err?.message || 'Authentication failed'), { replace: true });
      }
    };

    handleCallback();
  }, [processed, navigate, saveLogin, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-red-600 mx-auto" />
        <p className="text-slate-600 font-semibold">Completing authentication...</p>
      </div>
    </div>
  );
}
