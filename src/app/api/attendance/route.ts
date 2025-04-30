import { NextRequest, NextResponse } from 'next/server';
import pool from "@/app/lib/Database/db";
export const dynamic = 'force-dynamic'; // ensures SSR API behavior in Next.js 13+

export async function GET(req: NextRequest) {
    if(req.method !== 'GET') {
        return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
    }
    let connection = null;
    try {
        connection = await pool.getConnection();
        // const connection = await mysql.createConnection(dbConfig);

        const [rows] = await connection.query(`
        SELECT 
            attendance.attendance_id,
            users.name,
            users.company_name,
            users.designation,
            users.email,
            attendance.date,
            attendance.time_in,
            attendance.time_out
        FROM attendance
        JOIN users ON attendance.user_id = users.id
        ORDER BY attendance.date DESC, attendance.time_in DESC
        `);
        // await connection.end();
        return NextResponse.json({ success: true, data: rows }, { status: 200 });
    } catch (error) {
        console.error('Error fetching attendance data:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch attendance records' }, { status: 500 });
    } finally {
        if(connection) connection.release();
    }
}
