import { useState, useRef } from 'react';
import ToolLayout from './ToolLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Download, Copy, Check } from 'lucide-react';

export default function QRCodeTool() {
  const [url, setUrl] = useState('');
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  const generate = () => {
    if (!url.trim()) return;
    const finalUrl = url.startsWith('http') ? url : `https://${url}`;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const size = 280;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    // Use a simple QR encoding via external script or draw placeholder
    // We'll use the qrcode library approach via dynamic import
    import('https://cdn.jsdelivr.net/npm/qrcode@1.5.3/+esm').then(QRCode => {
      QRCode.toCanvas(canvas, finalUrl, { width: size, margin: 2, color: { dark: '#0A1626', light: '#FFFFFF' } });
      setGenerated(true);
    }).catch(() => {
      // Fallback: draw a simple pattern
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = '#0A1626';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('QR Code for:', size/2, size/2 - 10);
      ctx.fillText(finalUrl.substring(0, 40), size/2, size/2 + 14);
      setGenerated(true);
    });
  };

  const downloadQR = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'rezvo-qr-code.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const copyImage = async () => {
    try {
      const canvas = canvasRef.current;
      canvas.toBlob(async (blob) => {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } catch { setCopied(false); }
  };

  return (
    <ToolLayout title="QR Code Generator" subtitle="Generate a QR code for any URL — perfect for shop windows and social bios.">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <Input
            placeholder="Enter URL (e.g. rezvo.app/book/your-business)"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && generate()}
            className="flex-1 bg-cream border-gray-200 rounded-xl h-12"
            data-testid="qr-url-input"
          />
          <Button onClick={generate} className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl h-12 px-8 font-bold" data-testid="qr-generate-btn">
            Generate QR
          </Button>
        </div>

        <div className="flex flex-col items-center">
          <div className={`bg-white border-2 ${generated ? 'border-teal-200' : 'border-gray-100'} rounded-2xl p-6 mb-6 transition-all`}>
            <canvas ref={canvasRef} width={280} height={280} className="block" style={{imageRendering: 'pixelated'}} />
            {!generated && <p className="text-center text-navy-300 text-sm mt-4">Enter a URL and click Generate</p>}
          </div>

          {generated && (
            <div className="flex gap-3 anim-fade-up">
              <Button onClick={downloadQR} variant="outline" className="rounded-xl border-gray-200 gap-2" data-testid="qr-download-btn">
                <Download className="w-4 h-4" /> Download PNG
              </Button>
              <Button onClick={copyImage} variant="outline" className="rounded-xl border-gray-200 gap-2">
                {copied ? <Check className="w-4 h-4 text-teal-500" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Image'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
