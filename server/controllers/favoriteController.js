const { db } = require('../models/db');

exports.getFavoriteRestaurants = (req, res) => {
  const clientId = req.cookies.clientId;

  const query = `
    SELECT r.id,
           r.restaurant_name,
           COALESCE(AVG(rev.rating), 0) AS average_rating,
           COUNT(rev.rating)          AS review_count
    FROM restaurants r
    LEFT JOIN reviews rev
      ON r.id = rev.restaurant_id
    INNER JOIN favoritos f
      ON r.id = f.restaurant_id
    WHERE f.client_id = ?
    GROUP BY r.id, r.restaurant_name
  `;

  db.all(query, [clientId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erro interno no servidor.' });
    }

    const restaurants = rows.map(row => ({
      id:              row.id,
      restaurant_name: row.restaurant_name,
      average_rating:  parseFloat(row.average_rating.toFixed(1)),
      review_count:    row.review_count
    }));

    res.json({ restaurants });
  });
};

exports.getFavoriteIds = (req, res) => {
  const clientId = req.cookies.clientId;

  db.all(
    'SELECT restaurant_id FROM favoritos WHERE client_id = ?',
    [clientId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Erro interno no servidor.' });
      }
      res.json({ favorites: rows.map(r => r.restaurant_id) });
    }
  );
};

exports.toggleFavorite = async (req, res) => {
  const clientId    = req.cookies.clientId;
  const { restaurantId, action } = req.body;

  if (!clientId) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }
  if (!restaurantId || !action) {
    return res
      .status(400)
      .json({ error: 'ID do restaurante e ação são obrigatórios.' });
  }

  try {
    if (action === 'add') {
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO favoritos 
             (client_id, restaurant_id, created_at) 
           VALUES (?, ?, ?)`,
          [clientId, restaurantId, new Date().toISOString()],
          err => (err ? reject(err) : resolve())
        );
      });
      return res
        .status(201)
        .json({ message: 'Restaurante adicionado aos favoritos!' });
    }

    if (action === 'remove') {
      await new Promise((resolve, reject) => {
        db.run(
          `DELETE FROM favoritos 
           WHERE client_id = ? 
             AND restaurant_id = ?`,
          [clientId, restaurantId],
          err => (err ? reject(err) : resolve())
        );
      });
      return res
        .status(200)
        .json({ message: 'Restaurante removido dos favoritos!' });
    }

    res.status(400).json({ error: 'Ação inválida.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};