import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import api from '../lib/api';

const ShortLinkRedirect = () => {
  const { shortCode } = useParams();
  const [redirectTo, setRedirectTo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const resolveLink = async () => {
      try {
        const response = await api.get(`/b/${shortCode}`);
        if (response.data?.business_id) {
          setRedirectTo(`/book/${response.data.business_id}`);
        } else {
          setError(true);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (shortCode) {
      resolveLink();
    }
  }, [shortCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-xl bg-[#00BFA5] flex items-center justify-center mb-4">
          <span className="text-2xl font-bold text-white">R</span>
        </div>
        <div className="w-8 h-8 border-2 border-[#00BFA5] border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-[#627D98]">Redirecting to booking page...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center mb-4">
          <span className="text-2xl font-bold text-gray-400">?</span>
        </div>
        <h1 className="text-xl font-bold text-[#0A1626] mb-2">Link not found</h1>
        <p className="text-[#627D98] mb-6">This booking link doesn't exist or has expired.</p>
        <a href="/" className="text-[#00BFA5] font-medium hover:underline">
          Go to Rezvo homepage
        </a>
      </div>
    );
  }

  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  return null;
};

export default ShortLinkRedirect;
