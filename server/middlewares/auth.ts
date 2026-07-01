import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "cm-notes-super-secret-key-2026";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: "admin" | "user";
  };
}

// Authentication middleware to verify JWT
export function authenticateToken(req: any, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: "Token tidak ditemukan. Silakan login." });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ message: "Token tidak valid atau kedaluwarsa." });
    }
    
    req.user = decoded as { id: string; username: string; role: "admin" | "user" };
    next();
  });
}

// Role authorization middleware: Admin only
export function requireAdmin(req: any, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Akses ditolak. Hanya Admin yang diperbolehkan." });
  }
  next();
}
