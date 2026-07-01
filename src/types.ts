export interface User {
  id: string;
  username: string;
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

export type ActiveTab = "dashboard" | "global" | "my-notes" | "categories" | "users" | "profile";
