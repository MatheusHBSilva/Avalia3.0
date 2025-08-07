const bcrypt = require('bcrypt');
const { db } = require('../models/db');

exports.registerClient = async (req, res) => {
  const { nome, sobrenome, cpf, telefone, email, senha, tags } = req.body;

  try {
    const existingClient = await new Promise((resolve, reject) => {
      db.get(
        'SELECT email FROM clients WHERE email = ? OR cpf = ?',
        [email, cpf],
        (err, row) => (err ? reject(err) : resolve(row))
      );
    });

    if (existingClient) {
      return res
        .status(400)
        .json({ error: 'Este email ou CPF já está registrado.' });
    }

    const tagsArray = tags
      ? tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
      : [];

    if (tagsArray.length < 5) {
      return res
        .status(400)
        .json({ error: 'É necessário informar no mínimo 5 tags.'});
    }

    const hashedPassword = await bcrypt.hash(senha, 10);
    await new Promise((resolve, reject) => {
      db.run(
        `
        INSERT INTO clients
          (nome, sobrenome, cpf, telefone, email, senha, tags, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          nome,
          sobrenome,
          cpf,
          telefone,
          email,
          hashedPassword,
          tagsArray.join(','), // Salva como string separada por vírgulas
          new Date().toISOString()
        ],
        err => (err ? reject(err) : resolve())
      );
    });

    res.status(201).json({ message: 'Cadastro salvo com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};

exports.getCurrentClient = (req, res) => {
  const clientId = req.cookies.clientId;

  db.get(
    'SELECT id, nome, sobrenome, email, tags FROM clients WHERE id = ?',
    [clientId],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Erro interno no servidor.' });
      }
      if (!row) {
        return res.status(404).json({ error: 'Cliente não encontrado.' });
      }

      res.json({
        clientId:   row.id,
        nome:       row.nome,
        sobrenome:  row.sobrenome,
        email:      row.email,
        tags:       row.tags
                    ? row.tags.split(',').map(tag => tag.trim())
                    : []
      });
    }
  );
};

// Nova função para atualizar as tags do cliente
exports.updateClientTags = async (req, res) => {
  const { tags } = req.body;
  const clientId = req.cookies.clientId;

  if (!clientId) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }

  if (tags === undefined || tags === null) {
    return res.status(400).json({ error: 'As tags são obrigatórias.' });
  }

  // --- VALIDAÇÃO ADICIONADA AQUI ---
  // 1. Cria um array a partir da string de tags recebida
  const tagsArray = (typeof tags === 'string' ? tags.split(',') : [])
    .map(tag => tag.trim())
    .filter(tag => tag !== ''); // Remove tags vazias

  // 2. Verifica a quantidade de tags no array
  if (tagsArray.length < 5) {
    return res.status(400).json({ error: 'É necessário informar no mínimo 5 tags.' });
  }
  // --- FIM DA VALIDAÇÃO ---

  // 3. Junta o array de volta em uma string limpa para salvar no banco
  const processedTags = tagsArray.join(',');

  try {
    const result = await new Promise((resolve, reject) => {
      db.run('UPDATE clients SET tags = ? WHERE id = ?', [processedTags, clientId], function(err) {
        if (err) reject(err);
        else resolve(this);
      });
    });

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado ou tags não foram alteradas.' });
    }

    res.status(200).json({ message: 'Tags atualizadas com sucesso!', updatedTags: tagsArray });

  } catch (error) {
    console.error('Erro ao atualizar tags do cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao atualizar tags.' });
  }
};