import { NextResponse } from "next/server";
import pool from "@/app/lib/Database/db";
import { FieldPacket } from "mysql2";
import { User } from "@/app/lib/Interface/interface";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();
    const connection = await pool.getConnection();

    try {
        await connection.query(
            "UPDATE users SET isActive = 0 WHERE id = ?", 
            [id]
        ) as [User[], FieldPacket[]];
        return NextResponse.json({message:"User logged out successfully."}, {status: 200});
    } finally {
        if(connection) connection.release();
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
