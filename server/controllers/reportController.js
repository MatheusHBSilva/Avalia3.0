const { db } = require('../models/db');
const PDFDocument = require('pdfkit');

// Nome atualizado para clareza, mas a lógica é a sua
exports.getReportsHistory = (req, res) => {
  // MUDANÇA 1: Pegando o ID do cookie, não da query. É mais seguro.
  const restaurantId = req.cookies.restaurantId;

  const sql = `
    SELECT id, created_at FROM reports
    WHERE restaurant_id = ?
    ORDER BY created_at DESC
    LIMIT 10
  `;

  db.all(sql, [restaurantId], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar histórico de relatórios:", err);
      return res.status(500).json({ error: 'Erro interno no servidor.' });
    }
    // A resposta agora inclui a renomeação para created_at, como seu frontend espera
    const reports = rows.map(row => ({ id: row.id, created_at: row.created_at }));
    res.json({ reports });
  });
};

// Nome atualizado para getReportById para seguir o padrão RESTful
exports.getReportById = async (req, res) => {
  // Pegando os IDs da rota e do cookie
  const reportId = req.params.id;
  const restaurantId = req.cookies.restaurantId;

  try {
    // Busca o relatório no banco, garantindo que ele pertence ao restaurante logado
    const report = await new Promise((resolve, reject) => {
      const sql = `SELECT * FROM reports WHERE id = ? AND restaurant_id = ?`;
      db.get(sql, [reportId, restaurantId], (err, row) => (err ? reject(err) : resolve(row)));
    });

    if (!report) {
      return res.status(404).json({ error: 'Relatório não encontrado ou acesso não permitido.' });
    }

    // --- CORREÇÃO PRINCIPAL AQUI ---
    // Removemos a tentativa de JSON.parse() e usamos o texto puro da análise.
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="relatorio_${report.id}.pdf"`);
    doc.pipe(res);

    doc.fontSize(18).text('Relatório de Análise de Feedback', { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(12).text(`ID do Restaurante: ${report.restaurant_id}`);
    doc.text(`Gerado em: ${new Date(report.created_at).toLocaleString('pt-BR')}`);
    doc.moveDown(2);
    
    // Simplesmente escrevemos o texto completo da análise no PDF.
    doc.fontSize(12).text(report.analysis, { 
      align: 'justify',
      lineGap: 4 
    });
    
    doc.end();

  } catch (error) {
    console.error('Erro ao baixar/gerar relatório:', error);
    res.status(500).json({ error: 'Erro interno ao processar o relatório.' });
  }
};