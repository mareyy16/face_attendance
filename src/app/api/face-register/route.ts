import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import { Readable } from 'stream';
import pool from "@/app/lib/Database/db";
import { User } from '@/app/lib/Interface/interface';
// import bcrypt from "bcryptjs";

// import { User } from "@/app/lib/Interface/interface";
import { FieldPacket, ResultSetHeader } from "mysql2";
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
  async function insertUser(name:string, imageData:string){
    const connection = await pool.getConnection();
    try{
      const existingUser: [User[], FieldPacket[]] = await connection.query("SELECT id FROM users WHERE name = ?", [name]) as [User[], FieldPacket[]];
            console.log('Existing user: ', existingUser[0]);
            if (existingUser[0].length > 0) {
              console.log("User already exists, will just update the face data...")
              const updateQuery = `
        UPDATE users
        SET 
          profile_image = ?
        WHERE name = ?
      `
      const updateValues = [
        imageData,
        name
      ];
      // const values=[name, email, hashedPassword, company, designation, new Date(), imageData, role, age, contact_number];

      await connection.query(
        updateQuery,
        updateValues
      ) as [User[], FieldPacket[]];
            } else {
              console.log("User does not exist, will create a new user...")
              // ✅ Insert new user
              console.log('Will insert user ');
              const query = `
              INSERT INTO users (name, registered_at, profile_image) VALUES (?, ?, ?)
              `;
              const values=[name, new Date(), imageData];

              const [result] = await connection.query(
                query,
                values
              ) as [ResultSetHeader, FieldPacket[]];
              console.log('Inserted user ');
              const userId = result.insertId;
              console.log('User ID: ', userId);
            }
    }catch(error){
      console.error('Database query error:', error);
    }finally{
      if(connection) connection.release();
    }
  }
  export async function POST(req: Request) {
    try {
      const body = await req.json();
      const { frames } = body;
      const result = await processFrames(frames);
      await insertUser(frames[0].label, frames[0].data);
      
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
  
