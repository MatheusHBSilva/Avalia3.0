const bcrypt = require('bcrypt');
const { db } = require('../models/db');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verifica restaurante
    let user = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM restaurants WHERE email = ?',
        [email],
        (err, row) => (err ? reject(err) : resolve(row))
      );
    });

    if (user) {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        res.cookie('restaurantId', user.id, {
          httpOnly: true,
          sameSite: 'Lax',
          maxAge: 24 * 60 * 60 * 1000
        });
        return res
          .status(200)
          .json({
            message: 'Login realizado com sucesso!',
            userType: 'restaurant',
            redirect: '/dashboard.html'
          });
      }
    }

    // Verifica cliente
    user = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM clients WHERE email = ?',
        [email],
        (err, row) => (err ? reject(err) : resolve(row))
      );
    });

    if (user) {
      const match = await bcrypt.compare(password, user.senha);
      if (match) {
        res.cookie('clientId', user.id, {
          httpOnly: true,
          sameSite: 'Lax',
          maxAge: 24 * 60 * 60 * 1000
        });
        return res
          .status(200)
          .json({
            message: 'Login realizado com sucesso!',
            userType: 'client',
            redirect: '/client_dashboard.html'
          });
      }
    }

    return res
      .status(401)
      .json({ error: 'Email ou senha incorretos.' });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: 'Erro interno no servidor.' });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('clientId');
  res.clearCookie('restaurantId');
  res.status(200).json({ message: 'Logout realizado com sucesso!' });
};