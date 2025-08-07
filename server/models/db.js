const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { Pool } = require('pg');
const cron = require('node-cron');

const db = new sqlite3.Database(path.resolve(__dirname, '../../database.db'), err => {
  if (err) console.error('Erro ao conectar no SQLite:', err.message);
  else console.log('Conectado ao SQLite com sucesso');
});

// Importar dados do PostgreSQL para SQLite ao iniciar
async function importFromPostgres() {
  try {
    const client = await pgPool.connect();

    const tables = ['restaurants', 'clients', 'favoritos', 'reviews', 'reports'];
    for (const table of tables) {
      const res = await client.query(`SELECT * FROM ${table}`);
      const rows = res.rows;

      db.serialize(() => {
        db.run(`DELETE FROM ${table}`);
        rows.forEach(row => {
          const columns = Object.keys(row).join(',');
          const placeholders = Object.keys(row).map(() => '?').join(',');
          const values = Object.values(row);
          db.run(`INSERT INTO ${table} (${columns}) VALUES (${placeholders})`, values);
        });
      });
    }

    console.log('Dados importados do PostgreSQL com sucesso.');
    client.release();
  } catch (err) {
    console.error('Erro ao importar do PostgreSQL:', err);
  }
}

// Exportar dados do SQLite para PostgreSQL com UPSERT a cada 5 minutos
async function exportToPostgres() {
  const pgPoolExport = new Pool({
    connectionString: process.env.PG_CONNECTION_STRING || 'postgresql://usuario:senha@host:porta/database',
    ssl: {
      rejectUnauthorized: false,
    },
    idleTimeoutMillis: 60000, // 60 segundos para conexões inativas
    connectionTimeoutMillis: 10000, // 10 segundos para tentar estabelecer conexão
  });

  try {
    const client = await pgPoolExport.connect();
    const tables = ['restaurants', 'clients', 'favoritos', 'reviews', 'reports'];

    for (const table of tables) {
      db.all(`SELECT * FROM ${table}`, async (err, rows) => {
        if (err) {
          console.error(`Erro ao ler dados de ${table} no SQLite:`, err);
        } else {
          for (const row of rows) {
            const columns = Object.keys(row);
            const values = Object.values(row);

            const columnList = columns.join(',');
            const placeholders = columns.map((_, i) => `$${i + 1}`).join(',');

            const updates = columns
              .filter(col => col !== 'id')
              .map(col => `${col} = EXCLUDED.${col}`)
              .join(', ');

            const conflictClause = table === 'favoritos' ? '(client_id, restaurant_id)' :
                                   table === 'clients' ? '(cpf)' :
                                   table === 'restaurants' ? '(email)' :
                                   table === 'reviews' ? '(id)' :
                                   table === 'reports' ? '(id)' :
                                   '(id)';

            const query = `
              INSERT INTO ${table} (${columnList})
              VALUES (${placeholders})
              ON CONFLICT ${conflictClause}
              DO UPDATE SET ${updates}
            `;

            try {
              await client.query(query, values);
            } catch (e) {
              console.error(`Erro ao inserir/atualizar dados em ${table}:`, e);
            }
          }
        }
      });
    }

    console.log('Dados exportados para o PostgreSQL com sucesso.');
    client.release();
  } catch (err) {
    console.error('Erro ao exportar para o PostgreSQL:', err);
  } finally {
    await pgPoolExport.end(); // Fecha o pool específico após a exportação
  }
}

// Conexão PostgreSQL para importação
const pgPool = new Pool({
  connectionString: process.env.PG_CONNECTION_STRING || 'postgresql://usuario:senha@host:porta/database',
  ssl: {
    rejectUnauthorized: false,
  },
});

// Rodar importação ao iniciar
importFromPostgres();

// Rodar exportação a cada 5 minutos
cron.schedule('*/5 * * * *', exportToPostgres);

// ---------- CÓDIGO ORIGINAL ----------
function addColumnIfNotExists(tableName, columnName, columnType) {
  db.all(`PRAGMA table_info(${tableName})`, (err, columns) => {
    if (err) {
      console.error(`Erro ao verificar colunas da tabela ${tableName}:`, err.message);
    } else {
      const columnExists = columns.some(col => col.name === columnName);
      if (!columnExists) {
        db.run(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType}`, err => {
          if (err) {
            console.error(`Erro ao adicionar coluna ${columnName}:`, err.message);
          } else {
            console.log(`Coluna ${columnName} adicionada à tabela ${tableName}`);
          }
        });
      }
    }
  });
}

function initTables() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS restaurants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        restaurant_name TEXT NOT NULL,
        cnpj TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        tags TEXT,
        created_at TEXT NOT NULL
      )
    `);

    addColumnIfNotExists('restaurants', 'endereco', 'TEXT');
    addColumnIfNotExists('restaurants', 'telefone', 'TEXT');

    db.run(`
      CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        sobrenome TEXT NOT NULL,
        cpf TEXT NOT NULL UNIQUE,
        telefone TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        senha TEXT NOT NULL,
        tags TEXT,
        created_at TEXT NOT NULL
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS favoritos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER NOT NULL,
        restaurant_id INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (client_id) REFERENCES clients(id),
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
        UNIQUE(client_id, restaurant_id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        restaurant_id INTEGER NOT NULL,
        reviewer_name TEXT NOT NULL,
        rating INTEGER NOT NULL,
        review_text TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        restaurant_id INTEGER NOT NULL,
        analysis TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
      )
    `);
  });

  db.all('PRAGMA table_info(restaurants)', (err, rows) => {
    if (err) {
      console.error('Erro ao verificar colunas:', err.message);
    } else {
      console.log('Colunas atuais da tabela restaurants:');
      rows.forEach(col => console.log(`- ${col.name} (${col.type})`));
    }
  });

  db.all('PRAGMA table_info(clients)', (err, rows) => {
    if (err) {
      console.error('Erro ao verificar colunas da tabela clients:', err.message);
    } else {
      console.log('Colunas atuais da tabela clients:');
      rows.forEach(col => console.log(`- ${col.name} (${col.type})`));
    }
  });
}

module.exports = { db, initTables };