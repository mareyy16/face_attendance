import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import { Readable } from 'stream';

let pythonProcess: ReturnType<typeof spawn> | null = null;

// Type definition for each frame
type Frame = {
  label: string;
  data: string; // base64 image string
};
const getPythonPath = () => {
    const basePath = path.join(process.cwd(), '.venv');
    if (process.platform === 'win32') {
      return path.join(basePath, 'Scripts', 'python.exe');
    } else {
      return path.join(basePath, 'bin', 'python');
    }
  };
// Main function to process frames
async function processFrames(frames: Frame[]): Promise<string> {
    if (pythonProcess) {
      console.warn('Python process is already running. Skipping frame processing.');
      return 'Python process already running';
    }
  
    return new Promise((resolve, reject) => {
      try {
        const label = frames[0].label;
        const encodedLabel = label.replace(/ñ/g, 'n');
        const base64Frames = frames.map((frame) => frame.data);
        const pythonPath = getPythonPath();
        const scriptPath = path.join(process.cwd(), 'python_scripts', 'face-registration.py');
  
        console.log('Starting Python process...');
        pythonProcess = spawn(pythonPath, [scriptPath, encodedLabel]);
  
        const stream = Readable.from(base64Frames.map((f) => f + '\n'));
        stream.pipe(pythonProcess.stdin!);
  
        let pythonOutput = '';
        pythonProcess.stdout?.on('data', (data) => {
          pythonOutput += data.toString();
        });
  
        pythonProcess.stderr?.on('data', (data) => {
          console.error(`Python Error: ${data}`);
        });
  
        pythonProcess.on('close', (code) => {
          console.log(`Python process exited with code ${code}`);
          console.log('Python script output:', pythonOutput.trim());
          pythonProcess = null;
          resolve(pythonOutput.trim());
        });
  
      } catch (error) {
        console.error('Error processing frames:', error);
        if (pythonProcess) {
          pythonProcess.kill('SIGINT');
          pythonProcess = null;
        }
        reject(error);
      }
    });
  }
async function runPythonScript() {

    // After frames are processed, spawn the fine-tuning python script
    const pythonPath = getPythonPath();
    const fineTuningScriptPath = path.join(process.cwd(), 'python_scripts', 'fine-tuning.py');
    const fineTuneProcess = spawn(pythonPath, [fineTuningScriptPath]);
    console.log("Strated Fine-tuning process")
    fineTuneProcess.stdout.on('data', (data) => {
      console.log(`Python Output: ${data}`);
      // Handle the output data as needed
    });
  
    fineTuneProcess.stderr.on('data', (data) => {
      console.error(`Python Error: ${data}`);
      // Handle the error data as needed
    });
  
    fineTuneProcess.on('close', (code) => {
      console.log(`Python process exited with code ${code}`);
      // Perform any cleanup or further processing
    });
  }
  export async function POST(req: Request) {
    try {
      const body = await req.json();
      const { frames } = body;
      const result = await processFrames(frames);

      await runPythonScript();
      return NextResponse.json({
        message: result,
      });
    } catch (error) {
      console.error('Error in face register route:', error);
      return NextResponse.json(
        { error: 'Failed to process face registration.' },
        { status: 500 }
      );
    }

  }
  
