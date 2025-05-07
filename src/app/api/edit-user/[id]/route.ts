import { NextResponse, NextRequest } from "next/server";
import pool from "@/app/lib/Database/db";
import { User } from "@/app/lib/Interface/interface";
import { FieldPacket } from "mysql2";
export async function POST(req: NextRequest, {params}: {params: {id: string}}) {
  try {
    const { id } = params;
    const { name, email, company_name, designation, contact_number} = await req.json();
    const connection = await pool.getConnection();
    console.log("User ID:", id);
    try {
        const updateQuery = `
        UPDATE users
        SET 
          name = ?,
          email = ?,
          company_name = ?,
          designation = ?,
          contact_number = ?
        WHERE id = ?
      `
      const updateValues = [
        name,
        email,
        company_name,
        designation,
        contact_number,
        id
      ];
      await connection.query(
        updateQuery,
        updateValues
      ) as [User[], FieldPacket[]];
      const [userRows]: [User[], FieldPacket[]] = await connection.query(
        "SELECT * FROM users WHERE id = ?",
        [id]
    ) as [User[], FieldPacket[]];
    if (userRows.length === 0) {
        return NextResponse.json({ error: "User not found." }, { status: 404 });
    }
        console.log("User data:", userRows[0]);
        return NextResponse.json({user: userRows[0], message:"User Data Updated Successfully"}, {status: 200});
    } finally {
        if(connection) connection.release();
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
