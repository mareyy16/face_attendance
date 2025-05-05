import { NextResponse, NextRequest } from "next/server";
import pool from "@/app/lib/Database/db";
import { RowDataPacket } from "mysql2";

export async function GET(req: NextRequest, {params}: {params: {id: string}}) {
  try {
    const { id } = params;
    const connection = await pool.getConnection();
    console.log("User ID:", id);
    try {
        // Get user data
        const [userRows] = await connection.query<RowDataPacket[]>(
            "SELECT * FROM users WHERE id = ?",
            [id]
        );
        if (userRows.length === 0) {
            return NextResponse.json({ error: "User not found." }, { status: 404 });
        }
        console.log("User data:", userRows[0]);
        return NextResponse.json({...userRows[0], message:"User Data Retrieved Successfully"}, {status: 200});
    } finally {
        if(connection) connection.release();
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
