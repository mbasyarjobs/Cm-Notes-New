import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { User, Note } from "./types";

const DB_DIR = path.join(process.cwd(), "database");
const DB_FILE = path.join(DB_DIR, "db.json");

// Define interface for our database schema
interface DatabaseSchema {
  users: User[];
  notes: Note[];
}

// Ensure the database directory and file exist with initial mock data if empty
export function initDb() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  let dbData: DatabaseSchema = { users: [], notes: [] };

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      dbData = JSON.parse(content);
    } catch (e) {
      console.error("Error reading database file, resetting...", e);
    }
  }

  // Check if we need to seed initial users
  if (dbData.users.length === 0) {
    const adminPasswordHash = bcrypt.hashSync("admin123", 10);
    const userPasswordHash = bcrypt.hashSync("user123", 10);
    const staffPasswordHash = bcrypt.hashSync("staff123", 10);

    dbData.users = [
      {
        id: "u-admin",
        username: "admin",
        password: adminPasswordHash,
        role: "admin",
        createdAt: new Date().toISOString()
      },
      {
        id: "u-user1",
        username: "user",
        password: userPasswordHash,
        role: "user",
        createdAt: new Date().toISOString()
      },
      {
        id: "u-user2",
        username: "staff",
        password: staffPasswordHash,
        role: "user",
        createdAt: new Date().toISOString()
      }
    ];

    // Seed initial notes
    dbData.notes = [
      {
        id: "n-1",
        title: "Restart Nginx and Clear Cache",
        command: "sudo systemctl restart nginx\nsudo rm -rf /var/cache/nginx/*\nsudo systemctl status nginx",
        notes: "Jalankan command ini ketika web server terasa lambat atau ada pembaruan konfigurasi SSL.",
        category: "Service",
        isGlobal: true,
        createdBy: "u-admin",
        creatorUsername: "admin",
        createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(), // 3 days ago
        updatedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
      },
      {
        id: "n-2",
        title: "Backup Database PostgreSQL",
        command: "pg_dump -U postgres -d central_db -F c -b -v -f \"/backup/db_$(date +%Y%m%d).backup\"",
        notes: "Backup otomatis berjalan via Cronjob setiap jam 02:00 pagi. Folder backup tersimpan di NAS.",
        category: "Database",
        isGlobal: true,
        createdBy: "u-admin",
        creatorUsername: "admin",
        createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(), // 2 days ago
        updatedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
      },
      {
        id: "n-3",
        title: "Cek Log Realtime Parking System",
        command: "tail -n 100 -f /var/log/parking/gate_service.log | grep -E \"ERROR|FAIL|TIMEOUT\"",
        notes: "Gunakan untuk troubleshooting ketika gate parkir tidak merespon perintah open trigger.",
        category: "Parking System",
        isGlobal: true,
        createdBy: "u-admin",
        creatorUsername: "admin",
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(), // 12 hours ago
        updatedAt: new Date(Date.now() - 3600000 * 12).toISOString()
      },
      {
        id: "n-4",
        title: "Konfigurasi IP Static Fedora Server",
        command: "sudo nmcli connection modify eth0 ipv4.addresses 192.168.10.50/24 ipv4.gateway 192.168.10.1 ipv4.method manual\nsudo nmcli connection up eth0",
        notes: "Catatan pribadi User A untuk setup IP statis server lokal baru.",
        category: "Fedora",
        isGlobal: false,
        createdBy: "u-user1",
        creatorUsername: "user",
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
        updatedAt: new Date(Date.now() - 3600000 * 5).toISOString()
      },
      {
        id: "n-5",
        title: "Monitoring Bandwidth Mikrotik Interface",
        command: "/interface monitor-traffic ether1",
        notes: "Cek utilisasi ISP utama saat jaringan lokal mengalami latency tinggi.",
        category: "Network",
        isGlobal: false,
        createdBy: "u-user2",
        creatorUsername: "staff",
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
        updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    ];

    fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), "utf-8");
  }
}

// Read database
export function readDb(): DatabaseSchema {
  try {
    const content = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(content);
  } catch (e) {
    console.error("Error reading database file, returning empty schema", e);
    return { users: [], notes: [] };
  }
}

// Write database
export function writeDb(data: DatabaseSchema): boolean {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (e) {
    console.error("Error writing database file", e);
    return false;
  }
}
