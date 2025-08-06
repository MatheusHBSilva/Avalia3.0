const { Pool } = require('pg');

// Configuração da conexão com o PostgreSQL usando a variável de ambiente DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Necessário para conexões no Render
});

// Testar conexão com o banco
pool.connect((err, client, release) => {
  if (err) {
    console.error('Erro ao conectar no PostgreSQL:', err.message);
  } else {
    console.log('Conectado ao PostgreSQL com sucesso');
    release();
  }
});

// Verificação antes de adicionar colunas de endereço e telefone para a tabela do restaurante
async function addColumnIfNotExists(tableName, columnName, columnType) {
  try {
    const query = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = $1 AND column_name = $2
    `;
    const result = await pool.query(query, [tableName, columnName]);
    
    if (result.rows.length === 0) {
      await pool.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType}`);
      console.log(`Coluna ${columnName} adicionada à tabela ${tableName}`);
    }
  } catch (err) {
    console.error(`Erro ao adicionar/verificar coluna ${columnName} na tabela ${tableName}:`, err.message);
  }
}

// Função para criar tabelas (executar apenas uma vez ou a cada start)
async function initTables() {
  try {
    // Criar tabela restaurants
    await pool.query(`
      CREATE TABLE IF NOT EXISTS restaurants (
        id SERIAL PRIMARY KEY,
        restaurant_name TEXT NOT NULL,
        cnpj TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        tags TEXT,
        endereco TEXT,
        telefone TEXT,
        created_at TEXT NOT NULL
      )
    `);

    // Adicionar colunas endereço e telefone, se não existirem
    await addColumnIfNotExists('restaurants', 'endereco', 'TEXT');
    await addColumnIfNotExists('restaurants', 'telefone', 'TEXT');

    // Criar tabela clients
    await pool.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
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

    // Criar tabela favoritos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS favoritos (
        id SERIAL PRIMARY KEY,
        client_id INTEGER NOT NULL,
        restaurant_id INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
        UNIQUE(client_id, restaurant_id)
      )
    `);

    // Criar tabela reviews
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        restaurant_id INTEGER NOT NULL,
        reviewer_name TEXT NOT NULL,
        rating INTEGER NOT NULL,
        review_text TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
      )
    `);

    // Criar tabela reports
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        restaurant_id INTEGER NOT NULL,
        analysis TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
      )
    `);

    // Verificar colunas da tabela restaurants
    const columns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'restaurants'
    `);
    console.log('Colunas atuais da tabela restaurants:');
    columns.rows.forEach(col => console.log(`- ${col.column_name} (${col.data_type})`));
  } catch (err) {
    console.error('Erro ao inicializar tabelas:', err.message);
  }
}

module.exports = { pool, initTables };