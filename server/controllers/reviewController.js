const { pool } = require('../models/db');

exports.getReviews = async (req, res) => {
  const { restaurantId, limit } = req.query;

  const queryLimit = limit ? parseInt(limit, 10) : 50;
  const sql = `
    SELECT reviewer_name, rating, review_text, created_at
    FROM reviews
    WHERE restaurant_id = $1
    ORDER BY created_at DESC
    LIMIT $2
  `;

  try {
    const { rows } = await pool.query(sql, [restaurantId, queryLimit]);
    res.json({ reviews: rows });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: 'Erro interno no servidor.' });
  }
};

exports.submitReview = async (req, res) => {
  const { restaurantId, reviewerName, rating, reviewText } = req.body;

  try {
    await pool.query(
      `INSERT INTO reviews
         (restaurant_id, reviewer_name, rating, review_text, created_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        restaurantId,
        reviewerName,
        rating,
        reviewText || '',
        new Date().toISOString()
      ]
    );

    res
      .status(201)
      .json({ message: 'Avaliação salva com sucesso!' });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: 'Erro interno no servidor.' });
  }
};