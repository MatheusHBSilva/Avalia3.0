// controllers/reviewController.js
const { db } = require('../models/db');

exports.getReviews = (req, res) => {
  const { restaurantId, limit } = req.query;

  const queryLimit = limit ? parseInt(limit, 10) : 50;
  const sql = `
    SELECT reviewer_name, rating, review_text, created_at
      FROM reviews
     WHERE restaurant_id = ?
     ORDER BY created_at DESC
     LIMIT ?
  `;

  db.all(sql, [restaurantId, queryLimit], (err, rows) => {
    if (err) {
      return res
        .status(500)
        .json({ error: 'Erro interno no servidor.' });
    }
    res.json({ reviews: rows });
  });
};

exports.submitReview = async (req, res) => {
  const { restaurantId, reviewerName, rating, reviewText } = req.body;

  try {
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO reviews
           (restaurant_id, reviewer_name, rating, review_text, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [
          restaurantId,
          reviewerName,
          rating,
          reviewText || '',
          new Date().toISOString()
        ],
        err => (err ? reject(err) : resolve())
      );
    });

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
