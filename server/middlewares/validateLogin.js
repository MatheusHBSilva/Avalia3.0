function validateLogin(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: 'Email e senha são obrigatórios.' });
  }

  next();
}

module.exports = validateLogin;