'use client';

import React, { useEffect, useRef, useState } from 'react';
import Skeleton from '@mui/material/Skeleton';
type CameraCaptureProps = {
  onFrameCapture?: (frameBase64: string) => void;
  startScan: boolean;
};

const CameraCapture: React.FC<CameraCaptureProps> = ({ onFrameCapture, startScan }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraStarted, setCameraStarted] = useState<boolean>(false);
  const [bRadius, setBRadius] = useState('0');

  useEffect(() => {
    const startCamera = async () => {
      const facingMode: MediaTrackConstraints['facingMode'] = 'user'; // always front camera

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().then(() => {
              setCameraStarted(true);
              setBRadius('49% 49% 49% 49% / 39% 39% 58% 58%')
            }).catch((err) => {
              console.error("Play error:", err);
            });
          };
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    };

    startCamera();

    return () => {
      const stream = videoRef.current?.srcObject as MediaStream | null;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    if (!cameraStarted || !videoRef.current) return;

    const canvas = document.createElement('canvas');
    const interval = setInterval(() => {
      const video = videoRef.current;
      if (!video) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const base64Image = canvas.toDataURL('image/jpeg');

      if (onFrameCapture) {
        if (startScan) {
          onFrameCapture(base64Image);
        }
      }
    }, 300);

    return () => clearInterval(interval);
  }, [cameraStarted, startScan, onFrameCapture]);

  return (
    // <>
    <div className="flex flex-col items-center" style={{ borderRadius: bRadius, width: '350px', overflow: 'hidden', justifySelf: 'center' }}>
      <video
        ref={videoRef}
        className="shadow-lg"
        muted
        playsInline
        style={{objectFit: 'cover', position:'relative', left:'-145px',  transform:'scaleX(-1)'}}
      />
      {!cameraStarted && <Skeleton variant="rectangular" width={350} height={400} style={{position:'relative', top:'-145px'}}/>}
      
    </div>
  );
};

export default CameraCapture;
