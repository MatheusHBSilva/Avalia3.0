const { db } = require('../models/db');

exports.getDiscoveryFeed = async (req, res) => {
  // Pega o ID do cliente do cookie, que é o método mais seguro
  const clientId = req.cookies.clientId;

  // 1. Verificação de Segurança: O cliente está logado?
  if (!clientId) {
    // Se não estiver logado, não há como gerar recomendações. Retorna uma lista vazia.
    return res.status(200).json({ restaurants: [] });
  }
  
  try {
    // 2. Busca as tags do cliente logado
    const client = await new Promise((resolve, reject) => {
      db.get('SELECT tags FROM clients WHERE id = ?', [clientId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    // 3. Verificação de Segurança: O cliente tem tags?
    if (!client || !client.tags || client.tags.trim() === '') {
      // Se o cliente não tem tags, não há como recomendar. Retorna uma lista vazia.
      return res.status(200).json({ restaurants: [] });
    }

    const clientTagsSet = new Set(client.tags.split(',').map(tag => tag.trim()));

    // 4. Busca todos os restaurantes e suas informações
    const allRestaurants = await new Promise((resolve, reject) => {
      const query = `
        SELECT 
          r.id, r.restaurant_name, r.tags,
          COALESCE(AVG(rev.rating), 0) as average_rating,
          COUNT(rev.id) as review_count
        FROM restaurants r
        LEFT JOIN reviews rev ON r.id = rev.restaurant_id
        GROUP BY r.id
      `;
      db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // 5. Filtra os restaurantes que correspondem às tags do cliente
    const feedRestaurants = allRestaurants.filter(restaurant => {
      // 6. Verificação de Segurança: O restaurante tem tags?
      if (!restaurant.tags || restaurant.tags.trim() === '') {
        return false; // Ignora restaurantes sem tags
      }

      const restaurantTags = restaurant.tags.split(',').map(tag => tag.trim());
      let commonTagsCount = 0;
      for (const tag of restaurantTags) {
        if (clientTagsSet.has(tag)) {
          commonTagsCount++;
        }
      }
      return commonTagsCount >= 2; // A regra de negócio para recomendação
    });

    // 7. Retorna a lista filtrada (pode estar vazia, e isso é ok)
    res.json({ restaurants: feedRestaurants });

  } catch (error) {
    // Se qualquer outro erro inesperado acontecer, ele será capturado aqui
    console.error('Erro grave no feed de descoberta:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao buscar recomendações.' });
  }
};