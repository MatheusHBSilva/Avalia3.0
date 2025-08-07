// controllers/analysisController.js
const { db } = require('../models/db');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const PDFDocument = require('pdfkit');

exports.businessAnalysis = async (req, res) => {
  const { restaurantId, format } = req.body;

  try {
    // 1. Busca até 50 avaliações recentes
    const reviews = await new Promise((resolve, reject) => {
      db.all(
        `SELECT reviewer_name, rating, review_text, created_at
         FROM reviews
         WHERE restaurant_id = ?
         ORDER BY created_at DESC
         LIMIT 50`,
        [restaurantId],
        (err, rows) => (err ? reject(err) : resolve(rows))
      );
    });

    // 2. Monta prompt para Gemini
    const prompt = `
      Analise as seguintes avaliações de um restaurante, incluindo texto e nota (1–5):
      1. Análise de sentimento geral.
      2. Resumo de pontos fortes e fracos.
      3. Sugestões de melhorias.
      4. Média das notas e visão de desempenho.
      5. Relatório profissional e estruturado.
      Desconsidere avaliações que não estejam relacionadas à experiência do cliente com o restaurante, como comentários irrelevantes, vazios ou fora de contexto.
      Seguem as avaliações:
      ${reviews
        .map(
          (r, i) =>
            `Avaliação ${i + 1}: "${r.review_text || 'Sem comentário'}" (${r.rating} estrelas)`
        )
        .join('\n')}
    `;

    // 3. Chama a API Gemini
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

    // 4. Salva no banco de dados
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO reports (restaurant_id, analysis, created_at)
         VALUES (?, ?, ?)`,
        [restaurantId, analysis, new Date().toISOString()],
        err => (err ? reject(err) : resolve())
      );
    });

    // 5. Se PDF, gera e envia o buffer
    if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="relatorio_analise_${restaurantId}.pdf"`
        );
        res.send(pdfData);
      });

      doc.fontSize(16).text('Relatório de Análise de Negócio', {
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

    // 6. Resposta JSON padrão
    res.status(200).json({ analysis });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: error.message || 'Erro interno ao gerar análise.' });
  }
};
