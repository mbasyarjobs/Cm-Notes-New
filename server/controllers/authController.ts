import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { readDb, writeDb } from "../db";

const JWT_SECRET = process.env.JWT_SECRET || "cm-notes-super-secret-key-2026";

// Get helper function to resolve bcrypt functions regardless of bundler/transpiler state
function getBcryptCompare(): (s: string, hash: string) => boolean {
  if (typeof bcrypt.compareSync === "function") {
    return bcrypt.compareSync;
  }
  if (bcrypt && typeof (bcrypt as any).default?.compareSync === "function") {
    return (bcrypt as any).default.compareSync;
  }
  throw new Error("bcrypt.compareSync is not defined or not a function");
}

function getBcryptHash(): (s: string, salt: number) => string {
  if (typeof bcrypt.hashSync === "function") {
    return bcrypt.hashSync;
  }
  if (bcrypt && typeof (bcrypt as any).default?.hashSync === "function") {
    return (bcrypt as any).default.hashSync;
  }
  throw new Error("bcrypt.hashSync is not defined or not a function");
}

function getJwtSign(): any {
  if (typeof jwt.sign === "function") {
    return jwt.sign;
  }
  if (jwt && typeof (jwt as any).default?.sign === "function") {
    return (jwt as any).default.sign;
  }
  throw new Error("jwt.sign is not defined or not a function");
}

// Login Admin/User
export function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username dan password wajib diisi." });
    }

    const db = readDb();
    const user = db.users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase().trim()
    );

    if (!user) {
      return res.status(401).json({ message: "Username atau password salah." });
    }

    // Compare hashed password with resilient helper
    let isValid = false;
    try {
      const compareFunc = getBcryptCompare();
      isValid = compareFunc(password, user.password || "");
    } catch (bcryptErr: any) {
      console.error("[Login Error] Bcrypt compare failed:", bcryptErr);
      return res.status(500).json({ 
        message: `Kesalahan enkripsi server: ${bcryptErr.message || bcryptErr}` 
      });
    }

    if (!isValid) {
      return res.status(401).json({ message: "Username atau password salah." });
    }

    // Generate JWT token with resilient helper
    let token = "";
    try {
      const signFunc = getJwtSign();
      token = signFunc(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: "24h" }
      );
    } catch (jwtErr: any) {
      console.error("[Login Error] JWT sign failed:", jwtErr);
      return res.status(500).json({ 
        message: `Kesalahan token server: ${jwtErr.message || jwtErr}` 
      });
    }

    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error: any) {
    console.error("[Login Error] Server internal exception:", error);
    return res.status(500).json({ 
      message: `Kesalahan server internal saat login: ${error.message || error}` 
    });
  }
}

// Change Password (Self)
export function changePassword(req: any, res: Response) {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user?.id;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Password lama dan baru wajib diisi." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password baru minimal harus 6 karakter." });
    }

    const db = readDb();
    const userIndex = db.users.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ message: "User tidak ditemukan." });
    }

    const user = db.users[userIndex];

    // Verify old password
    let isOldValid = false;
    try {
      const compareFunc = getBcryptCompare();
      isOldValid = compareFunc(oldPassword, user.password || "");
    } catch (bcryptErr: any) {
      console.error("[Password Change Error] Bcrypt compare failed:", bcryptErr);
      return res.status(500).json({ 
        message: `Kesalahan enkripsi server: ${bcryptErr.message || bcryptErr}` 
      });
    }

    if (!isOldValid) {
      return res.status(400).json({ message: "Password lama salah." });
    }

    // Hash new password and save
    try {
      const hashFunc = getBcryptHash();
      user.password = hashFunc(newPassword, 10);
    } catch (bcryptErr: any) {
      console.error("[Password Change Error] Bcrypt hash failed:", bcryptErr);
      return res.status(500).json({ 
        message: `Kesalahan enkripsi server: ${bcryptErr.message || bcryptErr}` 
      });
    }

    db.users[userIndex] = user;
    writeDb(db);

    return res.json({ message: "Password berhasil diperbarui." });
  } catch (error: any) {
    console.error("[Password Change Error] Server internal exception:", error);
    return res.status(500).json({ 
      message: `Kesalahan server internal: ${error.message || error}` 
    });
  }
}

// Get Current User Profile
export function getProfile(req: any, res: Response) {
  try {
    const userId = req.user?.id;
    const db = readDb();
    const user = db.users.find((u) => u.id === userId);

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan." });
    }

    return res.json({
      id: user.id,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt
    });
  } catch (error: any) {
    console.error("[Profile Error] Server internal exception:", error);
    return res.status(500).json({ 
      message: `Kesalahan server internal: ${error.message || error}` 
    });
  }
}
