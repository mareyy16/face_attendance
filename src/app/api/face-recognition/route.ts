import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { peerId } = data;

  if (!peerId) {
    return NextResponse.json({ message: 'Missing peerId' }, { status: 400 });
  }

  const process = spawn('python3', ['python_scripts/face_recognition.py', peerId]);

  let result = '';
  let error = '';

  process.stdout.on('data', (data) => {
    result += data.toString();
  });

  process.stderr.on('data', (data) => {
    error += data.toString();
  });

  process.on('close', (code) => {
    if (code !== 0) {
      return NextResponse.json({ message: 'Face recognition failed', error }, { status: 500 });
    }
    return NextResponse.json({ message: 'Recognition complete', result }, {status: 200});
  });
}
