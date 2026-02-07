import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../../lib/api';
import './NewAuthCallback.css';

const NewAuthCallbackPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Connecting Google...');
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const handleCallback = async () => {
      try {
        let sessionId = null;
        
        if (location.hash) {
          const hashParams = new URLSearchParams(location.hash.substring(1));
          sessionId = hashParams.get('session_id');
        }
        
        if (!sessionId) {
          const searchParams = new URLSearchParams(location.search);
          sessionId = searchParams.get('session_id') || searchParams.get('token');
        }
        
        if (!sessionId) {
          throw new Error('No authentication token received');
        }

        setMessage('Fetching your profile...');
        
        let userInfo = { email: null, name: null, picture: null, session_token: null, sub: null };
        try {
          const authResponse = await api.get(`/auth/emergent-session/${sessionId}`);
          userInfo = {
            email: authResponse.data.email,
            name: authResponse.data.name,
            picture: authResponse.data.picture,
            session_token: authResponse.data.session_token,
            sub: authResponse.data.sub || authResponse.data.id
          };
        } catch (e) {
          console.error('Failed to fetch session info:', e);
          throw new Error('Could not verify your Google authentication. Please try again.');
        }
        
        if (!userInfo.email) {
          throw new Error('Could not retrieve email from Google authentication');
        }

        localStorage.removeItem('rezvo_token');
        localStorage.removeItem('rezvo_user');

        const profileStr = sessionStorage.getItem('signup_profile');
        const profile = profileStr ? JSON.parse(profileStr) : {};

        setMessage('Creating your account...');

        const response = await api.post('/auth/google-signup', {
          google_token: sessionId,
          google_id: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name || profile.fullName,
          full_name: profile.fullName || userInfo.name,
          business_name: profile.businessName,
          address: profile.address ? `${profile.address}, ${profile.postcode || ''}` : null,
          phone: sessionStorage.getItem('signup_phone'),
          auth_method: 'google'
        });

        const { token, is_new_user, onboarding_completed } = response.data;

        localStorage.setItem('rezvo_token', token);
        localStorage.removeItem('rezvo_user');
        
        // Store Google user info for the signup flow
        sessionStorage.setItem('google_user_email', userInfo.email);
        sessionStorage.setItem('google_user_name', userInfo.name || '');
        sessionStorage.setItem('auth_method', 'google');

        setStatus('success');
        setMessage('Connected!');
        
        // After showing success, redirect based on user state
        setTimeout(() => {
          if (!is_new_user && onboarding_completed) {
            // Existing user - go to dashboard
            window.location.href = '/dashboard';
          } else {
            // New user or incomplete onboarding - go to business type in new signup flow
            window.location.href = '/signup?step=5';
          }
        }, 2000);

      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage(error.response?.data?.detail || error.message || 'Authentication failed');
        
        setTimeout(() => {
          navigate('/signup');
        }, 3000);
      }
    };

    handleCallback();
  }, [location, navigate]);

  return (
    <div className={`auth-callback-overlay ${status === 'processing' || status === 'success' ? 'show' : ''}`}>
      <div className="ring"></div>
      <div className="circ">
        {status === 'processing' && (
          <div className="spinner"></div>
        )}
        {status === 'success' && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        )}
        {status === 'error' && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        )}
      </div>
      <h3>{message}</h3>
      <p>{status === 'processing' ? 'Please wait...' : status === 'success' ? 'Redirecting...' : 'Redirecting back...'}</p>
      
      {/* Rezi mascot */}
      <img 
        src="/showcase/rezi-thumbsup.png" 
        alt="Rezi" 
        className={`callback-rezi ${status === 'success' ? 'show' : ''}`}
      />
    </div>
  );
};

export default NewAuthCallbackPage;
