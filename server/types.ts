export interface User {
  id: string;
  username: string;
  password?: string; // Hashed password, optional when sending to client
  role: "admin" | "user";
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  command: string;
  notes: string;
  category: string;
  isGlobal: boolean;
  createdBy: string;
  creatorUsername: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: "admin" | "user";
  };
}
