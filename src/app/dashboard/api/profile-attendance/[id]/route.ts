import { NextResponse, NextRequest } from "next/server";
import pool from "@/app/lib/Database/db";
import { RowDataPacket } from "mysql2";

interface QueryResponse {
  total_attendance: number;
  total_hours: number;
  attendance_records: {
    date: string;
    time_in: string | null;
    time_out: string | null;
    duration_hours: number | null;
  }[];
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const connection = await pool.getConnection();
    console.log("ID: ", id)
    try {
      // Get user data
      const [userRows] = await connection.query<RowDataPacket[]>(
        "SELECT * FROM users WHERE id = ?",
        [id]
      );

      if (userRows.length === 0) {
        return NextResponse.json({ error: "User not found." }, { status: 404 });
      }

      // Combined query for summary and detailed attendance
      const [rows] = await connection.query<RowDataPacket[]>(
        `
        SELECT
          COUNT(DISTINCT DATE(time_in)) AS total_attendance,
          ROUND(SUM(TIMESTAMPDIFF(SECOND, time_in, time_out)) / 3600, 2) AS total_hours,
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'date', DATE(time_in),
              'time_in', TIME_FORMAT(time_in, '%H:%i:%s'),
              'time_out', TIME_FORMAT(time_out, '%H:%i:%s'),
              'duration_hours', ROUND(TIMESTAMPDIFF(SECOND, time_in, time_out) / 3600, 2)
            )
          ) AS attendance_records
        FROM attendance
        WHERE user_id = ?;
        `,
        [id]
      );

      const result = rows[0];
      const attendance_records = result.attendance_records
        ? JSON.parse(result.attendance_records) as QueryResponse["attendance_records"]
        : [];

      const summary: QueryResponse = {
        total_attendance: result.total_attendance || 0,
        total_hours: result.total_hours || 0,
        attendance_records,
      };

      return NextResponse.json(
        {
          user: userRows[0],
          attendance_summary: summary,
          message: "User data and attendance retrieved successfully",
        },
        { status: 200 }
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
