const bcrypt = require('bcrypt');
const { pool } = require('../models/db');

exports.registerClient = async (req, res) => {
  const { nome, sobrenome, cpf, telefone, email, senha, tags } = req.body;

  try {
    // Verifica email ou CPF já cadastrado
    const { rows: [existingClient] } = await pool.query(
      'SELECT email FROM clients WHERE email = $1 OR cpf = $2',
      [email, cpf]
    );

    if (existingClient) {
      return res
        .status(400)
        .json({ error: 'Este email ou CPF já está registrado.' });
    }

    // Verifica se o cliente digitou o número mínimo de tags
    const tagsArray = tags
      ? tags.split(',').map(tag => tag.trim())
      : [];

    if (tagsArray.length < 5) {
      return res
        .status(400)
        .json({ error: 'É necessário informar no mínimo 5 tags.'});
    }

    // Hash da senha e inserção no BD
    const hashedPassword = await bcrypt.hash(senha, 10);
    await pool.query(
      `
      INSERT INTO clients
        (nome, sobrenome, cpf, telefone, email, senha, tags, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
      [
        nome,
        sobrenome,
        cpf,
        telefone,
        email,
        hashedPassword,
        tags || '',
        new Date().toISOString()
      ]
    );

    res.status(201).json({ message: 'Cadastro salvo com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};

exports.getCurrentClient = async (req, res) => {
  const clientId = req.cookies.clientId;
  
  try {
    const { rows: [row] } = await pool.query(
      'SELECT id, nome, sobrenome, email, tags FROM clients WHERE id = $1',
      [clientId]
    );

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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};