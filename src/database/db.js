import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("kids_tasks.db");

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
      description TEXT,
      reward_points INTEGER NOT NULL,
      time TEXT,
      completed_today INTEGER DEFAULT 0,
      is_recurring INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS rewards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      cost INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS redemptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      child_id INTEGER NOT NULL,
      reward_title TEXT NOT NULL,
      cost INTEGER NOT NULL,
      date TEXT NOT NULL,
      FOREIGN KEY (child_id) REFERENCES children (id) ON DELETE CASCADE
    );
  `);

  // Inserir dados de exemplo se as tabelas estiverem vazias
  const childCount = db.getFirstSync("SELECT COUNT(*) as count FROM children");
  if (childCount.count === 0) {
    db.runSync("INSERT INTO children (name, points, avatar) VALUES (?, ?, ?)", [
      "Rebeca",
      14,
      "👧",
    ]);
    db.runSync("INSERT INTO children (name, points, avatar) VALUES (?, ?, ?)", [
      "Pedro",
      8,
      "👦",
    ]);
  }

  const taskCount = db.getFirstSync("SELECT COUNT(*) as count FROM tasks");
  if (taskCount.count === 0) {
    db.runSync(
      "INSERT INTO tasks (title, category, description, reward_points, time, completed_today) VALUES (?, ?, ?, ?, ?, ?)",
      [
        "Arrumar o Ninho Mágico",
        "Organização 🛏️",
        "Estique o lençol e fofe o travesseiro...",
        2,
        "Manhã",
        0,
      ],
    );
    db.runSync(
      "INSERT INTO tasks (title, category, description, reward_points, time, completed_today) VALUES (?, ?, ?, ?, ?, ?)",
      [
        "Lanche dos Campeões",
        "Alimentação 🍎",
        "Comer uma porção gostosa de...",
        3,
        "Tarde",
        0,
      ],
    );
    db.runSync(
      "INSERT INTO tasks (title, category, description, reward_points, time, completed_today) VALUES (?, ?, ?, ?, ?, ?)",
      [
        "Lição de Português",
        "Estudo Genial 📚",
        "Ler o livro de historinhas...",
        5,
        "Antes das 17h",
        0,
      ],
    );
    db.runSync(
      "INSERT INTO tasks (title, category, description, reward_points, time, completed_today) VALUES (?, ?, ?, ?, ?, ?)",
      [
        "Escovar os Dentinhos",
        "Higiene 🦷",
        "Deixar o sorriso brilhando!",
        2,
        "Manhã",
        1,
      ],
    );
  }
}

export default db;
