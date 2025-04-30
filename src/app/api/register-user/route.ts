import { NextResponse } from "next/server";
import pool from "@/app/lib/Database/db";
import bcrypt from "bcryptjs";

import { User } from "@/app/lib/Interface/interface";
import { FieldPacket, ResultSetHeader } from "mysql2";
export async function POST(req: Request) {
  try {
    const { name, email, password, company, designation } = await req.json();
   

    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    // ✅ Check database connection
    const connection = await pool.getConnection();
    try{
      // ✅ Check if email already exists
      const existingUser: [User[], FieldPacket[]] = await connection.query("SELECT id FROM users WHERE email = ?", [email]) as [User[], FieldPacket[]];
      console.log('Existing user: ', existingUser[0]);
      if (existingUser[0].length > 0) {
        return NextResponse.json({ error: `The email: ${email} is already registered.`, title:"Account already exists" }, { status: 400 });
      }

      // ✅ Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      // ✅ Insert new user
      console.log('Will insert user ');
      const query = `
      INSERT INTO users (name, email, password, company_name, designation, registered_at) VALUES (?, ?, ?, ?, ?, ?)
      `;
      const values=[name, email, hashedPassword, company, designation, new Date()];

      await connection.query(
        query,
        values
      ) as [ResultSetHeader, FieldPacket[]];
      console.log('Inserted user ');

    //   const userId = result.insertId;

      
      const response = NextResponse.json({ message: "User registered successfully!"},{ status: 201 });
      return response;
    } catch(error){
      throw new Error (`Database error: ${error}`);
    } finally {
      if(connection) connection.release();
    }
    
  } catch (error) {
    console.error("Signup Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
