import { NextResponse } from "next/server";
import pool from "@/app/lib/Database/db";
import bcrypt from "bcryptjs";
import { RowDataPacket } from "mysql2";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const connection = await pool.getConnection();

    try {
        // Get user ID
        const [userRows] = await connection.query<RowDataPacket[]>(
            "SELECT id, password FROM users WHERE email = ?",
            [email]
        );
        if (userRows.length === 0) {
            return NextResponse.json({ error: "User not found." }, { status: 404 });
        }
        const userId = userRows[0].id;
        const isMatch = await bcrypt.compare(password, userRows[0].password);
        if (!isMatch) {
            return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
        }
        const [userData] = await connection.query<RowDataPacket[]>(
            "SELECT u.* FROM users u WHERE id = ?",
            [userId]
        );
        return NextResponse.json({...userData[0]}, {status: 200});
    } finally {
        if(connection) connection.release();
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
