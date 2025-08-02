import React, { useRef, useEffect, useState } from 'react';
import { Camera, CameraOff, Navigation } from 'lucide-react';

interface ARCameraProps {
  isActive: boolean;
  onToggle: () => void;
  currentInstruction: string;
  language: 'tamil' | 'english';
}

export const ARCamera: React.FC<ARCameraProps> = ({ 
  isActive, 
  onToggle, 
  currentInstruction,
  language 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [isActive]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError('');
    } catch (err) {
      setError(language === 'tamil' 
        ? 'கேமரா அணுகல் பிழை. தயவுசெய்து அனுமதிகளை சரிபார்க்கவும்.'
        : 'Camera access error. Please check permissions.'
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  if (!isActive) {
    return (
      <div className="flex items-center justify-center p-4">
        <button
          onClick={onToggle}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200"
        >
          <Camera className="w-5 h-5" />
          <span>{language === 'tamil' ? 'AR வழிசெலுத்தல்' : 'AR Navigation'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      {error ? (
        <div className="flex items-center justify-center h-full text-white p-4">
          <div className="text-center">
            <CameraOff className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <p className="text-sm">{error}</p>
            <button
              onClick={onToggle}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              {language === 'tamil' ? 'மூடு' : 'Close'}
            </button>
          </div>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          
          {/* AR Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Simple Direction Arrow */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Navigation className="w-16 h-16 text-yellow-400 animate-pulse drop-shadow-lg" />
              <div className="mt-2 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg text-sm text-center animate-pulse">
                {language === 'tamil' ? 'என்னைப் பின்தொடர்!' : 'Follow me!'}
              </div>
            </div>
            
            {/* Instruction Overlay */}
            <div className="absolute bottom-20 left-0 right-0 px-4">
              <div className="bg-black bg-opacity-70 text-white p-4 rounded-lg text-center">
                <p className="text-lg font-semibold">{currentInstruction}</p>
              </div>
            </div>
          </div>
          
          {/* Controls */}
          <div className="absolute top-4 right-4 flex space-x-2">
            <button
              onClick={onToggle}
              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full"
            >
              <CameraOff className="w-5 h-5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};