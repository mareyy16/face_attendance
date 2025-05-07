'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { Typography as AntTypography, Layout, Space } from 'antd';
import  Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { getRecordedLabels, addLabelToCookie, clearLabelsCookie } from '@/utils/attendanceCookies';
import LoginComponent from '@/components/LoginComponent';
import HeaderNav from '@/components/HeaderNav';


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
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lastLabel, setLastLabel] = useState<string>('');
  const [lastLabelTime, setLastLabelTime] = useState<string>('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

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
    <Layout
    style={{ minHeight: '100vh' }}>
    <HeaderNav/>
    <Box
      display="flex"
      justifyContent="space-evenly"
      alignItems="flex-start"
      // height="100vh"
      bgcolor="#f5f5f5"
      gap={'32px'}
      padding={'32px'}
    >
      <Card 
      sx={{ 
        width: '80%', 
        maxWidth: 900,
        padding: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
       }}
      >
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
              className="absolute top-0 left-0"
              style={{ transform: 'scaleX(-1)',borderRadius: '10px', width: '100%', height: '100%', position:'absolute', top:0, left:0, zIndex: 2, pointerEvents: 'none' }}
            />
          </div>
          <Space direction="vertical" style={{margin:'12px'}}>
            {lastLabel!==''&&<Text>Name: {lastLabel}</Text>}
            {lastLabelTime!==''&&<Text>Timed In: {lastLabelTime}</Text>}
          </Space>
        </CardContent>
      </Card>
      <LoginComponent/>
      
    </Box>
    <Snackbar anchorOrigin={{ vertical: 'top', horizontal:'center' }} open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
        </Alert>
    </Snackbar>
    </Layout>
    </>
  );
};

export default LandingPage;
