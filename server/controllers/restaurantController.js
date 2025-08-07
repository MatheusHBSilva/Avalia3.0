const bcrypt = require('bcrypt');
const { db } = require('../models/db');

// CORRIGIDO: Removidos caracteres inválidos e melhorada a clareza.
exports.registerRestaurant = async (req, res) => {
  const { restaurantName, cnpj, endereco, telefone, email, password, tags } = req.body;

  try {
    const existingUser = await new Promise((resolve, reject) => {
      db.get(
        'SELECT email FROM restaurants WHERE email = ?',
        [email],
        (err, row) => (err ? reject(err) : resolve(row))
      );
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Este email já está registrado.' });
    }

    const tagsArray = tags
      ? tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      : [];

    if (tagsArray.length < 5) {
      return res.status(400).json({ error: 'É necessário informar no mínimo 5 tags.' });
    }
  
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO restaurants
        (restaurant_name, cnpj, endereco, telefone, email, password, tags, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      restaurantName,
      cnpj,
      endereco,
      telefone,
      email,
      hashedPassword,
      tagsArray.join(','),
      new Date().toISOString()
    ];

    await new Promise((resolve, reject) => {
      db.run(sql, params, (err) => (err ? reject(err) : resolve()));
    });

    res.status(201).json({ message: 'Restaurante registrado com sucesso!' });

  } catch (error) {
    console.error('Erro ao registrar restaurante:', error);
    res.status(500).json({ error: 'Erro interno no servidor ao registrar restaurante.' });
  }
};

// CORRIGIDO: Removidos caracteres inválidos e melhorada a formatação.
exports.getCurrentRestaurant = (req, res) => {
  const restaurantId = req.cookies.restaurantId;

  db.get(
    'SELECT id, restaurant_name, email, telefone, tags FROM restaurants WHERE id = ?',
    [restaurantId],
    (err, row) => {
      if (err) {
        console.error('Erro ao buscar restaurante atual:', err);
        return res.status(500).json({ error: 'Erro interno no servidor.' });
      }
      if (!row) {
        return res.status(404).json({ error: 'Restaurante não encontrado.' });
      }

      res.json({
        restaurantId: row.id,
        restaurantName: row.restaurant_name,
        restaurantEmail: row.email,
        restaurantPhone: row.telefone,
        tags: row.tags ? row.tags.split(',').map(tag => tag.trim()) : []
      });
    }
  );
};

// MANTIDO: Versão robusta e limpa que já havíamos corrigido.
exports.getRestaurants = (req, res) => {
  const { id, limit, random, search } = req.query;

  let query = `
    SELECT r.id,
           r.telefone,
           r.endereco,
           r.restaurant_name,
           COALESCE(AVG(rev.rating), 0) AS average_rating,
           COUNT(rev.id) AS review_count
    FROM restaurants r
    LEFT JOIN reviews rev
      ON r.id = rev.restaurant_id
  `;
  const params = [];

  if (id) {
    query += ' WHERE r.id = ?';
    params.push(id);
  } else if (search) {
    query += ' WHERE r.restaurant_name LIKE ?';
    params.push(`%${search}%`);
  }

  query += ' GROUP BY r.id, r.restaurant_name';

  if (random && !search) {
    query += ' ORDER BY RANDOM()';
  }

  if (limit) {
    query += ' LIMIT ?';
    params.push(parseInt(limit, 10));
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Erro na query SQL em getRestaurants:', err);
      return res.status(500).json({ error: 'Erro interno no servidor.' });
    }
    
    try {
      const restaurants = rows.map(row => ({
        id: row.id,
        telefone: row.telefone,
        endereco: row.endereco,
        restaurant_name: row.restaurant_name,
        average_rating: parseFloat((row.average_rating ?? 0).toFixed(1)),
        review_count: row.review_count
      }));
      
      res.json({ restaurants });

    } catch (e) {
      console.error('Erro ao processar dados dos restaurantes:', e);
      return res.status(500).json({ error: 'Erro ao processar dados do servidor.' });
    }
  });
};

// CORRIGIDO: Removidos caracteres inválidos.
exports.getRestaurantTags = (req, res) => {
  const { id } = req.query;

  db.get(
    'SELECT tags FROM restaurants WHERE id = ?',
    [id],
    (err, row) => {
      if (err) {
        console.error('Erro ao buscar tags do restaurante:', err);
        return res.status(500).json({ error: 'Erro interno no servidor.' });
      }
      if (!row) {
        return res.status(404).json({ error: 'Restaurante não encontrado.' });
      }

      const tags = row.tags ? row.tags.split(',').map(tag => tag.trim()) : [];
      res.json({ tags });
    }
  );
};

exports.updateRestaurantTags = async (req, res) => {
  const { tags } = req.body; // 'tags' aqui é uma string: "hamburguer, pizza, ..."
  const restaurantId = req.cookies.restaurantId;

  if (!restaurantId) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }

  if (typeof tags !== 'string') {
    return res.status(400).json({ error: 'Formato de tags inválido. Deve ser uma string.' });
  }
  
  // --- VALIDAÇÃO ADICIONADA AQUI ---
  // 1. Cria um array a partir da string de tags
  const tagsArray = tags.split(',')
    .map(tag => tag.trim())
    .filter(tag => tag !== ''); // Remove tags vazias

  // 2. Verifica a quantidade de tags no array
  if (tagsArray.length < 5) {
    return res.status(400).json({ error: 'É necessário informar no mínimo 5 tags.' });
  }
  // --- FIM DA VALIDAÇÃO ---

  // 3. Junta o array de volta em uma string limpa para salvar no banco
  const processedTags = tagsArray.join(',');

  try {
    const result = await new Promise((resolve, reject) => {
      db.run('UPDATE restaurants SET tags = ? WHERE id = ?', [processedTags, restaurantId], function(err) {
        if (err) reject(err);
        else resolve(this);
      });
    });

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Restaurante não encontrado ou tags não foram alteradas.' });
    }

    res.status(200).json({ message: 'Tags atualizadas com sucesso!', updatedTags: tagsArray });

  } catch (error) {
    console.error('Erro ao atualizar tags do restaurante:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao atualizar tags.' });
  }
};

exports.getMe = (req, res) => {
  // O ID do restaurante é pego do cookie, que o middleware já validou
  const restaurantId = req.cookies.restaurantId;

  const sql = `
    SELECT 
      r.id, 
      r.restaurant_name, 
      r.email, 
      r.telefone, 
      r.tags,
      COALESCE(AVG(rev.rating), 0) as averageRating,
      COUNT(rev.id) as reviewCount
    FROM restaurants r
    LEFT JOIN reviews rev ON r.id = rev.restaurant_id
    WHERE r.id = ?
    GROUP BY r.id
  `;

  db.get(sql, [restaurantId], (err, row) => {
    if (err) {
      console.error("Erro ao buscar dados do restaurante 'me':", err);
      return res.status(500).json({ error: 'Erro interno no servidor.' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Restaurante não encontrado.' });
    }

    // Envia os dados formatados para o frontend
    res.json({
      restaurantId: row.id,
      restaurantName: row.restaurant_name,
      restaurantEmail: row.email,
      restaurantPhone: row.telefone,
      tags: row.tags ? row.tags.split(',').map(tag => tag.trim()) : [],
      averageRating: parseFloat(row.averageRating.toFixed(1)),
      reviewCount: row.reviewCount
    });
  });
};