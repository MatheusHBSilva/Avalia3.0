const { pool } = require('../models/db');

const getDiscoveryFeed = async (req, res) => {
  if (!req.cookies || !req.cookies.clientId) {
    return res.status(401).json({ error: 'Cliente não autenticado.' });
  }
  
  const clientId = req.cookies.clientId;

  try {
    // Busca tags do cliente
    const { rows: [client] } = await pool.query(
      'SELECT tags FROM clients WHERE id = $1',
      [clientId]
    );

    let query = `
      SELECT 
        r.id, 
        r.restaurant_name,
        r.tags,
        COALESCE(AVG(rev.rating)::float, 0) AS average_rating,
        COUNT(rev.rating) AS review_count
      FROM restaurants r
      LEFT JOIN reviews rev ON r.id = rev.restaurant_id
    `;
    const params = [];

    // Se o cliente tem tags, filtra restaurantes com tags correspondentes
    if (client && client.tags) {
      const clientTags = client.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      if (clientTags.length > 0) {
        query += ` WHERE EXISTS (
          SELECT 1 
          FROM unnest(string_to_array(r.tags, ',')) AS tag
          WHERE tag ILIKE ANY ($1)
        )`;
        params.push(clientTags.map(tag => `%${tag}%`));
      }
    }

    query += ' GROUP BY r.id, r.restaurant_name, r.tags';

    const { rows: allRestaurants } = await pool.query(query, params);

    const feedRestaurants = allRestaurants.map(restaurant => ({
      id:              restaurant.id,
      restaurant_name: restaurant.restaurant_name,
      average_rating:  Number(restaurant.average_rating.toFixed(1)),
      review_count:    Number(restaurant.review_count)
    }));

    res.json({ restaurants: feedRestaurants });
  } catch (error) {
    console.error('Erro ao buscar feed de descoberta:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};

module.exports = {
  getDiscoveryFeed,
};