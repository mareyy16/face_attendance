'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, Typography, Button, Box } from '@mui/material';
import { Divider, Typography as AntTypography, Space } from 'antd';
import  Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useRouter } from 'next/navigation';
import { getRecordedLabels, addLabelToCookie, clearLabelsCookie } from '@/utils/attendanceCookies';


const { Text } = AntTypography;
interface detections{
  box0: number;
  box1: number;
  box2: number;
  box3: number;
  label: string;
  confidence: number;
}
const LandingPage = () => {
  // const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lastLabel, setLastLabel] = useState<string>('');
  const [lastLabelTime, setLastLabelTime] = useState<string>('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const router = useRouter();

  useEffect(() => {
    const intervalId = setInterval(() => {
      clearLabelsCookie();
    }, 60 * 60 * 1000); // 1 hour
  
    return () => clearInterval(intervalId);
  }, []);
  

  useEffect(() => {
    const initVideoStream = async () => {
      try {
        // Get user media (video stream)
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setVideoStream(stream);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing media devices:', err);
      }
    };

    // Initialize the video stream when the component mounts
    initVideoStream();

    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);
  const fetchAttendance = async(name:string) => {
    try {
      setSnackbarOpen(false);
      const res = await fetch("/api/auto-attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", 
        },
        body: JSON.stringify({name}),
      });
      const data = await res.json();
      const message = data.message+" for "+name || data.error || 'Unknown response';
      setSnackbarMessage(message);
      setSnackbarSeverity(data.message==='Time-in recorded'||data.message==='Time-out recorded' ? 'success' : 'error');
      setSnackbarOpen(true);
      // console.log('Attendance data: ',data)
      return data.message || data.error || 'Unknown response';
    } catch (err) {
      console.error(err);
      setSnackbarMessage('Encountered an error while fetching attendance');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return null;
    }
  }

  useEffect(() => {
    let animationFrameId: number;
    // let isProcessing = false;
  
    const processFrame = async() => {
      if (!videoRef.current || !canvasRef.current) {
        animationFrameId = requestAnimationFrame(processFrame);
        return;
      }
  
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video.readyState < 2) { // HAVE_CURRENT_DATA
        animationFrameId = requestAnimationFrame(processFrame);
        return;
      }
  
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
  
      if (!ctx) {
        animationFrameId = requestAnimationFrame(processFrame);
        return;
      }
  
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataURL = canvas.toDataURL("image/jpeg", 0.7); // base64 string
      
  
          try {
            const res = await fetch("http://localhost:8000/inference", {
              method: "POST",
              headers: {
                "Content-Type": "application/json", 
              },
              body: JSON.stringify({image:dataURL}),
            });
  
            const detections_data:detections[] = await res.json();
            // console.log('Detections data: ',detections_data)
            for (const box of detections_data) {
              const label = box.label;
              if (label && !getRecordedLabels().has(label)) {
                const response = await fetchAttendance(label);
                if (response === 'Time-in recorded' || response==='Time-out recorded') {
                  addLabelToCookie(label);
                  setLastLabel(label);
                  setLastLabelTime(new Date().toLocaleTimeString());
                }
              }
            }
            
          } catch (err) {
            console.error(err);
          }
        animationFrameId = requestAnimationFrame(processFrame);
    };
  
    animationFrameId = requestAnimationFrame(processFrame);
  
    return () => cancelAnimationFrame(animationFrameId);
  }, []);


  return (
    <>
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      bgcolor="#f5f5f5"
    >
      <Card sx={{ width: 600 }}>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom>
            Attendance Camera
          </Typography>
          <div style={{ position: 'relative', width: '100%', height: 'auto' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', borderRadius: '10px', transform: 'scaleX(-1)', top:0, left:0, zIndex:1 }}
            />
            <canvas
              ref={canvasRef}
              // width={640}
              // height={480}
              className="absolute top-0 left-0"
              style={{ transform: 'scaleX(-1)',borderRadius: '10px', width: '100%', height: '100%', position:'absolute', top:0, left:0, zIndex: 2, pointerEvents: 'none' }}
            />
            {/* <canvas
              ref={overlayCanvasRef} // for custom overlays / highlights / labels
              style={{
                width: '100%',
                height: '100%',
                transform: 'scaleX(-1)',
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 5,
                pointerEvents: 'none',
                borderRadius: '10px'
              }}
            /> */}
          </div>
          <Space direction="vertical" style={{margin:'12px'}}>
            {lastLabel!==''&&<Text>Name: {lastLabel}</Text>}
            {lastLabelTime!==''&&<Text>Timed In: {lastLabelTime}</Text>}
          </Space>
          <Divider />
          <Text italic style={{display:"flex", justifyContent:"center"}}>{"Don't have an account?"}</Text>
          <Box display="flex" justifyContent="center" mt={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push('/register')}
              
            >
              Register
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
    <Snackbar anchorOrigin={{ vertical: 'top', horizontal:'center' }} open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
        </Alert>
    </Snackbar>
    </>
  );
};

export default LandingPage;
