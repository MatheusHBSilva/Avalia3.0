const { pool } = require('../models/db');

exports.getFavoriteRestaurants = async (req, res) => {
  const clientId = req.cookies.clientId;

  if (!clientId) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  const query = `
    SELECT r.id,
           COALESCE(TRIM(r.restaurant_name), '') AS restaurant_name,
           COALESCE(AVG(rev.rating)::float, 0) AS average_rating,
           COUNT(rev.rating) AS review_count
    FROM restaurants r
    LEFT JOIN reviews rev ON r.id = rev.restaurant_id
    INNER JOIN favoritos f ON r.id = f.restaurant_id
    WHERE f.client_id = $1
    GROUP BY r.id, r.restaurant_name
  `;

  try {
    const { rows } = await pool.query(query, [clientId]);

    const restaurants = rows.map(row => ({
      id:              row.id,
      restaurant_name: row.restaurant_name,
      average_rating:  Number(row.average_rating.toFixed(1)),
      review_count:    Number(row.review_count)
    }));

    res.json({ restaurants });
  } catch (err) {
    console.error('Erro ao obter restaurantes favoritos:', err);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};

exports.getFavoriteIds = async (req, res) => {
  const clientId = req.cookies.clientId;

  if (!clientId) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  try {
    const { rows } = await pool.query(
      'SELECT restaurant_id FROM favoritos WHERE client_id = $1',
      [clientId]
    );

    res.json({ favorites: rows.map(r => r.restaurant_id) });
  } catch (err) {
    console.error('Erro ao obter IDs de favoritos:', err);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};

exports.toggleFavorite = async (req, res) => {
  const clientId = req.cookies.clientId;
  const { restaurantId, action } = req.body;

  if (!clientId) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }
  if (!restaurantId || !action || !['add', 'remove'].includes(action)) {
    return res
      .status(400)
      .json({ error: 'ID do restaurante e ação válida são obrigatórios.' });
  }

  try {
    // Verificar se o restaurante existe
    const { rows: [restaurant] } = await pool.query(
      'SELECT id FROM restaurants WHERE id = $1',
      [restaurantId]
    );
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurante não encontrado.' });
    }

    if (action === 'add') {
      await pool.query(
        `INSERT INTO favoritos 
           (client_id, restaurant_id, created_at) 
         VALUES ($1, $2, $3)
         ON CONFLICT (client_id, restaurant_id) DO NOTHING`,
        [clientId, restaurantId, new Date().toISOString()]
      );
      return res
        .status(201)
        .json({ message: 'Restaurante adicionado aos favoritos!' });
    }

    if (action === 'remove') {
      const { rowCount } = await pool.query(
        `DELETE FROM favoritos 
         WHERE client_id = $1 
           AND restaurant_id = $2`,
        [clientId, restaurantId]
      );
      if (rowCount === 0) {
        return res.status(404).json({ error: 'Favorito não encontrado.' });
      }
      return res
        .status(200)
        .json({ message: 'Restaurante removido dos favoritos!' });
    }
  } catch (error) {
    console.error('Erro ao atualizar favorito:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};