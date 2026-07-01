import { Response } from "express";
import { readDb, writeDb } from "../db";
import { Note } from "../types";

// Get notes according to user's role and identity
export function getNotes(req: any, res: Response) {
  const userId = req.user?.id;
  const userRole = req.user?.role;

  if (!userId) {
    return res.status(401).json({ message: "Pengguna tidak terautentikasi." });
  }

  const db = readDb();

  let notes: Note[] = [];

  if (userRole === "admin") {
    // Admin can see everything: all global notes + all private notes
    notes = db.notes;
  } else {
    // Regular user can see: all global notes + their own private notes
    notes = db.notes.filter(
      (note) => note.isGlobal === true || note.createdBy === userId
    );
  }

  // Sort notes by creation date (newest first)
  notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return res.json(notes);
}

// Create a new note
export function createNote(req: any, res: Response) {
  const { title, command, notes, category, isGlobal } = req.body;
  const userId = req.user?.id;
  const username = req.user?.username;
  const userRole = req.user?.role;

  if (!title || !command) {
    return res.status(400).json({ message: "Judul dan Isi Command wajib diisi." });
  }

  // Enforce that only admins can create global notes
  const noteIsGlobal = userRole === "admin" ? !!isGlobal : false;

  const db = readDb();

  const newNote: Note = {
    id: "n-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
    title: title.trim(),
    command: command.trim(),
    notes: (notes || "").trim(),
    category: category || "Lainnya",
    isGlobal: noteIsGlobal,
    createdBy: userId,
    creatorUsername: username,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.notes.push(newNote);
  writeDb(db);

  return res.status(201).json({
    message: "Catatan berhasil dibuat.",
    note: newNote
  });
}

// Update an existing note
export function updateNote(req: any, res: Response) {
  const { id } = req.params;
  const { title, command, notes, category, isGlobal } = req.body;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  if (!title || !command) {
    return res.status(400).json({ message: "Judul dan Isi Command wajib diisi." });
  }

  const db = readDb();
  const noteIndex = db.notes.findIndex((n) => n.id === id);

  if (noteIndex === -1) {
    return res.status(404).json({ message: "Catatan tidak ditemukan." });
  }

  const currentNote = db.notes[noteIndex];

  // Authorization check:
  // Admin can edit anything.
  // User can only edit their own private notes. They CANNOT edit global notes or other people's notes.
  if (userRole !== "admin") {
    if (currentNote.createdBy !== userId) {
      return res.status(403).json({ message: "Akses ditolak. Anda tidak berhak mengedit catatan ini." });
    }
    if (currentNote.isGlobal) {
      return res.status(403).json({ message: "Hanya Admin yang dapat mengedit catatan global." });
    }
  }

  // Update properties
  currentNote.title = title.trim();
  currentNote.command = command.trim();
  currentNote.notes = (notes || "").trim();
  currentNote.category = category || "Lainnya";
  
  // Only admin can change isGlobal status
  if (userRole === "admin") {
    currentNote.isGlobal = !!isGlobal;
  }

  currentNote.updatedAt = new Date().toISOString();

  db.notes[noteIndex] = currentNote;
  writeDb(db);

  return res.json({
    message: "Catatan berhasil diperbarui.",
    note: currentNote
  });
}

// Delete a note
export function deleteNote(req: any, res: Response) {
  const { id } = req.params;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  const db = readDb();
  const noteIndex = db.notes.findIndex((n) => n.id === id);

  if (noteIndex === -1) {
    return res.status(404).json({ message: "Catatan tidak ditemukan." });
  }

  const currentNote = db.notes[noteIndex];

  // Authorization check:
  // Admin can delete anything.
  // User can only delete their own private notes.
  if (userRole !== "admin") {
    if (currentNote.createdBy !== userId) {
      return res.status(403).json({ message: "Akses ditolak. Anda tidak berhak menghapus catatan ini." });
    }
    if (currentNote.isGlobal) {
      return res.status(403).json({ message: "Hanya Admin yang dapat menghapus catatan global." });
    }
  }

  // Remove note
  db.notes.splice(noteIndex, 1);
  writeDb(db);

  return res.json({ message: "Catatan berhasil dihapus." });
}
