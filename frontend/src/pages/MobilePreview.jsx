import React, { useState, useEffect } from 'react';
import { Smartphone, Maximize2, Minimize2, RotateCcw, Wifi } from 'lucide-react';

const MobilePreview = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [deviceType, setDeviceType] = useState('iphone'); // 'iphone' or 'android'
  const [isLoading, setIsLoading] = useState(true);

  const expoWebUrl = 'http://localhost:8082';

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur border-b border-slate-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00BFA5] flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold">Rezvo Mobile App</h1>
              <p className="text-slate-400 text-sm">Live Preview - Expo Web</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Device Toggle */}
            <div className="flex bg-slate-700 rounded-lg p-1">
              <button 
                onClick={() => setDeviceType('iphone')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${deviceType === 'iphone' ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'}`}
              >
                iPhone
              </button>
              <button 
                onClick={() => setDeviceType('android')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${deviceType === 'android' ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'}`}
              >
                Android
              </button>
            </div>

            {/* Refresh */}
            <button 
              onClick={() => {
                setIsLoading(true);
                const iframe = document.getElementById('expo-iframe');
                if (iframe) iframe.src = iframe.src;
              }}
              className="p-2 rounded-lg bg-slate-700 text-slate-400 hover:text-white hover:bg-slate-600 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {/* Fullscreen */}
            <button 
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg bg-slate-700 text-slate-400 hover:text-white hover:bg-slate-600 transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Phone Frame */}
      <div className="flex items-center justify-center p-8">
        <div className={`relative ${deviceType === 'iphone' ? 'w-[375px]' : 'w-[360px]'}`}>
          {/* Phone Frame */}
          <div className={`bg-black rounded-[50px] p-3 shadow-2xl ${deviceType === 'iphone' ? '' : 'rounded-[30px]'}`}>
            {/* Screen */}
            <div className={`bg-white overflow-hidden relative ${deviceType === 'iphone' ? 'rounded-[40px]' : 'rounded-[24px]'}`} 
                 style={{ height: isFullscreen ? 'calc(100vh - 180px)' : '700px' }}>
              
              {/* Notch (iPhone only) */}
              {deviceType === 'iphone' && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[30px] bg-black rounded-b-2xl z-10" />
              )}

              {/* Status Bar */}
              <div className="absolute top-0 left-0 right-0 h-12 bg-[#FDFBF7] flex items-center justify-between px-6 z-10">
                <span className="text-xs font-semibold">9:41</span>
                <div className="flex items-center gap-1">
                  <Wifi className="w-4 h-4" />
                  <div className="w-6 h-3 border border-black rounded-sm">
                    <div className="w-4 h-full bg-black rounded-sm" />
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="absolute inset-0 bg-[#FDFBF7] flex flex-col items-center justify-center z-20">
                  <div className="w-16 h-16 rounded-2xl bg-[#00BFA5] flex items-center justify-center mb-4 animate-pulse">
                    <span className="text-white text-2xl font-bold">R</span>
                  </div>
                  <p className="text-[#0A1626] font-semibold">Loading Rezvo...</p>
                  <p className="text-[#627D98] text-sm mt-1">Starting Expo Web</p>
                  <div className="mt-4 w-32 h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#00BFA5] rounded-full animate-[loading_1.5s_ease-in-out_infinite]" style={{ width: '60%' }} />
                  </div>
                </div>
              )}

              {/* Expo Web iframe */}
              <iframe 
                id="expo-iframe"
                src={expoWebUrl}
                className="w-full h-full border-0"
                onLoad={() => setIsLoading(false)}
                onError={() => setIsLoading(false)}
                title="Rezvo Mobile App"
                allow="camera; microphone; geolocation"
              />
            </div>
          </div>

          {/* Home Indicator (iPhone only) */}
          {deviceType === 'iphone' && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/50 rounded-full" />
          )}
        </div>
      </div>

      {/* Connection Info */}
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-white text-sm font-medium">Connected to Expo Web</span>
          </div>
          <p className="text-slate-400 text-xs">
            Test credentials: testuser@example.com / password123
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobilePreview;
