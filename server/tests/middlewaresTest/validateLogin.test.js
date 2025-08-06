const validateLogin = require('../../middlewares/validateLogin');

describe('validateLogin middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('deve retornar 400 se email ou senha estiverem ausentes', () => {
    validateLogin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Email e senha são obrigatórios.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve chamar next() se email e senha forem fornecidos', () => {
    req.body = { email: 'exemplo@teste.com', password: '123456' };

    validateLogin(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});