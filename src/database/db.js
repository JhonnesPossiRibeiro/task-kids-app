import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('kids_tasks.db');

export function initDatabase() {
  db.execSync(`
    PRAGMA journal_mode = WAL;
    
    CREATE TABLE IF NOT EXISTS children (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      points INTEGER DEFAULT 0,
      avatar TEXT
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      reward_points INTEGER NOT NULL,
      is_recurring INTEGER DEFAULT 1,
      completed_today INTEGER DEFAULT 0,
      last_completed_date TEXT
    );

    CREATE TABLE IF NOT EXISTS rewards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      cost INTEGER NOT NULL
    );
  `);
}

export default db;