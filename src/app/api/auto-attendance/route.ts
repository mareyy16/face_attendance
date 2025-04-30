import { NextResponse } from "next/server";
import pool from "@/app/lib/Database/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";

interface AttendanceRecord extends RowDataPacket {
  attendance_id: number;
  time_in: string; // Format: 'HH:MM:SS'
}

export async function POST(req: Request) {
  try {
    const { name }: { name: string } = await req.json();
    const connection = await pool.getConnection();

    try {
      // Get user ID
      const [userRows] = await connection.query<RowDataPacket[]>(
        "SELECT id FROM users WHERE name = ?",
        [name]
      );

      if (userRows.length === 0) {
        return NextResponse.json({ error: "User not found." }, { status: 404 });
      }

      const userId = userRows[0].id;
      const today = new Date().toISOString().split("T")[0]; // 'YYYY-MM-DD'

      // Check if there's an attendance record for today
      const [attendanceRows] = await connection.query<AttendanceRecord[]>(
        "SELECT attendance_id, time_in FROM attendance WHERE user_id = ? AND date = ?",
        [userId, today]
      );

      const now = new Date();

      if (attendanceRows.length === 0) {
        // No record: insert time_in
        await connection.query<ResultSetHeader>(
          "INSERT INTO attendance (user_id, date, time_in) VALUES (?, ?, ?)",
          [userId, today, now.toTimeString().split(" ")[0]] // 'HH:MM:SS'
        );

        return NextResponse.json({ message: "Time-in recorded"}, { status: 201 });
      } else {
        // Record exists: check if 1 hour passed since time_in
        const timeIn = new Date(`${today}T${attendanceRows[0].time_in}`);
        const diffMs = (now.getTime() - timeIn.getTime())/(1000 * 60 * 60);//60 mins // adjust accordingly
        // const diffHours = diffMs / (1000 * 60 * 60);

        if (diffMs >= 1) {
          await connection.query<ResultSetHeader>(
            "UPDATE attendance SET time_out = ? WHERE attendance_id = ?",
            [now.toTimeString().split(" ")[0], attendanceRows[0].attendance_id]
          );

          return NextResponse.json({ message: "Time-out recorded" }, { status: 200 });
        } else {
          return NextResponse.json(
            { message: "Cannot log out yet. Minimum 1 hour required." },
            { status: 403 }
          );
        }
      }
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
