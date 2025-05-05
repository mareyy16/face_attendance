import { NextResponse } from "next/server";
import pool from "@/app/lib/Database/db";
import bcrypt from "bcryptjs";

import { User } from "@/app/lib/Interface/interface";
import { FieldPacket, ResultSetHeader } from "mysql2";
export async function POST(req: Request) {
  try {
    const { formData, imageData } = await req.json();
    const { name, email, password, company, designation, age, contact_number } = formData;
   
    console.log('Profile Image: ', imageData);
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
      let role = 'employee'
      if (email === process.env.ADMIN1_EMAIL) {
        role = 'admin';
      }
      // ✅ Insert new user
      console.log('Will insert user ');
      const query = `
      INSERT INTO users (name, email, password, company_name, designation, registered_at, profile_image, role, age, contact_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values=[name, email, hashedPassword, company, designation, new Date(), imageData, role, age, contact_number];

      const [result] = await connection.query(
        query,
        values
      ) as [ResultSetHeader, FieldPacket[]];
      console.log('Inserted user ');

      const userId = result.insertId;
      console.log('User ID: ', userId);

      
      const response = NextResponse.json({role: role, id: userId , message: "User registered successfully!"},{ status: 201 });
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
