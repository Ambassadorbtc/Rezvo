import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api';

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState('processing'); // 'processing' | 'success' | 'error'
  const [message, setMessage] = useState('Completing sign up...');
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const handleCallback = async () => {
      try {
        // Parse the hash fragment for session_id from Emergent Auth
        // URL format: /auth-callback#session_id=xxx
        let sessionId = null;
        
        // Check hash first (Emergent Auth format)
        if (location.hash) {
          const hashParams = new URLSearchParams(location.hash.substring(1));
          sessionId = hashParams.get('session_id');
        }
        
        // Fallback to query params
        if (!sessionId) {
          const searchParams = new URLSearchParams(location.search);
          sessionId = searchParams.get('session_id') || searchParams.get('token');
        }
        
        console.log('Auth callback - sessionId:', sessionId);
        
        if (!sessionId) {
          throw new Error('No authentication token received');
        }

        setMessage('Fetching your profile...');
        
        // Fetch user info from Emergent Auth via our backend proxy (avoids CORS issues)
        let userInfo = { email: null, name: null, picture: null, session_token: null, sub: null };
        try {
          const authResponse = await api.get(`/auth/emergent-session/${sessionId}`);
          console.log('Emergent Auth response:', authResponse.data);
          userInfo = {
            email: authResponse.data.email,
            name: authResponse.data.name,
            picture: authResponse.data.picture,
            session_token: authResponse.data.session_token,
            sub: authResponse.data.sub || authResponse.data.id  // Google's unique user ID
          };
        } catch (e) {
          console.error('Failed to fetch session info:', e);
          throw new Error('Could not verify your Google authentication. Please try again.');
        }
        
        if (!userInfo.email) {
          throw new Error('Could not retrieve email from Google authentication');
        }

        // Clear any existing auth data to prevent conflicts
        localStorage.removeItem('rezvo_token');
        localStorage.removeItem('rezvo_user');

        // Get stored profile data from signup flow
        const profileStr = sessionStorage.getItem('signup_profile');
        const profile = profileStr ? JSON.parse(profileStr) : {};

        setMessage('Creating your account...');

        // Register/login with Google auth
        const response = await api.post('/auth/google-signup', {
          google_token: sessionId,
          google_id: userInfo.sub,  // Pass Google's unique ID for verification
          email: userInfo.email,
          name: userInfo.name || profile.fullName,
          full_name: profile.fullName || userInfo.name,
          business_name: profile.businessName,
          address: profile.address ? `${profile.address}, ${profile.postcode || ''}` : null,
          phone: sessionStorage.getItem('signup_phone'),
          auth_method: 'google'
        });

        const { token, is_new_user, onboarding_completed } = response.data;

        // Store JWT token - MUST use 'rezvo_token' key to match AuthContext
        localStorage.setItem('rezvo_token', token);
        // Clear cached user data so AuthContext fetches fresh
        localStorage.removeItem('rezvo_user');
        
        // Clear signup session data
        sessionStorage.removeItem('auth_method');
        sessionStorage.removeItem('signup_user_type');
        sessionStorage.removeItem('signup_profile');
        sessionStorage.removeItem('signup_phone');
        sessionStorage.removeItem('google_user_email');
        sessionStorage.removeItem('google_user_name');

        setStatus('success');
        
        // Determine where to redirect based on user state
        if (!is_new_user && onboarding_completed) {
          // Existing user who completed onboarding - go to dashboard
          setMessage('Welcome back!');
          toast.success('Welcome back to Rezvo!');
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1500);
        } else if (!is_new_user && !onboarding_completed) {
          // Existing user who hasn't completed onboarding
          setMessage('Continuing setup...');
          toast.success('Welcome back! Let\'s complete your setup.');
          setTimeout(() => {
            window.location.href = '/signup/business-type';
          }, 1500);
        } else {
          // New user
          setMessage('Account created successfully!');
          toast.success('Welcome to Rezvo!');
          
          const hasProfile = profile.fullName && profile.businessName;
          setTimeout(() => {
            if (hasProfile) {
              // Profile filled, go to phone verification
              window.location.href = '/signup/verify-phone';
            } else {
              // Need to fill profile first - store Google user info
              sessionStorage.setItem('auth_method', 'google');
              sessionStorage.setItem('google_user_email', userInfo.email);
              sessionStorage.setItem('google_user_name', userInfo.name || '');
              window.location.href = '/signup/profile';
            }
          }, 1500);
        }

      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        
        // Handle specific error cases
        const errorMessage = error.response?.data?.detail || error.message || 'Authentication failed';
        setMessage(errorMessage);
        
        // Show appropriate toast
        if (error.response?.status === 409) {
          toast.error('Please login with your email and password');
        } else if (error.response?.status === 403) {
          toast.error('Google account mismatch');
        } else {
          toast.error('Failed to complete signup');
        }
        
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    };

    handleCallback();
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
          <Calendar className="w-6 h-6 text-white" />
        </div>
        <span className="text-2xl font-bold text-gray-900">Rezvo</span>
      </div>

      {/* Status Card */}
      <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-xl text-center">
        {status === 'processing' && (
          <>
            <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{message}</h2>
            <p className="text-gray-500">Please wait while we set up your account</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{message}</h2>
            <p className="text-gray-500">Redirecting you to continue...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-500 mb-4">{message}</p>
            <p className="text-sm text-gray-400">Redirecting back...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallbackPage;
