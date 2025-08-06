const validateReportId = require('../../middlewares/validateReportId');

describe('validateReportId middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('deve retornar 400 se o ID não for inserido', () => {
    validateReportId(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'ID do relatório é obrigatório.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve chamar next() se o ID for inserido', () => {
    req.body = { reportId: 123 };

    validateReportId(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});