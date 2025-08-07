const { db } = require('../models/db');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const PDFDocument = require('pdfkit');

exports.clientRecommendation = async (req, res) => {
  const { restaurantId, format } = req.body;

  try {
    const clientId = req.cookies.clientId;

    // 1. Buscar até 100 avaliações recentes
    const reviews = await new Promise((resolve, reject) => {
      db.all(
        `SELECT reviewer_name, rating, review_text
         FROM reviews
         WHERE restaurant_id = ?
         ORDER BY created_at DESC
         LIMIT 100`,
        [restaurantId],
        (err, rows) => (err ? reject(err) : resolve(rows))
      );
    });

    // 2. Tags do restaurante e do cliente
    const restaurant = await new Promise((resolve, reject) => {
      db.get(
        'SELECT tags FROM restaurants WHERE id = ?',
        [restaurantId],
        (err, row) => (err ? reject(err) : resolve(row))
      );
    });
    const restaurantTags = restaurant?.tags
      ? restaurant.tags.split(',').map(t => t.trim())
      : [];

    const client = await new Promise((resolve, reject) => {
      db.get(
        'SELECT tags FROM clients WHERE id = ?',
        [clientId],
        (err, row) => (err ? reject(err) : resolve(row))
      );
    });
    const clientTags = client?.tags
      ? client.tags.split(',').map(t => t.trim())
      : [];

    // 3. Montar prompt
    const reviewTexts = reviews
      .map(
        r =>
          `${r.reviewer_name} (${r.rating} estrelas): "${
            r.review_text || 'Sem comentário'
          }"`
      )
      .join('\n');

    const prompt = `
Analise as seguintes avaliações de um restaurante, incluindo texto e nota (1–5), junto com as tags do restaurante (${restaurantTags.join(
      ', '
    )}) e do cliente (${clientTags.join(
      ', '
    )}). Forneça:
1. Recomendação (sim/não) e justificativa.
2. Resumo de pontos fortes e fracos.
3. Até 5 linhas no total.
4. Se não houver avaliações, responda apenas "Restaurante não avaliado".
Seguem as avaliações:
${reviewTexts}
    `;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'Chave da API do Gemini não configurada no .env.'
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
    });
    const result = await model.generateContent(prompt);
    const analysis = await result.response.text();

    // 4. Gerar PDF ou JSON
    if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="recomendacao_${restaurantId}.pdf"`
        );
        res.send(pdfData);
      });

      doc.fontSize(16).text('Recomendação Personalizada', {
        align: 'center',
      });
      doc.moveDown();
      doc.fontSize(12).text(`Restaurante ID: ${restaurantId}`);
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`);
      doc.moveDown();
      doc.text(analysis, { lineGap: 4 });
      doc.end();
      return;
    }

    res.status(200).json({ analysis });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: error.message || 'Erro interno ao gerar recomendação.' });
  }
};
