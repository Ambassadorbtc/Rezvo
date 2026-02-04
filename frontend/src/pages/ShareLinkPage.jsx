import { useState, useEffect } from 'react';
import api from '../lib/api';
import AppLayout from '../components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Link2, Copy, Share2, QrCode, Check, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const ShareLinkPage = () => {
  const [loading, setLoading] = useState(true);
  const [linkData, setLinkData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generateLink();
  }, []);

  const generateLink = async () => {
    try {
      const response = await api.get('/links/generate');
      setLinkData(response.data);
    } catch (error) {
      toast.error('Failed to generate link');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!linkData?.link) return;
    
    try {
      await navigator.clipboard.writeText(linkData.link);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const shareLink = async () => {
    if (!linkData?.link) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Book with ${linkData.business_name}`,
          text: 'Book your appointment here',
          url: linkData.link,
        });
      } catch (error) {
        // User cancelled or error
      }
    } else {
      copyToClipboard();
    }
  };

  // Generate QR code URL using a free API
  const qrCodeUrl = linkData?.link 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(linkData.link)}&bgcolor=16191F&color=FFFFFF`
    : null;

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-blaze border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6 max-w-2xl mx-auto" data-testid="share-link-page">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Share Your Booking Link</h1>
          <p className="text-white/50 mt-2">Share this link anywhere and let clients book with you</p>
        </div>

        {/* Main Link Card - Ticket Style */}
        <Card className="bg-obsidian-paper border-blaze/30 overflow-hidden relative" data-testid="booking-link-card">
          {/* Top accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-blaze" />
          
          <CardContent className="p-6 md:p-8">
            {/* Business Name */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-blaze flex items-center justify-center mx-auto mb-4">
                <Link2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold">{linkData?.business_name || 'Your Business'}</h2>
              <p className="text-white/50 text-sm">Booking Link</p>
            </div>

            {/* Link Display */}
            <div className="mb-6">
              <div className="flex items-center gap-2 p-4 rounded-xl bg-obsidian border border-white/10">
                <Input
                  value={linkData?.link || ''}
                  readOnly
                  className="bg-transparent border-0 text-center text-blaze font-mono text-sm focus-visible:ring-0"
                  data-testid="booking-link-input"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={copyToClipboard}
                className={`py-6 rounded-xl font-semibold transition-all ${
                  copied 
                    ? 'bg-success hover:bg-success text-white' 
                    : 'bg-gradient-blaze hover:opacity-90 text-white'
                }`}
                data-testid="copy-link-btn"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5 mr-2" />
                    Copy Link
                  </>
                )}
              </Button>
              <Button
                onClick={shareLink}
                variant="outline"
                className="py-6 rounded-xl font-semibold border-white/10 hover:bg-white/5"
                data-testid="share-link-btn"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Share
              </Button>
            </div>
          </CardContent>

          {/* Ticket divider */}
          <div className="relative">
            <div className="absolute left-0 w-6 h-6 bg-obsidian rounded-full -translate-x-1/2" />
            <div className="absolute right-0 w-6 h-6 bg-obsidian rounded-full translate-x-1/2" />
            <div className="border-t border-dashed border-white/10 mx-6" />
          </div>

          {/* QR Code Section */}
          <CardContent className="p-6 md:p-8">
            <div className="text-center">
              <p className="text-white/50 text-sm mb-4">Or scan QR code</p>
              {qrCodeUrl ? (
                <div className="inline-block p-4 bg-white rounded-xl">
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code" 
                    className="w-40 h-40"
                    data-testid="qr-code-img"
                  />
                </div>
              ) : (
                <div className="w-48 h-48 bg-white/10 rounded-xl flex items-center justify-center mx-auto">
                  <QrCode className="w-12 h-12 text-white/30" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Preview Link */}
        <Card className="bg-obsidian-paper border-white/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Preview Your Booking Page</h3>
                <p className="text-sm text-white/50">See what your clients will see</p>
              </div>
              <a href={linkData?.link} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="border-white/10" data-testid="preview-link-btn">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-obsidian-paper border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Tips for sharing</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-white/60">
              <li className="flex items-start gap-2">
                <span className="text-blaze">•</span>
                Add to your Instagram bio link
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blaze">•</span>
                Share in your TikTok videos
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blaze">•</span>
                Send to clients via WhatsApp
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blaze">•</span>
                Print the QR code for your shop
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ShareLinkPage;
