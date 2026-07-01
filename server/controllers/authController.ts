import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { readDb, writeDb } from "../db";

const JWT_SECRET = process.env.JWT_SECRET || "cm-notes-super-secret-key-2026";

// Login Admin/User
export function login(req: Request, res: Response) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username dan password wajib diisi." });
  }

  const db = readDb();
  const user = db.users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );

  if (!user) {
    return res.status(401).json({ message: "Username atau password salah." });
  }

  // Compare hashed password
  const isValid = bcrypt.compareSync(password, user.password || "");
  if (!isValid) {
    return res.status(401).json({ message: "Username atau password salah." });
  }

  // Generate JWT token (expires in 24 hours)
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: "24h" }
  );

  return res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt
    }
  });
}

// Change Password (Self)
export function changePassword(req: any, res: Response) {
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
  const isOldValid = bcrypt.compareSync(oldPassword, user.password || "");
  if (!isOldValid) {
    return res.status(400).json({ message: "Password lama salah." });
  }

  // Hash new password and save
  user.password = bcrypt.hashSync(newPassword, 10);
  db.users[userIndex] = user;
  writeDb(db);

  return res.json({ message: "Password berhasil diperbarui." });
}

// Get Current User Profile
export function getProfile(req: any, res: Response) {
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
}
