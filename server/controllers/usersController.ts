import { Response } from "express";
import bcrypt from "bcryptjs";
import { readDb, writeDb } from "../db";
import { User } from "../types";

// Get helper function to resolve bcrypt hash function regardless of bundler/transpiler state
function getBcryptHash(): (s: string, salt: number) => string {
  if (typeof bcrypt.hashSync === "function") {
    return bcrypt.hashSync;
  }
  if (bcrypt && typeof (bcrypt as any).default?.hashSync === "function") {
    return (bcrypt as any).default.hashSync;
  }
  throw new Error("bcrypt.hashSync is not defined or not a function");
}

// Get all users (Admin only)
export function getUsers(req: any, res: Response) {
  try {
    const db = readDb();
    
    // Return users without sensitive password hash
    const safeUsers = db.users.map((user) => ({
      id: user.id,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt
    }));

    return res.json(safeUsers);
  } catch (error: any) {
    console.error("[getUsers Error]:", error);
    return res.status(500).json({ message: "Gagal mengambil daftar pengguna: " + error.message });
  }
}

// Create a user (Admin only)
export function createUser(req: any, res: Response) {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ message: "Username, password, dan role wajib diisi." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password minimal harus 6 karakter." });
    }

    if (role !== "admin" && role !== "user") {
      return res.status(400).json({ message: "Role harus 'admin' atau 'user'." });
    }

    const db = readDb();

    // Check if username already exists
    const existingUser = db.users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase().trim()
    );

    if (existingUser) {
      return res.status(400).json({ message: "Username sudah terdaftar. Silakan pilih nama lain." });
    }

    let hashedPassword = "";
    try {
      const hashFunc = getBcryptHash();
      hashedPassword = hashFunc(password, 10);
    } catch (bcryptErr: any) {
      console.error("[createUser Error] Bcrypt hash failed:", bcryptErr);
      return res.status(500).json({ message: "Kesalahan enkripsi server: " + bcryptErr.message });
    }

    const newUser: User = {
      id: "u-" + Date.now(),
      username: username.trim(),
      password: hashedPassword,
      role: role as "admin" | "user",
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    writeDb(db);

    return res.status(201).json({
      message: "User berhasil dibuat.",
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        createdAt: newUser.createdAt
      }
    });
  } catch (error: any) {
    console.error("[createUser Error]:", error);
    return res.status(500).json({ message: "Gagal membuat pengguna: " + error.message });
  }
}

// Update a user (Admin only - e.g., edit role or reset password)
export function updateUser(req: any, res: Response) {
  try {
    const { id } = req.params;
    const { role, password } = req.body;

    const db = readDb();
    const userIndex = db.users.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      return res.status(404).json({ message: "User tidak ditemukan." });
    }

    const user = db.users[userIndex];

    // Safeguard: don't let admins demote the last admin or themselves if they are not careful,
    // but let's allow updating role if it's not the logged-in admin demoting themselves.
    if (id === req.user?.id && role === "user" && user.role === "admin") {
      return res.status(400).json({ message: "Anda tidak dapat mengubah role Anda sendiri menjadi user biasa." });
    }

    if (role) {
      if (role !== "admin" && role !== "user") {
        return res.status(400).json({ message: "Role tidak valid." });
      }
      user.role = role;
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: "Password baru minimal harus 6 karakter." });
      }
      try {
        const hashFunc = getBcryptHash();
        user.password = hashFunc(password, 10);
      } catch (bcryptErr: any) {
        console.error("[updateUser Error] Bcrypt hash failed:", bcryptErr);
        return res.status(500).json({ message: "Kesalahan enkripsi server: " + bcryptErr.message });
      }
    }

    db.users[userIndex] = user;
    writeDb(db);

    return res.json({
      message: "User berhasil diperbarui.",
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error: any) {
    console.error("[updateUser Error]:", error);
    return res.status(500).json({ message: "Gagal memperbarui pengguna: " + error.message });
  }
}

// Delete a user (Admin only)
export function deleteUser(req: any, res: Response) {
  try {
    const { id } = req.params;

    if (id === req.user?.id) {
      return res.status(400).json({ message: "Anda tidak dapat menghapus akun Anda sendiri." });
    }

    const db = readDb();
    const userIndex = db.users.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      return res.status(404).json({ message: "User tidak ditemukan." });
    }

    const userToDelete = db.users[userIndex];

    // Also remove this user's private notes to clean up (or we can reassign them, but deleting is typical)
    // Let's delete their private notes, but keep global notes they created (reassigned or kept as 'admin').
    db.notes = db.notes.filter(
      (note) => note.isGlobal === true || note.createdBy !== id
    );

    db.users.splice(userIndex, 1);
    writeDb(db);

    return res.json({
      message: `User '${userToDelete.username}' beserta catatan pribadinya berhasil dihapus.`
    });
  } catch (error: any) {
    console.error("[deleteUser Error]:", error);
    return res.status(500).json({ message: "Gagal menghapus pengguna: " + error.message });
  }
}
