const { pool } = require('../models/db');
const PDFDocument = require('pdfkit');

exports.getReportHistory = async (req, res) => {
  const { restaurantId } = req.query;

  const sql = `
    SELECT 
      id,
      created_at AS date
    FROM reports
    WHERE restaurant_id = $1
    ORDER BY created_at DESC
    LIMIT 10
  `;

  try {
    const { rows } = await pool.query(sql, [restaurantId]);
    res.json({ reports: rows });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: 'Erro interno no servidor.' });
  }
};

exports.downloadReport = async (req, res) => {
  const { reportId } = req.body;

  try {
    // Busca o relatório no banco
    const { rows: [report] } = await pool.query(
      `SELECT restaurant_id, analysis, created_at
       FROM reports
       WHERE id = $1`,
      [reportId]
    );

    if (!report) {
      return res
        .status(404)
        .json({ error: 'Relatório não encontrado.' });
    }

    // Gera PDF e retorna como anexo
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      const timestamp = report.created_at
        .replace(/:/g, '-')
        .replace(/ /g, '_');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="relatorio_${timestamp}.pdf"`
      );
      res.send(pdfData);
    });

    doc.fontSize(16).text('Relatório de Análise de Negócio', {
      align: 'center',
    });
    doc.moveDown();
    doc.fontSize(12).text(`Restaurante ID: ${report.restaurant_id}`);
    doc.text(
      `Gerado em: ${new Date(report.created_at).toLocaleString('pt-BR')}`
    );
    doc.moveDown();
    doc.text(report.analysis, { lineGap: 4 });
    doc.end();
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: 'Erro interno ao baixar relatório.' });
  }
};