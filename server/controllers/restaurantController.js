const bcrypt = require('bcrypt');
const { pool } = require('../models/db');

exports.registerRestaurant = async (req, res) => {
  const { restaurantName, cnpj, endereco, telefone, email, password, tags } = req.body;

  try {
    const { rows: [existingUser] } = await pool.query(
      'SELECT email FROM restaurants WHERE email = $1',
      [email]
    );

    if (existingUser) {
      return res.status(400).json({ error: 'Este email já está registrado.' });
    }

    const tagsArray = tags
      ? tags.split(',').map(tag => tag.trim())
      : [];

    if (tagsArray.length < 5) {
      return res
        .status(400)
        .json({ error: 'É necessário informar no mínimo 5 tags.'});
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      `INSERT INTO restaurants 
        (restaurant_name, cnpj, endereco, telefone, email, password, tags, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        restaurantName,
        cnpj,
        endereco,
        telefone,
        email,
        hashedPassword,
        tags || '',
        new Date().toISOString()
      ]
    );

    res.status(201).json({ message: 'Registro salvo com sucesso!' });
  } catch (error) {
    console.error('Erro ao registrar restaurante:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};

exports.getCurrentRestaurant = async (req, res) => {
  const restaurantId = req.cookies.restaurantId;

  try {
    const { rows: [row] } = await pool.query(
      'SELECT id, restaurant_name, email, telefone, tags FROM restaurants WHERE id = $1',
      [restaurantId]
    );

    if (!row) {
      return res.status(404).json({ error: 'Restaurante não encontrado.' });
    }

    res.json({
      restaurantId:   row.id,
      restaurantName: row.restaurant_name,
      restaurantEmail: row.email,
      restaurantPhone: row.telefone,
      tags:           row.tags
                         ? row.tags.split(',').map(tag => tag.trim())
                         : []
    });
  } catch (err) {
    console.error('Erro ao obter restaurante atual:', err);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};

exports.getRestaurants = async (req, res) => {
  const { id, limit, random, search } = req.query;

  let query = `
    SELECT DISTINCT ON (r.id)
           r.id,
           r.telefone,
           r.endereco,
           r.restaurant_name,
           COALESCE(AVG(rev.rating)::float, 0) AS average_rating,
           COUNT(rev.rating) AS review_count
    FROM restaurants r
    LEFT JOIN reviews rev ON r.id = rev.restaurant_id
  `;
  const params = [];

  if (id) {
    query += ' WHERE r.id = $1';
    params.push(id);
  } else if (search) {
    query += ' WHERE r.restaurant_name ILIKE $1';
    params.push(`%${search}%`);
  }

  query += ' GROUP BY r.id, r.telefone, r.endereco, r.restaurant_name';

  if (random && !search) {
    query += ' ORDER BY RANDOM()';
  }

  if (limit) {
    query += ` LIMIT $${params.length + 1}`;
    params.push(parseInt(limit, 10));
  }

  try {
    const { rows } = await pool.query(query, params);

    if (rows.length === 0 && id) {
      return res.status(404).json({ error: 'Restaurante não encontrado.' });
    }

    const restaurants = rows.map(row => ({
      id:              row.id,
      telefone:        row.telefone,
      endereco:        row.endereco,
      restaurant_name: row.restaurant_name,
      average_rating:  Number(row.average_rating.toFixed(1)),
      review_count:    Number(row.review_count)
    }));

    res.json({ restaurants });
  } catch (err) {
    console.error('Erro na busca de restaurantes:', err);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};

exports.getRestaurantTags = async (req, res) => {
  const { id } = req.query;

  try {
    const { rows: [row] } = await pool.query(
      'SELECT tags FROM restaurants WHERE id = $1',
      [id]
    );

    if (!row) {
      return res
        .status(404)
        .json({ error: 'Restaurante não encontrado.' });
    }

    const tags = row.tags
      ? row.tags.split(',').map(tag => tag.trim())
      : [];

    res.json({ tags });
  } catch (err) {
    console.error('Erro ao obter tags do restaurante:', err);
    res
      .status(500)
      .json({ error: 'Erro interno no servidor.' });
  }
};