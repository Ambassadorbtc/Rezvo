import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api';

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing'); // 'processing' | 'success' | 'error'
  const [message, setMessage] = useState('Completing sign up...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get token from URL params (Emergent Auth returns it as 'token')
        const token = searchParams.get('token');
        const email = searchParams.get('email');
        const name = searchParams.get('name');
        
        if (!token) {
          throw new Error('No authentication token received');
        }

        // Get stored form data
        const formDataStr = sessionStorage.getItem('signup_form_data');
        const phone = sessionStorage.getItem('signup_phone');
        const formData = formDataStr ? JSON.parse(formDataStr) : {};

        setMessage('Creating your account...');

        // Register/login with Google auth
        const response = await api.post('/auth/google-signup', {
          google_token: token,
          email: email,
          name: name || formData.fullName,
          full_name: formData.fullName || name,
          business_name: formData.businessName,
          address: formData.address,
          phone: phone,
          auth_method: 'google'
        });

        // Store JWT token
        localStorage.setItem('token', response.data.token);
        sessionStorage.setItem('new_signup', 'true');
        
        // Clear signup session data
        sessionStorage.removeItem('phone_verified');
        sessionStorage.removeItem('signup_phone');
        sessionStorage.removeItem('signup_user_type');
        sessionStorage.removeItem('signup_form_data');

        setStatus('success');
        setMessage('Account created successfully!');
        
        toast.success('Welcome to Rezvo!');
        
        // Navigate to onboarding wizard
        setTimeout(() => {
          navigate('/onboarding-wizard');
        }, 1000);

      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage(error.response?.data?.detail || error.message || 'Authentication failed');
        
        toast.error('Failed to complete signup');
        
        setTimeout(() => {
          navigate('/complete-profile');
        }, 2000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

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
            <p className="text-gray-500">Redirecting you to complete setup...</p>
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
