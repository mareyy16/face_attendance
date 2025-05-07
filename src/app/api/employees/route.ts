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
            users.id,
            users.name,
            users.company_name,
            users.designation,
            users.contact_number,
            attendance.date
        FROM users
        LEFT JOIN attendance
        ON attendance.user_id = users.id
        AND DATE(attendance.date) = CURDATE()
        ORDER BY users.id ASC
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
